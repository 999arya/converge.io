/**
 * useGame Hook - Client state for Converge's 2-stage game.
 */

import { useCallback, useEffect, useState } from 'react';
import type {
  ErrorResponse,
  FinalizeResponse,
  GetPuzzleResponse,
  GetStreakResponse,
  Stage1Feedback,
  Stage1Response,
  Stage2Response,
} from '../../shared/api';
import type {
  GameScore,
  GameState,
  PublicGameSession,
  PublicPuzzle,
  Puzzle,
} from '../../shared/gameTypes';

type GameStateData = {
  puzzle: PublicPuzzle | Puzzle | null;
  session: PublicGameSession | null;
  score: GameScore | null;
  streak: number;
  totalCompleted: number;
  flairTier: string;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  selectedPostIds: string[];
  stage1Feedback: Stage1Feedback | null;
};

const INITIAL_STATE: GameStateData = {
  puzzle: null,
  session: null,
  score: null,
  streak: 0,
  totalCompleted: 0,
  flairTier: 'Novice',
  loading: true,
  submitting: false,
  error: null,
  selectedPostIds: [],
  stage1Feedback: null,
};

function deriveGameState(session: PublicGameSession | null, loading: boolean): GameState {
  if (loading || !session) return 'INTRO';
  if (session.completedAt || session.stage === 'COMPLETED') return 'COMPLETED';

  if (!session.stage1Correct) {
    return session.stage1Attempts > 0 ? 'STAGE_1_SECOND_CHANCE' : 'STAGE_1_READY';
  }

  return session.stage === 'RESULTS' ? 'RESULTS' : 'STAGE_2_READY';
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data: ErrorResponse = await response.json();
    return data.message || fallback;
  } catch {
    return fallback;
  }
}

