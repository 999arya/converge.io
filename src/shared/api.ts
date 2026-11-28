/**
 * Shared API Types
 * Used by both client and server for typed request/response shapes.
 */

import type {
  GameScore,
  GameSession,
  PublicPuzzle,
  Puzzle,
  Stage2Answer,
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
  session?: GameSession;
  streak: number;
  totalCompleted: number;
  flairTier: string;
  isModerator?: boolean;
  maxAttempts?: number;
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
  maxAttempts?: number;
  isModerator?: boolean;
};

export type Stage1Response = {
  success: boolean;
  correct: boolean;
  feedback: Stage1Feedback;
  session: GameSession;
};

export type Stage2Request = {
  puzzleId: string;
  postId: string;
  selectedSubreddit: string;
};

export type Stage2Response = {
  correct: boolean;
  answer: Stage2Answer;
  nextQuestion: number;
  session: GameSession;
};

export type FinalizeRequest = {
  puzzleId: string;
};

export type FinalizeResponse = {
  score: GameScore;
  puzzle: Puzzle;
  session: GameSession;
};

export type GetStreakResponse = {
  streak: number;
  flairTier: string;
  totalCompleted: number;
};

export type SeedPuzzlesResponse = {
  success: boolean;
  message: string;
};

export type ErrorResponse = {
  status: 'error';
  message: string;
};
