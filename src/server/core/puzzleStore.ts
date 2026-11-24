/**
 * Puzzle Store - KV operations for Converge game
 * Handles puzzle data, player sessions, and streaks
 */

import { redis } from '@devvit/web/server';
import type { Puzzle, GameSession, GameScore, Stage2Answer, FlairTier } from '../../shared/gameTypes';

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
        isConnected: true,
      },
      {
        id: 'p2',
        title: 'Crumb shot: 75% hydration, cold retard 18h',
        author: 'CrumbMaster',
        subreddit: 'Breadit',
        score: 1800,
        thumbnailUrl: 'https://i.redd.it/abc123.jpg',
        permalink: '/r/Breadit/comments/def456',
        isConnected: true,
      },
      {
        id: 'p3',
        title: 'First loaf in my new Challenger bread pan 😭',
        author: 'NewBaker',
        subreddit: 'Breadit',
        score: 900,
        thumbnailUrl: 'https://i.redd.it/def456.jpg',
        permalink: '/r/Breadit/comments/ghi789',
        isConnected: true,
      },
      {
        id: 'p4',
        title: 'My Ender 3 prints perfect benchys now',
        author: 'PrintMaster',
        subreddit: '3Dprinting',
        score: 3200,
        permalink: '/r/3Dprinting/comments/jkl012',
        isConnected: false,
      },
      {
        id: 'p5',
        title: 'PLA vs PETG for functional parts - temp comparison',
        author: 'FilamentFan',
        subreddit: '3Dprinting',
        score: 1500,
        permalink: '/r/3Dprinting/comments/mno345',
        isConnected: false,
      },
      {
        id: 'p6',
        title: 'Sourdough starter smells like acetone - normal?',
        author: 'WorriedBaker',
        subreddit: 'AskBaking',
        score: 500,
        permalink: '/r/AskBaking/comments/pqr678',
        isConnected: false,
      },
      {
        id: 'p7',
        title: 'Why does my starter smell like nail polish remover?',
        author: 'CuriousCook',
        subreddit: 'AskBaking',
        score: 700,
        permalink: '/r/AskBaking/comments/stu901',
        isConnected: false,
      },
    ],
    connection: {
      theme: 'Fermentation & Temperature Control',
      explanation: 'All about bread fermentation — starter activity, hydration, and cold retard timing.',
      connectedPostIds: ['p1', 'p2', 'p3'],
      distractorPostIds: ['p4', 'p5', 'p6', 'p7'],
    },
    subredditQuestions: [
      {
        postId: 'p1',
        correctSubreddit: 'r/Breadit',
        options: ['r/Breadit', 'r/Sourdough', 'r/Baking'],
      },
      {
        postId: 'p2',
        correctSubreddit: 'r/Breadit',
        options: ['r/Breadit', 'r/ArtisanBread', 'r/BreaditShowcase'],
      },
      {
        postId: 'p3',
        correctSubreddit: 'r/Breadit',
        options: ['r/Breadit', 'r/ArtisanBread', 'r/BreaditShowcase'],
      },
    ],
  },
  // Day 2: Precision & Craft
  {
    id: '2024-11-14',
    date: '2024-11-14',
    posts: [
      { id: 'p1', title: 'My new Japanese waterstone progression', author: 'SharpEdge', subreddit: 'sharpening', score: 1200, permalink: '/r/sharpening/comments/aaa', isConnected: true },
      { id: 'p2', title: 'Finally got my chisel to mirror polish', author: 'WoodworkerJoe', subreddit: 'woodworking', score: 2100, permalink: '/r/woodworking/comments/bbb', isConnected: true },
      { id: 'p3', title: '0.3mm mechanical pencil lead comparison', author: 'LeadLover', subreddit: 'pencils', score: 800, permalink: '/r/pencils/comments/ccc', isConnected: true },
      { id: 'p4', title: 'Rotring 600 vs 800 - the ultimate test', author: 'PenAddict', subreddit: 'pens', score: 1500, permalink: '/r/pens/comments/ddd', isConnected: false },
      { id: 'p5', title: 'Watchmaking: installing a hairspring', author: 'Horologist', subreddit: 'watchmaking', score: 900, permalink: '/r/watchmaking/comments/eee', isConnected: false },
      { id: 'p5b', title: 'Regulating my Seiko 7S26 to +2s/day', author: 'WatchNerd', subreddit: 'WatchRepair', score: 600, permalink: '/r/WatchRepair/comments/fff', isConnected: false },
      { id: 'p6', title: 'Fountain pen nib smoothing results', author: 'NibMeister', subreddit: 'fountainpens', score: 1800, permalink: '/r/fountainpens/comments/ggg', isConnected: false },
    ],
    connection: {
      theme: 'Precision & Craft',
      explanation: 'The pursuit of precision in craftsmanship — sharpening, writing instruments, and micromechanics.',
      connectedPostIds: ['p1', 'p2', 'p3'],
      distractorPostIds: ['p4', 'p5', 'p5b', 'p6'],
    },
    subredditQuestions: [
      {
        postId: 'p1',
        correctSubreddit: 'r/sharpening',
        options: ['r/sharpening', 'r/knives', 'r/cooking'],
      },
      {
        postId: 'p2',
        correctSubreddit: 'r/woodworking',
        options: ['r/woodworking', 'r/carpentry', 'r/DIY'],
      },
      {
        postId: 'p3',
        correctSubreddit: 'r/pencils',
        options: ['r/pencils', 'r/PenAddicts', 'r/Stationery'],
      },
    ],
  },
  // Day 3: Urban Decay & Nature
  {
    id: '2024-11-15',
    date: '2024-11-15',
    posts: [
      { id: 'p1', title: 'Abandoned theater - nature taking over', author: 'UrbexPhoto', subreddit: 'AbandonedPorn', score: 4500, permalink: '/r/AbandonedPorn/comments/ggg', isConnected: true },
      { id: 'p2', title: 'Vines consuming an old factory', author: 'DecayHunter', subreddit: 'UrbanExploration', score: 2800, permalink: '/r/UrbanExploration/comments/hhh', isConnected: true },
      { id: 'p3', title: 'Moss garden in a cracked sidewalk', author: 'SidewalkBotanist', subreddit: 'moss', score: 1200, permalink: '/r/moss/comments/iii', isConnected: true },
      { id: 'p4', title: 'Tree growing through abandoned roof', author: 'NatureWins', subreddit: 'NatureReclaims', score: 3500, permalink: '/r/NatureReclaims/comments/jjj', isConnected: false },
      { id: 'p5', title: 'Ferns in brick mortar - identification?', author: 'PlantID', subreddit: 'whatsthisplant', score: 400, permalink: '/r/whatsthisplant/comments/kkk', isConnected: false },
      { id: 'p6', title: 'Lichen patterns on gravestones', author: 'LichenLover', subreddit: 'lichens', score: 300, permalink: '/r/lichens/comments/lll', isConnected: false },
      { id: 'p7', title: 'Raccoons in abandoned mall', author: 'UrbanWildlife', subreddit: 'UrbanExploration', score: 2200, permalink: '/r/UrbanExploration/comments/mmm', isConnected: false },
    ],
    connection: {
      theme: 'Urban Decay & Nature Reclaiming',
      explanation: 'Human structures being reclaimed by nature — theaters, factories, sidewalks, and rooftops.',
      connectedPostIds: ['p1', 'p2', 'p3'],
      distractorPostIds: ['p4', 'p5', 'p6', 'p7'],
    },
    subredditQuestions: [
      {
        postId: 'p1',
        correctSubreddit: 'r/AbandonedPorn',
        options: ['r/AbandonedPorn', 'r/UrbanExploration', 'r/Decay'],
      },
      {
        postId: 'p2',
        correctSubreddit: 'r/UrbanExploration',
        options: ['r/UrbanExploration', 'r/AbandonedPorn', 'r/RoofTopping'],
      },
      {
        postId: 'p3',
        correctSubreddit: 'r/moss',
        options: ['r/moss', 'r/NatureReclaims', 'r/botany'],
      },
    ],
  },
  // Day 4: Analog Craft
  {
    id: '2024-11-16',
    date: '2024-11-16',
    posts: [
      { id: 'p1', title: 'Hand-cut dovetails - 3rd attempt', author: 'JoineryJourney', subreddit: 'woodworking', score: 3200, permalink: '/r/woodworking/comments/mmm', isConnected: true },
      { id: 'p2', title: 'My first hand-forged knife', author: 'SmithyStart', subreddit: 'Blacksmith', score: 2800, permalink: '/r/Blacksmith/comments/nnn', isConnected: true },
      { id: 'p3', title: 'Fountain pen nib smoothing results', author: 'NibMeister', subreddit: 'fountainpens', score: 1800, permalink: '/r/fountainpens/comments/ooo', isConnected: true },
      { id: 'p4', title: 'Leather wallet - saddle stitching', author: 'LeatherCrafter', subreddit: 'Leathercraft', score: 1500, permalink: '/r/Leathercraft/comments/ppp', isConnected: false },
      { id: 'p5', title: 'Mechanical keyboard switch lubing guide', author: 'SwitchScientist', subreddit: 'MechanicalKeyboards', score: 4200, permalink: '/r/MechanicalKeyboards/comments/qqq', isConnected: false },
      { id: 'p5b', title: 'Custom keycap set - GMK Olive', author: 'KeycapCollector', subreddit: 'MechanicalKeyboards', score: 1900, permalink: '/r/MechanicalKeyboards/comments/rrr', isConnected: false },
      { id: 'p6', title: 'Cast iron seasoning science', author: 'CastIronChef', subreddit: 'castiron', score: 2200, permalink: '/r/castiron/comments/sss', isConnected: false },
    ],
    connection: {
      theme: 'Traditional Hand Craft',
      explanation: 'Traditional craftsmanship — woodworking, blacksmithing, and fine writing instruments.',
      connectedPostIds: ['p1', 'p2', 'p3'],
      distractorPostIds: ['p4', 'p5', 'p5b', 'p6'],
    },
    subredditQuestions: [
      {
        postId: 'p1',
        correctSubreddit: 'r/woodworking',
        options: ['r/woodworking', 'r/carpentry', 'r/Joinery'],
      },
      {
        postId: 'p2',
        correctSubreddit: 'r/Blacksmith',
        options: ['r/Blacksmith', 'r/Bladesmith', 'r/metalworking'],
      },
      {
        postId: 'p3',
        correctSubreddit: 'r/fountainpens',
        options: ['r/fountainpens', 'r/PenAddicts', 'r/Stationery'],
      },
    ],
  },
  // Day 5: Micro Worlds
  {
    id: '2024-11-17',
    date: '2024-11-17',
    posts: [
      { id: 'p1', title: 'Snowflake under microscope - stellar dendrite', author: 'SnowCrystals', subreddit: 'microscopy', score: 5200, permalink: '/r/microscopy/comments/sss', isConnected: true },
      { id: 'p2', title: 'Butterfly wing scales at 500x', author: 'WingWatcher', subreddit: 'microscopy', score: 3100, permalink: '/r/microscopy/comments/ttt', isConnected: true },
      { id: 'p3', title: 'PCB traces - 0.1mm spacing', author: 'HardwareHacker', subreddit: 'PrintedCircuitBoard', score: 1800, permalink: '/r/PrintedCircuitBoard/comments/uuu', isConnected: true },
      { id: 'p4', title: 'CPU die shot - Ryzen 7000', author: 'SiliconSleuth', subreddit: 'hardware', score: 4500, permalink: '/r/hardware/comments/vvv', isConnected: false },
      { id: 'p5', title: 'Salt crystal formation - time lapse', author: 'CrystalGrower', subreddit: 'crystals', score: 2200, permalink: '/r/crystals/comments/www', isConnected: false },
      { id: 'p6', title: 'Vitamin C crystallization patterns', author: 'ChemistryArt', subreddit: 'chemistry', score: 1600, permalink: '/r/chemistry/comments/xxx', isConnected: false },
      { id: 'p7', title: 'Sand grains from different beaches', author: 'SandCollector', subreddit: 'geology', score: 1200, permalink: '/r/geology/comments/yyy', isConnected: false },
    ],
    connection: {
      theme: 'Micro Worlds',
      explanation: 'The hidden beauty at microscopic scale — nature, technology, and chemistry.',
      connectedPostIds: ['p1', 'p2', 'p3'],
      distractorPostIds: ['p4', 'p5', 'p6', 'p7'],
    },
    subredditQuestions: [
      {
        postId: 'p1',
        correctSubreddit: 'r/microscopy',
        options: ['r/microscopy', 'r/MicroPorn', 'r/MacroPhotography'],
      },
      {
        postId: 'p2',
        correctSubreddit: 'r/microscopy',
        options: ['r/microscopy', 'r/Entomology', 'r/BiologyPorn'],
      },
      {
        postId: 'p3',
        correctSubreddit: 'r/PrintedCircuitBoard',
        options: ['r/PrintedCircuitBoard', 'r/electronics', 'r/hardware'],
      },
    ],
  },
  // Day 6: Night & Light
  {
    id: '2024-11-18',
    date: '2024-11-18',
    posts: [
      { id: 'p1', title: 'Milky Way over abandoned gas station', author: 'AstroNomad', subreddit: 'astrophotography', score: 6200, permalink: '/r/astrophotography/comments/yyy', isConnected: true },
      { id: 'p2', title: 'Light painting - orbital tool', author: 'LightPainter', subreddit: 'lightpainting', score: 2800, permalink: '/r/lightpainting/comments/zzz', isConnected: true },
      { id: 'p3', title: 'Headlamp beam comparison - 2024 models', author: 'GearTester', subreddit: 'flashlight', score: 3400, permalink: '/r/flashlight/comments/aaaa', isConnected: true },
      { id: 'p4', title: 'Camping lantern runtime test', author: 'CampGear', subreddit: 'CampingGear', score: 1200, permalink: '/r/CampingGear/comments/bbbb', isConnected: false },
      { id: 'p5', title: 'Bioluminescent waves at midnight', author: 'OceanGlow', subreddit: 'natureismetal', score: 8500, permalink: '/r/natureismetal/comments/cccc', isConnected: false },
      { id: 'p6', title: 'Firefly synchronization in Great Smokies', author: 'BugWatcher', subreddit: 'Entomology', score: 2100, permalink: '/r/Entomology/comments/dddd', isConnected: false },
      { id: 'p7', title: 'Aurora borealis over Iceland', author: 'AuroraHunter', subreddit: 'astrophotography', score: 4500, permalink: '/r/astrophotography/comments/eeee', isConnected: false },
    ],
    connection: {
      theme: 'Night & Light',
      explanation: 'Photography and tools for the night — stars, light painting, and portable illumination.',
      connectedPostIds: ['p1', 'p2', 'p3'],
      distractorPostIds: ['p4', 'p5', 'p6', 'p7'],
    },
    subredditQuestions: [
      {
        postId: 'p1',
        correctSubreddit: 'r/astrophotography',
        options: ['r/astrophotography', 'r/EarthPorn', 'r/SpacePorn'],
      },
      {
        postId: 'p2',
        correctSubreddit: 'r/lightpainting',
        options: ['r/lightpainting', 'r/photography', 'r/ExposurePorn'],
      },
      {
        postId: 'p3',
        correctSubreddit: 'r/flashlight',
        options: ['r/flashlight', 'r/EDC', 'r/CampingGear'],
      },
    ],
  },
  // Day 7: Restored & Revived
  {
    id: '2024-11-19',
    date: '2024-11-19',
    posts: [
      { id: 'p1', title: '1920s waffle iron restoration', author: 'CastIronChef', subreddit: 'castiron', score: 3800, permalink: '/r/castiron/comments/eeee', isConnected: true },
      { id: 'p2', title: 'Vintage tube amp brought back to life', author: 'AudiophileFix', subreddit: 'vintageaudio', score: 2200, permalink: '/r/vintageaudio/comments/ffff', isConnected: true },
      { id: 'p3', title: 'Rebinding a 1850s family bible', author: 'BookBinder', subreddit: 'bookbinding', score: 1500, permalink: '/r/bookbinding/comments/gggg', isConnected: true },
      { id: 'p4', title: 'Restored 1960s mechanical watch', author: 'WatchRestorer', subreddit: 'WatchRepair', score: 1800, permalink: '/r/WatchRepair/comments/hhhh', isConnected: false },
      { id: 'p5', title: 'Rusted pocket knife to mirror finish', author: 'KnifeRestore', subreddit: 'knives', score: 2500, permalink: '/r/knives/comments/iiii', isConnected: false },
      { id: 'p6', title: 'Grandmother\'s sewing machine restored', author: 'SewingHeirloom', subreddit: 'sewing', score: 1200, permalink: '/r/sewing/comments/jjjj', isConnected: false },
      { id: 'p7', title: '1950s radio restoration', author: 'RadioRestorer', subreddit: 'vintageaudio', score: 900, permalink: '/r/vintageaudio/comments/kkkk', isConnected: false },
    ],
    connection: {
      theme: 'Restored & Revived',
      explanation: 'Bringing vintage objects back to life — cast iron, electronics, books, and tools.',
      connectedPostIds: ['p1', 'p2', 'p3'],
      distractorPostIds: ['p4', 'p5', 'p6', 'p7'],
    },
    subredditQuestions: [
      {
        postId: 'p1',
        correctSubreddit: 'r/castiron',
        options: ['r/castiron', 'r/Restoration', 'r/Antiques'],
      },
      {
        postId: 'p2',
        correctSubreddit: 'r/vintageaudio',
        options: ['r/vintageaudio', 'r/audiophile', 'r/DIYAudio'],
      },
      {
        postId: 'p3',
        correctSubreddit: 'r/bookbinding',
        options: ['r/bookbinding', 'r/Restoration', 'r/Calligraphy'],
      },
    ],
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
  const parts = isoString.split('T');
  const datePart = parts[0];
  return datePart ?? '2024-01-01';
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
    stage: 'STAGE_1',
    selectedPostIds: [],
    stage1Attempts: 0,
    stage1Correct: false,
    stage2Answers: [],
    stage2CurrentQuestion: 0,
    startedAt: Date.now(),
  };
  await redis.set(key, JSON.stringify(session));
  return { session, isNew: true };
}

