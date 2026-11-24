/**
 * Converge Game Types - New 5-Post, 2-Stage Specification
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
  content?: string; // Self-text or media description
  isConnected?: boolean; // Whether this is one of the 3 connected posts (hidden from player)
}

// The hidden connection between the 3 posts
export interface Connection {
  theme: string; // e.g., "Fermentation and Temperature Control"
  explanation: string; // Detailed explanation shown on reveal
  connectedPostIds: string[]; // IDs of the 3 connected posts
  distractorPostIds: string[]; // IDs of the 2 distractor posts
}

// Complete puzzle definition
export interface Puzzle {
  id: string; // e.g., "2024-11-13"
  date: string; // ISO date string
  posts: PuzzlePost[]; // 5 posts total
  connection: Connection; // Hidden connection data
  subredditQuestions: SubredditQuestion[]; // 3 questions, one per connected post
}

// Subreddit identification question
export interface SubredditQuestion {
  postId: string; // The connected post this question is about
  correctSubreddit: string; // The actual subreddit
  options: string[]; // 3 options, exactly 1 correct
}

// Player's grouping attempt (for backward compatibility with API)
export interface PlayerGroup {
  groupId: number; // Which group the player assigned (0, 1, 2)
  postIds: string[];
}

// Player's game session
export interface GameSession {
  puzzleId: string;
  stage: 'STAGE_1' | 'STAGE_2' | 'RESULTS';
  selectedPostIds: string[]; // Player's current selection (max 3)
  stage1Attempts: number; // 1 or 2
  stage1Correct: boolean; // Whether Stage 1 was solved
  stage2Answers: Stage2Answer[]; // Player's subreddit guesses
  stage2CurrentQuestion: number; // 0, 1, 2, or 3 (complete)
  startedAt: number;
  completedAt?: number;
  score?: GameScore;
  streak?: number;
}

// Player's answer to a subreddit question
export interface Stage2Answer {
  postId: string;
  selectedSubreddit: string;
  isCorrect: boolean;
  lockedAt: number;
}

// Scoring result
export interface GameScore {
  connectionSolved: boolean;
  correctSubredditGuesses: number; // 0-3
  starsEarned: number; // 0-3
  streak: number;
  flairTier: string;
}

// Flair tiers based on streak
export const FLAIR_TIERS = [
  { minStreak: 0, tier: 'Novice', label: 'Novice', minPuzzles: 0 },
  { minStreak: 1, tier: 'Connector', label: 'Connector', minPuzzles: 5 },
  { minStreak: 7, tier: 'Pattern Seeker', label: 'Pattern Seeker', minPuzzles: 15 },
  { minStreak: 14, tier: 'Community Explorer', label: 'Community Explorer', minPuzzles: 30 },
  { minStreak: 30, tier: 'Converger', label: 'Converger', minPuzzles: 60 },
] as const;

export type FlairTier = typeof FLAIR_TIERS[number]['tier'];

// Helper to get flair tier from streak
export function getFlairTier(streak: number): FlairTier {
  for (let i = FLAIR_TIERS.length - 1; i >= 0; i--) {
    const tier = FLAIR_TIERS[i];
    if (tier && streak >= tier.minStreak) {
      return tier.tier;
    }
  }
  return FLAIR_TIERS[0].tier;
}

// Game states for explicit state management
export type GameState = 
  | 'INTRO'
  | 'STAGE_1_READY'
  | 'STAGE_1_FIRST_SUBMISSION'
  | 'STAGE_1_SECOND_CHANCE'
  | 'STAGE_1_SUCCESS'
  | 'STAGE_1_FAILED'
  | 'STAGE_2_READY'
  | 'STAGE_2_QUESTION_2'
  | 'STAGE_2_QUESTION_3'
  | 'RESULTS'
  | 'COMPLETED';

// Helper to get today's puzzle ID
export function getTodayPuzzleId(): string {
  const now = new Date();
  const isoString = now.toISOString();
  const parts = isoString.split('T');
  const datePart = parts[0];
  return datePart ?? '2024-01-01';
}