/**
 * Game API Routes - tRPC endpoints for Converge game (New 5-Post, 2-Stage Spec)
 */

import { Hono } from 'hono';
import { context } from '@devvit/web/server';
import type {
  GetPuzzleResponse,
  GetStreakResponse,
  ErrorResponse,
} from '../../shared/api';
import type { Puzzle } from '../../shared/gameTypes';
import {
  getPuzzle,
  getSession,
  submitStage1,
  submitStage2,
  calculateScore,
  getStreak,
  getTodayPuzzleId,
  seedPuzzles,
} from '../core/puzzleStore';

export const gameApi = new Hono();

/**
 * GET /api/game/puzzle
 * Get today's puzzle (or specific puzzle) and existing session
 * Returns puzzle with posts but hides subreddit names and connection info
 */
gameApi.get('/puzzle', async (c) => {
  const { postId, userId } = context;

  if (!postId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'postId required' },
      400
    );
  }

  if (!userId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'User not authenticated' },
      401
    );
  }

  try {
    const puzzleId = c.req.query('puzzleId') ?? getTodayPuzzleId();
    const puzzle = await getPuzzle(puzzleId);

    if (!puzzle) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Puzzle not found' },
        404
      );
    }

    // Check for existing session
    const { session } = await getSession(userId, puzzleId);

    // Return puzzle without revealing subreddits or connection info
    const safePosts = puzzle.posts.map((p) => ({ 
      ...p, 
      isConnected: undefined, // Hide connection info
      subreddit: 'r/????' // Hide subreddit
    }));
    const safeConnection = {
      ...puzzle.connection,
      theme: '???',
      explanation: '???',
      connectedPostIds: [],
      distractorPostIds: [],
    };
    const safeQuestions = puzzle.subredditQuestions.map((q) => ({
      ...q,
      correctSubreddit: '???',
      options: q.options.map(() => '???'),
    }));
    const safePuzzle: Puzzle = {
      ...puzzle,
      posts: safePosts,
      connection: safeConnection,
      subredditQuestions: safeQuestions,
    };

    return c.json<GetPuzzleResponse>({
      puzzle: safePuzzle,
      session: session ?? undefined,
    });
  } catch (error) {
    console.error('Get puzzle error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to load puzzle' },
      500
    );
  }
});

/**
 * POST /api/game/stage1
 * Submit Stage 1 answer (selected 3 post IDs)
 */
gameApi.post('/stage1', async (c) => {
  const { postId, userId } = context;

  if (!postId || !userId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Authentication required' },
      401
    );
  }

  try {
    const body = await c.req.json<{ puzzleId: string; selectedPostIds: string[] }>();
    const { puzzleId, selectedPostIds } = body;

    if (!puzzleId || !selectedPostIds || selectedPostIds.length !== 3) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Must select exactly 3 posts' },
        400
      );
    }

    const result = await submitStage1(userId, puzzleId, selectedPostIds);

    return c.json({
      success: result.success,
      correct: result.correct,
      attempts: result.attempts,
      session: result.session,
    });
  } catch (error) {
    console.error('Stage 1 submit error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to submit Stage 1' },
      500
    );
  }
});

/**
 * POST /api/game/stage2
 * Submit Stage 2 answer (subreddit guess for a post)
 */
gameApi.post('/stage2', async (c) => {
  const { postId: ctxPostId, userId } = context;

  if (!ctxPostId || !userId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Authentication required' },
      401
    );
  }

  try {
    const body = await c.req.json<{ puzzleId: string; postId: string; selectedSubreddit: string }>();
    const { puzzleId, postId, selectedSubreddit } = body;

    if (!puzzleId || !postId || !selectedSubreddit) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Invalid request' },
        400
      );
    }

    const result = await submitStage2(userId, puzzleId, postId, selectedSubreddit);

    return c.json({
      correct: result.correct,
      answer: result.answer,
      nextQuestion: result.nextQuestion,
      session: result.session,
    });
  } catch (error) {
    console.error('Stage 2 submit error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to submit Stage 2' },
      500
    );
  }
});

/**
 * POST /api/game/finalize
 * Calculate final score after Stage 2 completion
 */
gameApi.post('/finalize', async (c) => {
  const { userId } = context;

  if (!userId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Authentication required' },
      401
    );
  }

  try {
    const body = await c.req.json<{ puzzleId: string }>();
    const { puzzleId } = body;

    if (!puzzleId) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'puzzleId required' },
        400
      );
    }

    const score = await calculateScore(userId, puzzleId);
    const puzzle = await getPuzzle(puzzleId);
    const { session } = await getSession(userId, puzzleId);

    return c.json({
      score,
      puzzle: puzzle!,
      session: session!,
    });
  } catch (error) {
    console.error('Finalize error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to finalize' },
      500
    );
  }
});

/**
 * GET /api/game/streak
 * Get current user's streak and flair
 */
gameApi.get('/streak', async (c) => {
  const { userId } = context;

  if (!userId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'User not authenticated' },
      401
    );
  }

  try {
    const streak = await getStreak(userId);

    const tiers = [
      { min: 60, tier: 'Converger', label: '✨ Converger' },
      { min: 30, tier: 'Community Explorer', label: '🗺️ Community Explorer' },
      { min: 15, tier: 'Pattern Seeker', label: '🔍 Pattern Seeker' },
      { min: 5, tier: 'Connector', label: '🔗 Connector' },
      { min: 0, tier: 'Novice', label: '🔰 Novice' },
    ] as const;

    const flair = tiers.find((t) => streak >= t.min) ?? tiers[4];

    return c.json<GetStreakResponse>({
      streak,
      flairTier: flair.tier,
      totalPlayed: 0,
    });
  } catch (error) {
    console.error('Streak error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to get streak' },
      500
    );
  }
});

/**
 * POST /api/game/seed (admin only - for initial setup)
 */
gameApi.post('/seed', async (c) => {
  const { userId } = context;
  if (!userId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Authentication required' },
      401
    );
  }

  try {
    await seedPuzzles();
    return c.json({ success: true, message: 'Puzzles seeded' });
  } catch (error) {
    console.error('Seed error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to seed puzzles' },
      500
    );
  }
});