/**
 * Save player's session
 */
export async function saveSession(userId: string, session: GameSession): Promise<void> {
  const key = `${KEYS.SESSION}${userId}:${session.puzzleId}`;
  await redis.set(key, JSON.stringify(session));
}

/**
 * Submit Stage 1 answer (selected post IDs)
 */
export async function submitStage1(
  userId: string,
  puzzleId: string,
  selectedPostIds: string[]
): Promise<{ success: boolean; correct: boolean; attempts: number; session: GameSession }> {
  const puzzle = await getPuzzle(puzzleId);
  if (!puzzle) throw new Error('Puzzle not found');

  const sessionKey = `${KEYS.SESSION}${userId}:${puzzleId}`;
  const sessionData = await redis.get(sessionKey);
  if (!sessionData) throw new Error('Session not found');

  const session: GameSession = JSON.parse(sessionData);
  session.stage1Attempts += 1;

  // Check if correct (exactly 3 posts matching connection.connectedPostIds)
  const correctPostIds = new Set(puzzle.connection.connectedPostIds);
  
  let correct = false;
  if (selectedPostIds.length === 3) {
    let allMatch = true;
    for (const pid of selectedPostIds) {
      if (!correctPostIds.has(pid)) {
        allMatch = false;
        break;
      }
    }
    if (allMatch && selectedPostIds.length === 3) {
      correct = true;
    }
  }

  if (correct) {
    session.stage1Correct = true;
    session.stage = 'STAGE_2';
    session.selectedPostIds = selectedPostIds;
    session.stage1Attempts = 1; // Reset for tracking
    session.stage2CurrentQuestion = 0;
    session.stage2Answers = [];
    await redis.set(`${KEYS.SESSION}${userId}:${puzzleId}`, JSON.stringify(session));
    return { success: true, correct: true, attempts: 1, session };
  }

  // Incorrect
  if (session.stage1Attempts >= 2) {
    // Second attempt failed - mark as failed but keep stage as STAGE_1
    session.stage1Correct = false;
    session.selectedPostIds = selectedPostIds;
    session.stage = 'STAGE_1'; // Keep as STAGE_1, but mark as failed via stage1Correct=false
    await redis.set(`${KEYS.SESSION}${userId}:${puzzleId}`, JSON.stringify(session));
    return { success: false, correct: false, attempts: 2, session };
  }

  // First attempt failed, give second chance
  session.selectedPostIds = selectedPostIds;
  await redis.set(`${KEYS.SESSION}${userId}:${puzzleId}`, JSON.stringify(session));
  return { success: false, correct: false, attempts: 1, session };
}