export const useGame = () => {
  const [state, setState] = useState<GameStateData>(INITIAL_STATE);

  const loadGame = useCallback(async () => {
    setState({ ...INITIAL_STATE });

    try {
      const puzzleResponse = await fetch('/api/game/puzzle');
      if (!puzzleResponse.ok) {
        throw new Error(await readErrorMessage(puzzleResponse, 'Failed to load puzzle'));
      }

      const data: GetPuzzleResponse = await puzzleResponse.json();
      let activePuzzle: PublicPuzzle | Puzzle = data.puzzle;
      let activeSession = data.session ?? null;
      let activeScore: GameScore | null = null;

      if (activeSession?.completedAt) {
        const finalizeResponse = await fetch('/api/game/finalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ puzzleId: activePuzzle.id }),
        });
        if (finalizeResponse.ok) {
          const finalized: FinalizeResponse = await finalizeResponse.json();
          activePuzzle = finalized.puzzle;
          activeSession = finalized.session;
          activeScore = finalized.score;
        }
      }

      setState((prev) => ({
        ...prev,
        puzzle: activePuzzle,
        session: activeSession,
        score: activeScore,
        streak: data.streak,
        totalCompleted: data.totalCompleted,
        flairTier: data.flairTier,
        selectedPostIds: activeSession?.selectedPostIds ?? [],
        loading: false,
        error: null,
      }));

      try {
        const streakResponse = await fetch('/api/game/streak');
        if (streakResponse.ok) {
          const streakData: GetStreakResponse = await streakResponse.json();
          setState((prev) => ({
            ...prev,
            streak: streakData.streak,
            totalCompleted: streakData.totalCompleted,
            flairTier: streakData.flairTier,
          }));
        }
      } catch (error) {
        console.error('Failed to load streak:', error);
      }
    } catch (error) {
      console.error('Failed to load puzzle:', error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load puzzle. Please refresh.',
      }));
    }
  }, []);

  useEffect(() => {
    void loadGame();
  }, [loadGame]);

  const gameState = deriveGameState(state.session, state.loading);

  const togglePostSelection = useCallback(
    (postId: string) => {
      if (
        gameState !== 'STAGE_1_READY' &&
        gameState !== 'STAGE_1_FIRST_SUBMISSION' &&
        gameState !== 'STAGE_1_SECOND_CHANCE'
      ) {
        return;
      }

      setState((prev) => {
        const alreadySelected = prev.selectedPostIds.includes(postId);
        if (alreadySelected) {
          return {
            ...prev,
            selectedPostIds: prev.selectedPostIds.filter((id) => id !== postId),
          };
        }
        if (prev.selectedPostIds.length >= 3) return prev;
        return {
          ...prev,
          selectedPostIds: [...prev.selectedPostIds, postId],
        };
      });
    },
    [gameState]
  );

  const isPostSelected = useCallback(
    (postId: string) => state.selectedPostIds.includes(postId),
    [state.selectedPostIds]
  );

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedPostIds: [] }));
  }, []);

  const submitStage1 = useCallback(async () => {
    const puzzle = state.puzzle;
    if (!puzzle || state.selectedPostIds.length !== 3) return;

    setState((prev) => ({ ...prev, submitting: true, error: null }));
    try {
      const response = await fetch('/api/game/stage1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puzzleId: puzzle.id,
          selectedPostIds: state.selectedPostIds,
        }),
      });
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Failed to submit selection'));
      }

      const data: Stage1Response = await response.json();
      setState((prev) => ({
        ...prev,
        session: data.session,
        selectedPostIds: data.session.selectedPostIds,
        stage1Feedback: data.feedback,
        submitting: false,
      }));
    } catch (error) {
      console.error('Stage 1 submit failed:', error);
      setState((prev) => ({
        ...prev,
        submitting: false,
        error: error instanceof Error ? error.message : 'Failed to submit selection.',
      }));
    }
  }, [state.puzzle, state.selectedPostIds]);

  const finalizeGame = useCallback(async () => {
    const puzzle = state.puzzle;
    if (!puzzle) return;

    setState((prev) => ({ ...prev, submitting: true, error: null }));
    try {
      const response = await fetch('/api/game/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puzzleId: puzzle.id }),
      });
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Failed to finalize puzzle'));
      }

      const data: FinalizeResponse = await response.json();
      setState((prev) => ({
        ...prev,
        puzzle: data.puzzle,
        session: data.session,
        score: data.score,
        streak: data.score.streak,
        totalCompleted: data.score.totalCompleted,
        flairTier: data.score.flairTier,
        submitting: false,
      }));
    } catch (error) {
      console.error('Finalize failed:', error);
      setState((prev) => ({
        ...prev,
        submitting: false,
        error: error instanceof Error ? error.message : 'Failed to show results.',
      }));
    }
  }, [state.puzzle]);

  const submitStage2 = useCallback(
    async (postId: string, selectedSubreddit: string) => {
      const puzzle = state.puzzle;
      const session = state.session;
      if (!puzzle || !session || !session.stage1Correct) return;

      const question = puzzle.subredditQuestions.find((item) => item.postId === postId);
      if (!question) return;

      setState((prev) => ({ ...prev, submitting: true, error: null }));
      try {
        const response = await fetch('/api/game/stage2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            puzzleId: puzzle.id,
            postId,
            selectedSubreddit,
          }),
        });
        if (!response.ok) {
          throw new Error(await readErrorMessage(response, 'Failed to submit answer'));
        }

        const data: Stage2Response = await response.json();
        setState((prev) => ({
          ...prev,
          session: data.session,
          submitting: false,
        }));
      } catch (error) {
        console.error('Stage 2 submit failed:', error);
        setState((prev) => ({
          ...prev,
          submitting: false,
          error: error instanceof Error ? error.message : 'Failed to submit answer.',
        }));
      }
    },
    [state.puzzle, state.session]
  );

  return {
    puzzle: state.puzzle,
    session: state.session,
    score: state.score,
    streak: state.streak,
    totalCompleted: state.totalCompleted,
    flairTier: state.flairTier,
    loading: state.loading,
    submitting: state.submitting,
    error: state.error,
    selectedPostIds: state.selectedPostIds,
    stage1Feedback: state.stage1Feedback,
    gameState,
    togglePostSelection,
    isPostSelected,
    clearSelection,
    submitStage1,
    submitStage2,
    finalizeGame,
    reloadGame: loadGame,
  };
};
