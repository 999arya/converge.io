/**
 * Game API Routes - Hono endpoints for Converge's 2-stage game.
 */

import { Hono } from 'hono';
import { context } from '@devvit/web/server';
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
  toPublicSession,
} from '../core/puzzleStore';

export const gameApi = new Hono();

function requireContext(): { userId: string; postId: string } | null {
  const { postId, userId } = context;
  if (!postId || !userId) return null;
  return { postId, userId };
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

    const { session } = await getSession(auth.userId, puzzleId);
    const progress = await getStreak(auth.userId);

    const safePosts: PublicPuzzlePost[] = puzzle.posts.map((post) => ({
      ...post,
      subreddit: 'r/????',
      isConnected: undefined,
    }));

    const safeConnection: PublicConnection = {
      theme: '???',
      explanation: '???',
      hint: puzzle.connection.hint,
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
      session: session ? toPublicSession(session) : undefined,
      streak: progress.streak,
      totalCompleted: progress.totalCompleted,
      lifetimeStars: progress.lifetimeStars,
      flairTier: progress.flairTier,
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

    const result = await submitStage1(auth.userId, puzzleId, selectedPostIds);
    return c.json<Stage1Response>({
      success: result.success,
      correct: result.correct,
      feedback: result.feedback,
      session: toPublicSession(result.session),
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
      answer: {
        postId: result.answer.postId,
        selectedSubreddit: result.answer.selectedSubreddit,
        lockedAt: result.answer.lockedAt,
      },
      questionIndex: result.questionIndex,
      totalAnswers: result.totalAnswers,
      complete: result.complete,
      session: toPublicSession(result.session),
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

    const completedSession = session ?? {
      puzzleId,
      stage: 'COMPLETED' as const,
      selectedPostIds: [],
      stage1Attempts: 0,
      stage1Correct: false,
      stage2Answers: [],
      stage2CurrentQuestion: 0,
      startedAt: Date.now(),
      score,
    };

    return c.json<FinalizeResponse>({
      score,
      puzzle,
      session: toPublicSession(completedSession),
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
      lifetimeStars: progress.lifetimeStars,
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