/**
 * Submit Stage 2 answer (subreddit guess for a specific post)
 */
export async function submitStage2(
  userId: string,
  puzzleId: string,
  postId: string,
  selectedSubreddit: string
): Promise<{ correct: boolean; answer: Stage2Answer; nextQuestion: number; session: GameSession }> {
  const puzzle = await getPuzzle(puzzleId);
  if (!puzzle) throw new Error('Puzzle not found');

  const sessionKey = `${KEYS.SESSION}${userId}:${puzzleId}`;
  const sessionData = await redis.get(sessionKey);
  if (!sessionData) throw new Error('Session not found');

  const session: GameSession = JSON.parse(sessionData);
  const questionIndex = session.stage2CurrentQuestion;
  
  if (questionIndex >= puzzle.subredditQuestions.length) {
    throw new Error('No more questions');
  }

  const question = puzzle.subredditQuestions[questionIndex];
  if (!question) {
    throw new Error('Question not found');
  }
  if (question.postId !== postId) {
    throw new Error('Invalid post for current question');
  }

  const isCorrect = selectedSubreddit === question.correctSubreddit;
  const answer: Stage2Answer = {
    postId,
    selectedSubreddit,
    isCorrect,
    lockedAt: Date.now(),
  };

  session.stage2Answers.push(answer);
  session.stage2CurrentQuestion += 1;

  // If this was the last question, move to results
  if (session.stage2CurrentQuestion >= puzzle.subredditQuestions.length) {
    session.stage = 'RESULTS';
  }

  await redis.set(`${KEYS.SESSION}${userId}:${puzzleId}`, JSON.stringify(session));
  return { correct: isCorrect, answer, nextQuestion: session.stage2CurrentQuestion, session };
}

