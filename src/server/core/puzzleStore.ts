/**
 * Puzzle Store - KV operations for Converge game
 * Handles puzzle data, player sessions, and streaks
 */

import { redis } from '@devvit/web/server';
import type { Puzzle, GameSession, GameScore, FlairTier } from '../../shared/gameTypes';

// Key prefixes
const KEYS = {
  PUZZLE: 'puzzle:',
  SESSION: 'session:',
  STREAK: 'streak:',
  PLAYED: 'played:',
} as const;

// Default puzzles for hackathon demo (7 days)
const DEFAULT_PUZZLES: Puzzle[] = [
  {
    id: '2024-11-13',
    date: '2024-11-13',
    posts: [
      {
        id: 'p1',
        title: 'My sourdough starter finally doubled in 4 hours!',
        author: 'BreadBaker99',
        subreddit: 'Breadit',
        score: 2300,
        permalink: '/r/Breadit/comments/abc123',
        isCorrectGroup: 0,
      },
      {
        id: 'p2',
        title: 'Crumb shot: 75% hydration, cold retard 18h',
        author: 'CrumbMaster',
        subreddit: 'Breadit',
        score: 1800,
        thumbnailUrl: 'https://i.redd.it/abc123.jpg',
        permalink: '/r/Breadit/comments/def456',
        isCorrectGroup: 0,
      },
      {
        id: 'p3',
        title: 'First loaf in my new Challenger bread pan 😭',
        author: 'NewBaker',
        subreddit: 'Breadit',
        score: 900,
        thumbnailUrl: 'https://i.redd.it/def456.jpg',
        permalink: '/r/Breadit/comments/ghi789',
        isCorrectGroup: 0,
      },
      {
        id: 'p4',
        title: 'My Ender 3 prints perfect benchys now',
        author: 'PrintMaster',
        subreddit: '3Dprinting',
        score: 3200,
        permalink: '/r/3Dprinting/comments/jkl012',
        isCorrectGroup: 1,
      },
      {
        id: 'p5',
        title: 'PLA vs PETG for functional parts - temp comparison',
        author: 'FilamentFan',
        subreddit: '3Dprinting',
        score: 1500,
        permalink: '/r/3Dprinting/comments/mno345',
        isCorrectGroup: 1,
      },
      {
        id: 'p6',
        title: 'Sourdough starter smells like acetone - normal?',
        author: 'WorriedBaker',
        subreddit: 'AskBaking',
        score: 500,
        permalink: '/r/AskBaking/comments/pqr678',
        isCorrectGroup: 2,
      },
      {
        id: 'p7',
        title: 'Why does my starter smell like nail polish remover?',
        author: 'CuriousCook',
        subreddit: 'AskBaking',
        score: 700,
        permalink: '/r/AskBaking/comments/stu901',
        isCorrectGroup: 2,
      },
    ],
    groups: [
      {
        id: 0,
        theme: 'Fermentation & Temperature Control',
        subreddit: 'r/Breadit',
        postIds: ['p1', 'p2', 'p3'],
        description: 'All about bread fermentation — starter activity, hydration, and cold retard timing.',
      },
      {
        id: 1,
        theme: 'Print Temperature & Material Science',
        subreddit: 'r/3Dprinting',
        postIds: ['p4', 'p5'],
        description: '3D printing temperatures — PLA vs PETG, benchy calibration, heat management.',
      },
      {
        id: 2,
        theme: 'Starter Chemistry & Troubleshooting',
        subreddit: 'r/AskBaking',
        postIds: ['p6', 'p7'],
        description: 'The science behind starter smells — acetone = acetic acid = hungry starter.',
      },
    ],
    crossPollination: [
      {
        postId: 'p6',
        connectsGroups: [0, 2],
        bonusDescription: 'Acetone smell bridges bread fermentation chemistry and starter troubleshooting!',
      },
    ],
  },
  // Add 6 more puzzle objects here for days 2-7
  // For brevity, only day 1 is fully defined
  {
    id: '2024-11-14',
    date: '2024-11-14',
    posts: [],
    groups: [],
  },
  {
    id: '2024-11-15',
    date: '2024-11-15',
    posts: [],
    groups: [],
  },
  {
    id: '2024-11-16',
    date: '2024-11-16',
    posts: [],
    groups: [],
  },
  {
    id: '2024-11-17',
    date: '2024-11-17',
    posts: [],
    groups: [],
  },
  {
    id: '2024-11-18',
    date: '2024-11-18',
    posts: [],
    groups: [],
  },
  {
    id: '2024-11-19',
    date: '2024-11-19',
    posts: [],
    groups: [],
  },
];

/**
 * Initialize default puzzles in KV (run once on deploy)
 */
export async function seedPuzzles(): Promise<void> {
  for (const puzzle of DEFAULT_PUZZLES) {
    await redis.set(`${KEYS.PUZZLE}${puzzle.id}`, JSON.stringify(puzzle));
  }
}

/**
 * Get puzzle by ID (defaults to today)
 */
export async function getPuzzle(puzzleId?: string): Promise<Puzzle | null> {
  const id = puzzleId ?? getTodayPuzzleId();
  const data = await redis.get(`${KEYS.PUZZLE}${id}`);
  return data ? JSON.parse(data) : null;
}

