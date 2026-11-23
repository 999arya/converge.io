/**
 * Game API Routes - tRPC endpoints for Converge game
 */

import { Hono } from 'hono';
import { context, redis } from '@devvit/web/server';
import type {
  GetPuzzleRequest,
  GetPuzzleResponse,
  SubmitGroupsRequest,
  SubmitGroupsResponse,
  GetStreakResponse,
  Puzzle,
  GameSession,
  GameScore,
} from '../../shared/gameTypes';
import {
  getPuzzle,
  getSession,
  submitAnswer,
  getStreak,
  getTodayPuzzleId,
  seedPuzzles,
} from '../core/puzzleStore';

type ErrorResponse = {
  status: 'error';
  message: string;
};

export const gameApi = new Hono();

/**
 * GET /api/game/puzzle
 * Get today's puzzle (or specific puzzle) and existing session
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

    // Return puzzle without revealing groups (hide isCorrectGroup, groups details)
    const safePuzzle: Puzzle = {
      ...puzzle,
      posts: puzzle.posts.map((p) => ({ ...p, isCorrectGroup: undefined })),
      groups: puzzle.groups.map((g) => ({
        ...g,
        postIds: [], // Hide post IDs until reveal
        subreddit: 'r/????', // Hide subreddit
        theme: '???', // Hide theme
      })),
      crossPollination: undefined,
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
 * POST /api/game/submit
 * Submit player's grouping and get score
 */
gameApi.post('/submit', async (c) => {
  const { postId, userId } = context;

  if (!postId || !userId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Authentication required' },
      401
    );
  }

  try {
    const body = await c.req.json<SubmitGroupsRequest>();
    const { puzzleId, playerGroups } = body;

    if (!puzzleId || !playerGroups) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Invalid request' },
        400
      );
    }

    // Validate: each post assigned to exactly one group
    const allPostIds = playerGroups.flatMap((g) => g.postIds);
    const uniquePostIds = new Set(allPostIds);
    if (allPostIds.length !== uniquePostIds.size) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Each post can only be in one group' },
        400
      );
    }

    const score = await submitAnswer(userId, puzzleId, playerGroups);
    const fullPuzzle = await getPuzzle(puzzleId);

    // Get updated session
    const { session } = await getSession(userId, puzzleId);

    return c.json<SubmitGroupsResponse>({
      score,
      puzzle: fullPuzzle!,
      session: session!,
    });
  } catch (error) {
    console.error('Submit error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to submit answer' },
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

    // Get flair tier
    const tiers = [
      { min: 30, tier: 'Converger', label: '✨ Converger' },
      { min: 14, tier: 'Cartographer', label: '🗺️ Cartographer' },
      { min: 7, tier: 'Connector', label: '🔗 Connector' },
      { min: 3, tier: 'Seeker', label: '🔍 Seeker' },
      { min: 0, tier: 'Novice', label: '🔰 Novice' },
    ] as const;

    const flair = tiers.find((t) => streak >= t.min) ?? tiers[4];

    return c.json<GetStreakResponse>({
      streak,
      flairTier: flair.tier,
      totalPlayed: 0, // Could track separately
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
  // In production, check if user is moderator of the subreddit
  // For now, allow any authenticated user to seed
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