/**
 * Calculate final score and update streak
 */
export async function calculateScore(
  userId: string,
  puzzleId: string
): Promise<GameScore> {
  const puzzle = await getPuzzle(puzzleId);
  if (!puzzle) throw new Error('Puzzle not found');

  const sessionKey = `${KEYS.SESSION}${userId}:${puzzleId}`;
  const sessionData = await redis.get(sessionKey);
  if (!sessionData) throw new Error('Session not found');

  const session: GameSession = JSON.parse(sessionData);
  
  if (!session.stage1Correct) {
    // Failed Stage 1
    const score: GameScore = {
      connectionSolved: false,
      correctSubredditGuesses: 0,
      starsEarned: 0,
      streak: await updateStreak(userId, false),
      flairTier: getFlairTier(0),
    };
    return score;
  }

  // Count correct subreddit guesses
  let correctGuesses = 0;
  for (const answer of session.stage2Answers) {
    if (answer.isCorrect) correctGuesses++;
  }

  const starsEarned = correctGuesses; // 1 star per correct subreddit (0-3)
  const newStreak = await updateStreak(userId, correctGuesses > 0);
  const flairTier = getFlairTier(newStreak);

  const score: GameScore = {
    connectionSolved: true,
    correctSubredditGuesses: correctGuesses,
    starsEarned,
    streak: newStreak,
    flairTier,
  };

  // Save completed session with score
  const finalSessionKey = `${KEYS.SESSION}${userId}:${puzzleId}`;
  const finalSessionData = await redis.get(finalSessionKey);
  if (finalSessionData) {
    const session: GameSession = JSON.parse(finalSessionData);
    session.score = score;
    session.streak = newStreak;
    session.completedAt = Date.now();
    session.stage = 'RESULTS';
    await redis.set(`${KEYS.SESSION}${userId}:${puzzleId}`, JSON.stringify(session));
  }

  // Mark as played today
  await redis.set(`${KEYS.PLAYED}${userId}:${getTodayPuzzleId()}`, '1');

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
    { min: 60, tier: 'Converger' as const },
    { min: 30, tier: 'Community Explorer' as const },
    { min: 15, tier: 'Pattern Seeker' as const },
    { min: 5, tier: 'Connector' as const },
    { min: 0, tier: 'Novice' as const },
  ];
  return tiers.find((t) => streak >= t.min)?.tier ?? 'Novice';
}