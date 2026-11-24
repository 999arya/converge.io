/**
 * Converge Game Types - 5-Post, 2-Stage Specification
 * Core type definitions shared by client and server.
 */

export type PuzzlePost = {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  score: number;
  thumbnailUrl?: string;
  permalink: string;
  content?: string;
  isConnected?: boolean;
};

export type Connection = {
  theme: string;
  explanation: string;
  connectedPostIds: string[];
  distractorPostIds: string[];
};

export type Puzzle = {
  id: string;
  date: string;
  posts: PuzzlePost[];
  connection: Connection;
  subredditQuestions: SubredditQuestion[];
};

export type SubredditQuestion = {
  postId: string;
  correctSubreddit: string;
  options: string[];
};

export type PublicPuzzlePost = Omit<PuzzlePost, 'subreddit' | 'isConnected'> & {
  subreddit: string;
  isConnected?: undefined;
};

export type PublicSubredditQuestion = Omit<SubredditQuestion, 'correctSubreddit'> & {
  correctSubreddit?: undefined;
};

export type DisplaySubredditQuestion = SubredditQuestion | PublicSubredditQuestion;

export type PublicConnection = Connection;

export type PublicPuzzle = Omit<Puzzle, 'posts' | 'connection' | 'subredditQuestions'> & {
  posts: PublicPuzzlePost[];
  connection: Connection;
  subredditQuestions: PublicSubredditQuestion[];
};

export type PlayerGroup = {
  groupId: number;
  postIds: string[];
};

export type Stage2Answer = {
  postId: string;
  selectedSubreddit: string;
  isCorrect: boolean;
  lockedAt: number;
};

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

export type GameSession = {
  puzzleId: string;
  stage: GameState;
  selectedPostIds: string[];
  stage1Attempts: number;
  stage1Correct: boolean;
  stage2Answers: Stage2Answer[];
  stage2CurrentQuestion: number;
  startedAt: number;
  completedAt?: number;
  score?: GameScore;
  streak?: number;
};

export type GameScore = {
  connectionSolved: boolean;
  correctSubredditGuesses: number;
  starsEarned: number;
  streak: number;
  totalCompleted: number;
  flairTier: string;
};

export const FLAIR_TIERS = [
  { minPuzzles: 0, tier: 'Novice', label: 'Novice' },
  { minPuzzles: 5, tier: 'Connector', label: 'Connector' },
  { minPuzzles: 15, tier: 'Pattern Seeker', label: 'Pattern Seeker' },
  { minPuzzles: 30, tier: 'Community Explorer', label: 'Community Explorer' },
  { minPuzzles: 60, tier: 'Converger', label: 'Converger' },
] as const;

export type FlairTier = typeof FLAIR_TIERS[number]['tier'];

export function getFlairTier(totalCompleted: number): FlairTier {
  const novice: FlairTier = 'Novice';
  for (let i = FLAIR_TIERS.length - 1; i >= 0; i--) {
    const tier = FLAIR_TIERS[i];
    if (tier && totalCompleted >= tier.minPuzzles) {
      return tier.tier;
    }
  }
  return novice;
}

export function getTodayPuzzleId(): string {
  const now = new Date();
  const isoString = now.toISOString();
  const parts = isoString.split('T');
  const datePart = parts[0];
  return datePart ?? '2026-11-24';
}

export function formatSubreddit(subreddit: string): string {
  return subreddit.startsWith('r/') ? subreddit : `r/${subreddit}`;
}
