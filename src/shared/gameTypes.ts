/**
 * Converge Game Types
 * Core type definitions for the daily puzzle game
 */

// A single Reddit post used in the puzzle
export interface PuzzlePost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  score: number;
  thumbnailUrl?: string;
  permalink: string;
  isCorrectGroup: number; // 0, 1, 2 for which group this belongs to
}

// A group of related posts (the hidden connection)
export interface PuzzleGroup {
  id: number; // 0, 1, 2
  theme: string; // e.g., "Fermentation & Temperature"
  subreddit: string; // The actual subreddit name (revealed on solve)
  postIds: string[]; // IDs of posts in this group
  description: string; // Brief explanation shown on reveal
}

// Complete puzzle definition
export interface Puzzle {
  id: string; // e.g., "2024-11-13"
  date: string; // ISO date string
  posts: PuzzlePost[];
  groups: PuzzleGroup[];
  crossPollination?: {
    postId: string;
    connectsGroups: number[]; // Groups this post bridges
    bonusDescription: string;
  }[];
}

// Player's grouping attempt
export interface PlayerGroup {
  groupId: number; // Which group the player assigned (0, 1, 2)
  postIds: string[];
}

// Game state for a player's session
export interface GameSession {
  puzzleId: string;
  playerGroups: PlayerGroup[];
  startedAt: number;
  submittedAt?: number;
  score?: GameScore;
  streak?: number;
}

// Scoring result
export interface GameScore {
  correctGroups: number; // 0-3
  totalGroups: number; // 3
  correctPosts: number;
  totalPosts: number;
  crossPollinationFound: boolean;
  streak: number;
  flairTier: string;
}

// API request/response types
export interface GetPuzzleRequest {
  puzzleId?: string; // Optional, defaults to today
}

export interface GetPuzzleResponse {
  puzzle: Puzzle;
  session?: GameSession; // Existing session if player already started
}

export interface SubmitGroupsRequest {
  puzzleId: string;
  playerGroups: PlayerGroup[];
}

export interface SubmitGroupsResponse {
  score: GameScore;
  puzzle: Puzzle; // Full puzzle with groups revealed
  session: GameSession;
}

export interface GetStreakResponse {
  streak: number;
  flairTier: string;
  totalPlayed: number;
}

// Flair tiers based on streak
export const FLAIR_TIERS = [
  { minStreak: 0, tier: 'Novice', label: '🔰 Novice' },
  { minStreak: 3, tier: 'Seeker', label: '🔍 Seeker' },
  { minStreak: 7, tier: 'Connector', label: '🔗 Connector' },
  { minStreak: 14, tier: 'Cartographer', label: '🗺️ Cartographer' },
  { minStreak: 30, tier: 'Converger', label: '✨ Converger' },
] as const;

export type FlairTier = typeof FLAIR_TIERS[number]['tier'];

// Helper to get flair tier from streak
export function getFlairTier(streak: number): FlairTier {
  for (let i = FLAIR_TIERS.length - 1; i >= 0; i--) {
    if (streak >= FLAIR_TIERS[i].minStreak) {
      return FLAIR_TIERS[i].tier;
    }
  }
  return FLAIR_TIERS[0].tier;
}