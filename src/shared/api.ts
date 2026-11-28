/**
 * Shared API Types
 * Used by both client and server for typed request/response shapes.
 */

import type {
  GameScore,
  PublicGameSession,
  PublicPuzzle,
  PublicStage2Answer,
  Puzzle,
} from './gameTypes';

export type InitResponse = {
  type: 'init';
  postId: string;
  count: number;
  username: string;
};

export type IncrementResponse = {
  type: 'increment';
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: 'decrement';
  postId: string;
  count: number;
};

export type GetPuzzleRequest = {
  puzzleId?: string;
};

export type GetPuzzleResponse = {
  puzzle: PublicPuzzle;
  session?: PublicGameSession;
  streak: number;
  totalCompleted: number;
  lifetimeStars: number;
  flairTier: string;
};

export type Stage1Request = {
  puzzleId: string;
  selectedPostIds: string[];
};

export type Stage1Feedback = {
  correctCount: number;
  attempts: number;
  canRetry: boolean;
  failed: boolean;
};

export type Stage1Response = {
  success: boolean;
  correct: boolean;
  feedback: Stage1Feedback;
  session: PublicGameSession;
};

export type Stage2Request = {
  puzzleId: string;
  postId: string;
  selectedSubreddit: string;
};

export type Stage2Response = {
  answer: PublicStage2Answer;
  questionIndex: number;
  totalAnswers: number;
  complete: boolean;
  session: PublicGameSession;
};

export type FinalizeRequest = {
  puzzleId: string;
};

export type FinalizeResponse = {
  score: GameScore;
  puzzle: Puzzle;
  session: PublicGameSession;
};

export type GetStreakResponse = {
  streak: number;
  flairTier: string;
  totalCompleted: number;
  lifetimeStars: number;
};

export type SeedPuzzlesResponse = {
  success: boolean;
  message: string;
};

export type ErrorResponse = {
  status: 'error';
  message: string;
};
