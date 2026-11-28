/**
 * Game API Routes - Hono endpoints for Converge's 2-stage game.
 */

import { Hono } from 'hono';
import { context, reddit } from '@devvit/web/server';
import type {
  ErrorResponse,
  FinalizeRequest,
  FinalizeResponse,
  GetPuzzleResponse,
  GetStreakResponse,
  Stage1Request,
  Stage1Response,
  Stage2Request,
  Stage2Response,
} from '../../shared/api';
import type {
  PublicConnection,
  PublicPuzzle,
  PublicPuzzlePost,
  PublicSubredditQuestion,
} from '../../shared/gameTypes';
import {
  calculateScore,
  getPuzzle,
  getSession,
  getStreak,
  getTodayPuzzleId,
  seedPuzzles,
  submitStage1,
  submitStage2,
} from '../core/puzzleStore';

export const gameApi = new Hono();

function requireContext(): { userId: string; postId: string } | null {
  const { postId, userId } = context;
  if (!postId || !userId) return null;
  return { postId, userId };
}

async function isModeratorUser(userId: string): Promise<boolean> {
  try {
    const ctx = context as Record<string, unknown>;
    if (ctx.isModerator === true || ctx.userRole === 'moderator' || ctx.userRole === 'admin') {
      return true;
    }
    if (ctx.subredditName && typeof ctx.subredditName === 'string' && reddit?.getModerators) {
      const username = await reddit.getCurrentUsername();
      if (username) {
        const moderators = await reddit.getModerators({ subredditName: ctx.subredditName }).all();
        if (
          moderators.some(
            (m) =>
              (m.username && m.username.toLowerCase() === username.toLowerCase()) ||
              m.id === userId
          )
        ) {
          return true;
        }
      }
    }
  } catch (error) {
    console.warn('Moderator check error:', error);
  }
  return false;
}

gameApi.get('/puzzle', async (c) => {
  const auth = requireContext();
  if (!auth) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Authentication required' },
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

    const isModerator = await isModeratorUser(auth.userId);
    const { session } = await getSession(auth.userId, puzzleId);
    if (session) {
      session.isModerator = isModerator;
      session.maxAttempts = isModerator ? 999 : 3;
    }
    const progress = await getStreak(auth.userId);

    const safePosts: PublicPuzzlePost[] = puzzle.posts.map((post) => ({
      ...post,
      subreddit: 'r/????',
      isConnected: undefined,
    }));

    const safeConnection: PublicConnection = {
      theme: '???',
      explanation: '???',
      connectedPostIds: [],
      distractorPostIds: [],
    };

    const safeQuestions: PublicSubredditQuestion[] = puzzle.subredditQuestions.map((question) => ({
      postId: question.postId,
      options: [...question.options],
      correctSubreddit: undefined,
    }));

    const publicPuzzle: PublicPuzzle = {
      ...puzzle,
      posts: safePosts,
      connection: safeConnection,
      subredditQuestions: safeQuestions,
    };

    return c.json<GetPuzzleResponse>({
      puzzle: publicPuzzle,
      session: session ?? undefined,
      streak: progress.streak,
      totalCompleted: progress.totalCompleted,
      flairTier: progress.flairTier,
      isModerator,
      maxAttempts: isModerator ? 999 : 3,
    });
  } catch (error) {
    console.error('Get puzzle error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to load puzzle' },
      500
    );
  }
});

gameApi.post('/stage1', async (c) => {
  const auth = requireContext();
  if (!auth) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Authentication required' },
      401
    );
  }

  try {
    const body = await c.req.json<Stage1Request>();
    const { puzzleId, selectedPostIds } = body;

    if (
      !puzzleId ||
      !Array.isArray(selectedPostIds) ||
      selectedPostIds.length !== 3 ||
      new Set(selectedPostIds).size !== 3
    ) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Select exactly 3 different posts' },
        400
      );
    }

    const isModerator = await isModeratorUser(auth.userId);
    const result = await submitStage1(auth.userId, puzzleId, selectedPostIds, isModerator);
    return c.json<Stage1Response>({
      success: result.success,
      correct: result.correct,
      feedback: result.feedback,
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

gameApi.post('/stage2', async (c) => {
  const auth = requireContext();
  if (!auth) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Authentication required' },
      401
    );
  }

  try {
    const body = await c.req.json<Stage2Request>();
    const { puzzleId, postId, selectedSubreddit } = body;

    if (!puzzleId || !postId || !selectedSubreddit) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Invalid request' },
        400
      );
    }

    const result = await submitStage2(auth.userId, puzzleId, postId, selectedSubreddit);
    return c.json<Stage2Response>({
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

gameApi.post('/finalize', async (c) => {
  const auth = requireContext();
  if (!auth) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Authentication required' },
      401
    );
  }

  try {
    const body = await c.req.json<FinalizeRequest>();
    const { puzzleId } = body;

    if (!puzzleId) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'puzzleId required' },
        400
      );
    }

    const score = await calculateScore(auth.userId, puzzleId);
    const puzzle = await getPuzzle(puzzleId);
    if (!puzzle) {
      return c.json<ErrorResponse>(
        { status: 'error', message: 'Puzzle not found' },
        404
      );
    }
    const { session } = await getSession(auth.userId, puzzleId);

    return c.json<FinalizeResponse>({
      score,
      puzzle,
      session: session ?? {
        puzzleId,
        stage: 'COMPLETED',
        selectedPostIds: [],
        stage1Attempts: 0,
        stage1Correct: false,
        stage2Answers: [],
        stage2CurrentQuestion: 0,
        startedAt: Date.now(),
        score,
      },
    });
  } catch (error) {
    console.error('Finalize error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to finalize' },
      500
    );
  }
});

gameApi.get('/streak', async (c) => {
  const { userId } = context;
  if (!userId) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'User not authenticated' },
      401
    );
  }

  try {
    const progress = await getStreak(userId);
    return c.json<GetStreakResponse>({
      streak: progress.streak,
      flairTier: progress.flairTier,
      totalCompleted: progress.totalCompleted,
    });
  } catch (error) {
    console.error('Streak error:', error);
    return c.json<ErrorResponse>(
      { status: 'error', message: 'Failed to get streak' },
      500
    );
  }
});

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