/**
 * Get today's puzzle ID in YYYY-MM-DD format
 */
export function getTodayPuzzleId(): string {
  const now = new Date();
  const isoString = now.toISOString();
  const datePart = isoString.split('T')[0];
  return datePart ?? new Date().toISOString().split('T')[0] ?? '2024-01-01';
}

/**
 * Get or create player session for a puzzle
 */
export async function getSession(
  userId: string,
  puzzleId: string
): Promise<{ session: GameSession | null; isNew: boolean }> {
  const key = `${KEYS.SESSION}${userId}:${puzzleId}`;
  const data = await redis.get(key);

  if (data) {
    return { session: JSON.parse(data), isNew: false };
  }

  // Create new session
  const session: GameSession = {
    puzzleId,
    playerGroups: [],
    startedAt: Date.now(),
  };
  await redis.set(key, JSON.stringify(session));
  return { session, isNew: true };
}

/**
 * Save player's grouping attempt
 */
export async function saveSession(userId: string, session: GameSession): Promise<void> {
  const key = `${KEYS.SESSION}${userId}:${session.puzzleId}`;
  await redis.set(key, JSON.stringify(session));
}

/**
 * Submit final answer and calculate score
 */
export async function submitAnswer(
  userId: string,
  puzzleId: string,
  playerGroups: GameSession['playerGroups']
): Promise<GameScore> {
  const puzzle = await getPuzzle(puzzleId);
  if (!puzzle) throw new Error('Puzzle not found');

  // Calculate score
  let correctGroups = 0;
  let correctPosts = 0;
  const totalPosts = puzzle.posts.length;

  for (const group of puzzle.groups) {
    const playerGroup = playerGroups.find((g) => g.groupId === group.id);
    if (!playerGroup) continue;

    const correctPostIds = new Set(group.postIds);
    const playerPostIds = new Set(playerGroup.postIds);

    let groupCorrect = 0;
    for (const pid of playerPostIds) {
      if (correctPostIds.has(pid)) {
        groupCorrect++;
        correctPosts++;
      }
    }

    if (groupCorrect === group.postIds.length && playerPostIds.size === group.postIds.length) {
      correctGroups++;
    }
  }

  // Check cross-pollination
  const crossPollinationFound = puzzle.crossPollination?.some((cp) => {
    const playerGroup = playerGroups.find((g) => g.postIds.includes(cp.postId));
    return playerGroup && cp.connectsGroups.includes(playerGroup.groupId);
  }) ?? false;

  // Get and update streak
  const streak = await updateStreak(userId, correctGroups === puzzle.groups.length);
  const flairTier = getFlairTier(streak);

  const score: GameScore = {
    correctGroups,
    totalGroups: puzzle.groups.length,
    correctPosts,
    totalPosts,
    crossPollinationFound,
    streak,
    flairTier,
  };

  // Save completed session
  const sessionKey = `${KEYS.SESSION}${userId}:${puzzleId}`;
  const sessionData = await redis.get(sessionKey);
  if (sessionData) {
    const session: GameSession = JSON.parse(sessionData);
    session.playerGroups = playerGroups;
    session.submittedAt = Date.now();
    session.score = score;
    session.streak = streak;
    await redis.set(sessionKey, JSON.stringify(session));
  } else {
    // Create new session if none exists
    const newSession: GameSession = {
      puzzleId,
      playerGroups,
      startedAt: Date.now(),
      submittedAt: Date.now(),
      score,
      streak,
    };
    await redis.set(sessionKey, JSON.stringify(newSession));
  }

  return score;
}

/**
 * Update streak in Redis
 */
async function updateStreak(userId: string, won: boolean): Promise<number> {
  const streakKey = `${KEYS.STREAK}${userId}`;
  const playedKey = `${KEYS.PLAYED}${userId}:${getTodayPuzzleId()}`;

  // Check if already played today
  const alreadyPlayed = await redis.get(playedKey);
  if (alreadyPlayed) {
    const streakVal = await redis.get(streakKey);
    return streakVal ? parseInt(streakVal, 10) : 0;
  }

  // Mark as played today
  await redis.set(playedKey, '1');

  if (won) {
    const streakVal = await redis.get(streakKey);
    const currentStreak = streakVal ? parseInt(streakVal, 10) : 0;
    const newStreak = currentStreak + 1;
    await redis.set(streakKey, newStreak.toString());
    return newStreak;
  } else {
    // Reset streak on loss
    await redis.set(streakKey, '0');
    return 0;
  }
}

/**
 * Get current streak for user
 */
export async function getStreak(userId: string): Promise<number> {
  const streakKey = `${KEYS.STREAK}${userId}`;
  const streak = await redis.get(streakKey);
  return streak ? parseInt(streak, 10) : 0;
}

/**
 * Get flair tier from streak
 */
function getFlairTier(streak: number): FlairTier {
  const tiers = [
    { min: 30, tier: 'Converger' as const },
    { min: 14, tier: 'Cartographer' as const },
    { min: 7, tier: 'Connector' as const },
    { min: 3, tier: 'Seeker' as const },
    { min: 0, tier: 'Novice' as const },
  ];
  return tiers.find((t) => streak >= t.min)?.tier ?? 'Novice';
}