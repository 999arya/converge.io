/**
 * Shared API Types
 * Used by both client and server for type-safe communication
 */

import type { Puzzle, GameSession, GameScore, PlayerGroup } from './gameTypes';

// Legacy counter types (kept for reference)
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

// Game API Types
export type GetPuzzleRequest = {
  puzzleId?: string;
};

export type GetPuzzleResponse = {
  puzzle: Puzzle;
  session?: GameSession;
};

export type SubmitGroupsRequest = {
  puzzleId: string;
  playerGroups: PlayerGroup[];
};

export type SubmitGroupsResponse = {
  score: GameScore;
  puzzle: Puzzle;
  session: GameSession;
};

export type GetStreakResponse = {
  streak: number;
  flairTier: string;
  totalPlayed: number;
};

export type SeedPuzzlesResponse = {
  success: boolean;
  message: string;
};

export type ErrorResponse = {
  status: 'error';
  message: string;
};