/**
 * Puzzle Store - KV operations for Converge
 * Puzzles are seeded automatically on first access.
 */

import { reddit, redis, type Post } from '@devvit/web/server';
import {
  formatSubreddit,
  getFlairTier,
  getTodayPuzzleId,
} from '../../shared/gameTypes';
import type {
  FlairTier,
  GameScore,
  GameSession,
  GameState,
  Puzzle,
  PuzzlePost,
  Stage2Answer,
} from '../../shared/gameTypes';

export { getTodayPuzzleId };

const KEYS = {
  PUZZLE: 'puzzle:',
  PUZZLE_VERSION: 'puzzles:version',
  PUZZLE_THUMBNAILS: 'puzzles:thumbnails',
  LAST_SEED_ATTEMPT: 'puzzles:lastSeedAttempt',
  SESSION: 'session:',
  STREAK: 'streak:',
  PLAYED: 'played:',
  LAST_COMPLETED: 'lastCompleted:',
  TOTAL_COMPLETED: 'totalCompleted:',
} as const;

const DEFAULT_PUZZLES: Puzzle[] = [
  {
    id: '2026-11-24',
    date: '2026-11-24',
    posts: [
      { id: 'p1', title: 'My sourdough starter finally doubled in 4 hours!', author: 'BreadBaker99', subreddit: 'Breadit', score: 2300, content: 'Starter more than doubled after a warm kitchen day. Feeding ratio was 1:1:1. Looking for timing advice before the overnight bake.', permalink: '/r/Breadit/comments/abc123' },
      { id: 'p2', title: 'Crumb shot: 75% hydration, cold retard 18h', author: 'CrumbMaster', subreddit: 'Breadit', score: 1800, content: 'Sharing the crumb from an overnight bake. 75% hydration, an 18-hour cold retard, and a preheated Dutch oven.', permalink: '/r/Breadit/comments/def456' },
      { id: 'p3', title: 'First loaf in my new Challenger bread pan', author: 'NewBaker', subreddit: 'Breadit', score: 900, content: 'First loaf out of the new pan. Spring was great, but I over-scored the top and the ear did not form the way I wanted.', permalink: '/r/Breadit/comments/ghi789' },
      { id: 'p4', title: 'My Ender 3 prints perfect benchys now', author: 'PrintMaster', subreddit: '3Dprinting', score: 3200, content: 'After a week of calibration, the benchys finally came out clean. No stringing and the corners look sharp.', permalink: '/r/3Dprinting/comments/jkl012' },
      { id: 'p5', title: 'Sourdough starter smells like acetone - normal?', author: 'WorriedBaker', subreddit: 'AskBaking', score: 500, content: 'Troubleshooting question: starter smells like acetone after a missed feeding. Is it safe to keep using it?', permalink: '/r/AskBaking/comments/pqr678' },
    ],
    connection: {
      theme: 'Fermentation & Temperature Control',
      explanation: 'The three connected posts are all about bread fermentation: starter activity, hydration, and cold retard timing.',
      connectedPostIds: ['p1', 'p2', 'p3'],
      distractorPostIds: ['p4', 'p5'],
    },
    subredditQuestions: [
      { postId: 'p1', correctSubreddit: 'r/Breadit', options: ['r/Breadit', 'r/Sourdough', 'r/Baking'] },
      { postId: 'p2', correctSubreddit: 'r/Breadit', options: ['r/Breadit', 'r/ArtisanBread', 'r/BreaditShowcase'] },
      { postId: 'p3', correctSubreddit: 'r/Breadit', options: ['r/Breadit', 'r/ArtisanBread', 'r/BreaditShowcase'] },
    ],
  },
  {
    id: '2026-11-25',
    date: '2026-11-25',
    posts: [
      { id: 'p1', title: 'My new Japanese waterstone progression', author: 'SharpEdge', subreddit: 'sharpening', score: 1200, content: 'Progression from 400 to 8000 grit. The chisel edge is now mirror polished and shaves hair cleanly.', permalink: '/r/sharpening/comments/aaa' },
      { id: 'p2', title: 'Finally got my chisel to mirror polish', author: 'WoodworkerJoe', subreddit: 'woodworking', score: 2100, content: 'Mirror finish on a chisel after a long session on waterstones. The burr finally disappeared completely.', permalink: '/r/woodworking/comments/bbb' },
      { id: 'p3', title: '0.3mm mechanical pencil lead comparison', author: 'LeadLover', subreddit: 'pencils', score: 800, content: 'Compared 0.3mm and 0.5mm leads for sketching. The 0.3mm holds a point longer than I expected.', permalink: '/r/pencils/comments/ccc' },
      { id: 'p4', title: 'Rotring 600 vs 800 - the ultimate test', author: 'PenAddict', subreddit: 'pens', score: 1500, content: 'Rotring 600 versus 800 after a month of daily use. The knurling and weight feel completely different.', permalink: '/r/pens/comments/ddd' },
      { id: 'p5', title: 'Watchmaking: installing a hairspring', author: 'Horologist', subreddit: 'watchmaking', score: 900, content: 'Installing a replacement hairspring in a vintage movement. The balance wheel is finally beating evenly.', permalink: '/r/watchmaking/comments/eee' },
    ],
    connection: {
      theme: 'Precision & Craft',
      explanation: 'These posts share a pursuit of tiny tolerances: sharpening edges, polishing chisels, and comparing pencil leads.',
      connectedPostIds: ['p1', 'p2', 'p3'],
      distractorPostIds: ['p4', 'p5'],
    },
    subredditQuestions: [
      { postId: 'p1', correctSubreddit: 'r/sharpening', options: ['r/sharpening', 'r/knives', 'r/cooking'] },
      { postId: 'p2', correctSubreddit: 'r/woodworking', options: ['r/woodworking', 'r/carpentry', 'r/DIY'] },
      { postId: 'p3', correctSubreddit: 'r/pencils', options: ['r/pencils', 'r/PenAddicts', 'r/Stationery'] },
    ],
  },
  {
    id: '2026-11-26',
    date: '2026-11-26',
    posts: [
      { id: 'p1', title: 'Abandoned theater - nature taking over', author: 'UrbexPhoto', subreddit: 'AbandonedPorn', score: 4500, content: 'Found this theater completely overtaken by vines. The stage is now a moss carpet and the balcony is unsafe.', permalink: '/r/AbandonedPorn/comments/ggg' },
      { id: 'p2', title: 'Vines consuming an old factory', author: 'DecayHunter', subreddit: 'UrbanExploration', score: 2800, content: 'Old factory walls are disappearing under creepers. These were taken during an allowed urban exploration walk.', permalink: '/r/UrbanExploration/comments/hhh' },
      { id: 'p3', title: 'Moss garden in a cracked sidewalk', author: 'SidewalkBotanist', subreddit: 'moss', score: 1200, content: 'Moss colonized the cracks in a city sidewalk after weeks of rain. It looks like a tiny green map.', permalink: '/r/moss/comments/iii' },
      { id: 'p4', title: 'Ferns in brick mortar - identification?', author: 'PlantID', subreddit: 'whatsthisplant', score: 400, content: 'Can anyone identify this fern growing out of a brick wall? It appears every spring in the same spot.', permalink: '/r/whatsthisplant/comments/kkk' },
      { id: 'p5', title: 'Lichen patterns on gravestones', author: 'LichenLover', subreddit: 'lichens', score: 300, content: 'Lichen patterns on old gravestones are surprisingly colorful. Sharing a macro shot and the general location.', permalink: '/r/lichens/comments/lll' },
    ],
    connection: {
      theme: 'Urban Decay & Nature Reclaiming',
      explanation: 'Human-built places are slowly being reclaimed: a theater, a factory, and a cracked sidewalk.',
      connectedPostIds: ['p1', 'p2', 'p3'],
      distractorPostIds: ['p4', 'p5'],
    },
    subredditQuestions: [
      { postId: 'p1', correctSubreddit: 'r/AbandonedPorn', options: ['r/AbandonedPorn', 'r/UrbanExploration', 'r/Decay'] },
      { postId: 'p2', correctSubreddit: 'r/UrbanExploration', options: ['r/UrbanExploration', 'r/AbandonedPorn', 'r/RoofTopping'] },
      { postId: 'p3', correctSubreddit: 'r/moss', options: ['r/moss', 'r/NatureReclaims', 'r/botany'] },
    ],
  },
  {
    id: '2026-11-27',
    date: '2026-11-27',
    posts: [
      { id: 'p1', title: 'Hand-cut dovetails - 3rd attempt', author: 'JoineryJourney', subreddit: 'woodworking', score: 3200, content: 'Third attempt at hand-cut dovetails. The pins are tighter, but the shoulders still show small gaps.', permalink: '/r/woodworking/comments/mmm' },
      { id: 'p2', title: 'My first hand-forged knife', author: 'SmithyStart', subreddit: 'Blacksmith', score: 2800, content: 'First blade forged from scratch. Lots of filing and sanding, but the tang and edge finally came together.', permalink: '/r/Blacksmith/comments/nnn' },
      { id: 'p3', title: 'Fountain pen nib smoothing results', author: 'NibMeister', subreddit: 'fountainpens', score: 1800, content: 'Smoothed a stubborn nib with mylar and brass sheets. It now writes wet without catching on the paper.', permalink: '/r/fountainpens/comments/ooo' },
      { id: 'p4', title: 'Leather wallet - saddle stitching', author: 'LeatherCrafter', subreddit: 'Leathercraft', score: 1500, content: 'Saddle-stitched a leather wallet with waxed thread. Learning to keep the stitch tension even.', permalink: '/r/Leathercraft/comments/ppp' },
      { id: 'p5', title: 'Mechanical keyboard switch lubing guide', author: 'SwitchScientist', subreddit: 'MechanicalKeyboards', score: 4200, content: 'Switch lubing guide with before-and-after video. Linear switches feel completely different afterward.', permalink: '/r/MechanicalKeyboards/comments/qqq' },
    ],
    connection: {
      theme: 'Traditional Hand Craft',
      explanation: 'Woodworking, blacksmithing, and fountain pen tuning all rely on patient hand-finished craft.',
      connectedPostIds: ['p1', 'p2', 'p3'],
      distractorPostIds: ['p4', 'p5'],
    },
    subredditQuestions: [
      { postId: 'p1', correctSubreddit: 'r/woodworking', options: ['r/woodworking', 'r/carpentry', 'r/Joinery'] },
      { postId: 'p2', correctSubreddit: 'r/Blacksmith', options: ['r/Blacksmith', 'r/Bladesmith', 'r/metalworking'] },
      { postId: 'p3', correctSubreddit: 'r/fountainpens', options: ['r/fountainpens', 'r/PenAddicts', 'r/Stationery'] },
    ],
  },
  {
    id: '2026-11-28',
    date: '2026-11-28',
    posts: [
      { id: 'p1', title: 'Snowflake under microscope - stellar dendrite', author: 'SnowCrystals', subreddit: 'microscopy', score: 5200, content: 'Stellar dendrite snowflake captured under a microscope before it melted. The branching is almost perfect.', permalink: '/r/microscopy/comments/sss' },
      { id: 'p2', title: 'Butterfly wing scales at 500x', author: 'WingWatcher', subreddit: 'microscopy', score: 3100, content: 'Butterfly wing scales at 500x. The ridges create the color even though the scales themselves are clear.', permalink: '/r/microscopy/comments/ttt' },
      { id: 'p3', title: 'PCB traces - 0.1mm spacing', author: 'HardwareHacker', subreddit: 'PrintedCircuitBoard', score: 1800, content: 'PCB traces spaced at 0.1mm. Routing is tight but the manufacturer says it is within spec.', permalink: '/r/PrintedCircuitBoard/comments/uuu' },
      { id: 'p4', title: 'Salt crystal formation - time lapse', author: 'CrystalGrower', subreddit: 'crystals', score: 2200, content: 'Time lapse of salt crystals forming as water evaporates. The geometry changes every frame.', permalink: '/r/crystals/comments/www' },
      { id: 'p5', title: 'CPU die shot - Ryzen 7000', author: 'SiliconSleuth', subreddit: 'hardware', score: 4500, content: 'Die shot with the heat spreader removed. The chiplets and IO die are clearly visible.', permalink: '/r/hardware/comments/vvv' },
    ],
    connection: {
      theme: 'Micro Worlds',
      explanation: 'Each connected post reveals intricate structure at microscopic scale, whether natural or engineered.',
      connectedPostIds: ['p1', 'p2', 'p3'],
      distractorPostIds: ['p4', 'p5'],
    },
    subredditQuestions: [
      { postId: 'p1', correctSubreddit: 'r/microscopy', options: ['r/microscopy', 'r/MicroPorn', 'r/MacroPhotography'] },
      { postId: 'p2', correctSubreddit: 'r/microscopy', options: ['r/microscopy', 'r/Entomology', 'r/BiologyPorn'] },
      { postId: 'p3', correctSubreddit: 'r/PrintedCircuitBoard', options: ['r/PrintedCircuitBoard', 'r/electronics', 'r/hardware'] },
    ],
  },
  {
    id: '2026-11-29',
    date: '2026-11-29',
    posts: [
      { id: 'p1', title: 'Milky Way over abandoned gas station', author: 'AstroNomad', subreddit: 'astrophotography', score: 6200, content: 'Milky Way over an abandoned gas station on a moonless night. 20-second exposure at f/2.8.', permalink: '/r/astrophotography/comments/yyy' },
      { id: 'p2', title: 'Light painting - orbital tool', author: 'LightPainter', subreddit: 'lightpainting', score: 2800, content: 'Orbital light painting trial. Spinning a glowing tool while walking around the camera.', permalink: '/r/lightpainting/comments/zzz' },
      { id: 'p3', title: 'Headlamp beam comparison - 2024 models', author: 'GearTester', subreddit: 'flashlight', score: 3400, content: 'Headlamp beam comparison across four models. Flood versus throw matters more than raw lumens.', permalink: '/r/flashlight/comments/aaaa' },
      { id: 'p4', title: 'Bioluminescent waves at midnight', author: 'OceanGlow', subreddit: 'natureismetal', score: 8500, content: 'Bioluminescent waves lit up the shoreline last night. The blue glow only shows in long exposures.', permalink: '/r/natureismetal/comments/cccc' },
      { id: 'p5', title: 'Firefly synchronization in Great Smokies', author: 'BugWatcher', subreddit: 'Entomology', score: 2100, content: 'Fireflies flashing in sync in the Smokies. Hundreds of lights pulsing together along the trail.', permalink: '/r/Entomology/comments/dddd' },
    ],
    connection: {
      theme: 'Night & Light',
      explanation: 'Photographing stars, painting with light, and comparing headlamps all center on working with light after dark.',
      connectedPostIds: ['p1', 'p2', 'p3'],
      distractorPostIds: ['p4', 'p5'],
    },
    subredditQuestions: [
      { postId: 'p1', correctSubreddit: 'r/astrophotography', options: ['r/astrophotography', 'r/EarthPorn', 'r/SpacePorn'] },
      { postId: 'p2', correctSubreddit: 'r/lightpainting', options: ['r/lightpainting', 'r/photography', 'r/ExposurePorn'] },
      { postId: 'p3', correctSubreddit: 'r/flashlight', options: ['r/flashlight', 'r/EDC', 'r/CampingGear'] },
    ],
  },
  {
    id: '2026-11-30',
    date: '2026-11-30',
    posts: [
      { id: 'p1', title: '1920s waffle iron restoration', author: 'CastIronChef', subreddit: 'castiron', score: 3800, content: 'Restored a 1920s waffle iron. Rebuilt the cord, stripped the rust, and reseasoned the plates.', permalink: '/r/castiron/comments/eeee' },
      { id: 'p2', title: 'Vintage tube amp brought back to life', author: 'AudiophileFix', subreddit: 'vintageaudio', score: 2200, content: 'Tube amp is alive again after replacing capacitors and cleaning the volume pots.', permalink: '/r/vintageaudio/comments/ffff' },
      { id: 'p3', title: 'Rebinding a 1850s family bible', author: 'BookBinder', subreddit: 'bookbinding', score: 1500, content: 'Rebound an 1850s family bible with new linen hinges. The original boards survived nicely.', permalink: '/r/bookbinding/comments/gggg' },
      { id: 'p4', title: 'Restored 1960s mechanical watch', author: 'WatchRestorer', subreddit: 'WatchRepair', score: 1800, content: 'Mechanical watch cleaned and regulated. It is running at about +3 seconds per day now.', permalink: '/r/WatchRepair/comments/hhhh' },
      { id: 'p5', title: 'Grandmother’s sewing machine restored', author: 'SewingHeirloom', subreddit: 'sewing', score: 1200, content: 'Grandmother’s sewing machine cleaned, oiled, and back to stitching straight lines.', permalink: '/r/sewing/comments/jjjj' },
    ],
    connection: {
      theme: 'Restored & Revived',
      explanation: 'These posts share the satisfaction of bringing old objects back to life through careful restoration.',
      connectedPostIds: ['p1', 'p2', 'p3'],
      distractorPostIds: ['p4', 'p5'],
    },
    subredditQuestions: [
      { postId: 'p1', correctSubreddit: 'r/castiron', options: ['r/castiron', 'r/Restoration', 'r/Antiques'] },
      { postId: 'p2', correctSubreddit: 'r/vintageaudio', options: ['r/vintageaudio', 'r/audiophile', 'r/DIYAudio'] },
      { postId: 'p3', correctSubreddit: 'r/bookbinding', options: ['r/bookbinding', 'r/Restoration', 'r/Calligraphy'] },
    ],
  },
];

/**
 * Search terms used to replace each hand-written seed with a real Reddit post.
 * The subreddit comes from the seed post itself.
 */
const POST_SEARCH_QUERIES: Record<string, Record<string, string>> = {
  '2026-11-24': {
    p1: 'sourdough starter',
    p2: 'sourdough crumb shot',
    p3: 'bread dutch oven loaf',
    p4: '3d print benchy',
    p5: 'sourdough starter smell',
  },
  '2026-11-25': {
    p1: 'waterstone sharpening',
    p2: 'chisel mirror polish',
    p3: 'mechanical pencil lead',
    p4: 'rotring 600 pen',
    p5: 'watchmaking hairspring',
  },
  '2026-11-26': {
    p1: 'abandoned theater',
    p2: 'factory nature reclaiming',
    p3: 'moss sidewalk',
    p4: 'fern brick wall identification',
    p5: 'lichen gravestone',
  },
  '2026-11-27': {
    p1: 'hand cut dovetails',
    p2: 'hand forged knife',
    p3: 'fountain pen nib smoothing',
    p4: 'leather saddle stitching',
    p5: 'mechanical keyboard switch lubing',
  },
  '2026-11-28': {
    p1: 'snowflake microscope',
    p2: 'butterfly wing scales microscope',
    p3: 'pcb traces',
    p4: 'salt crystal formation',
    p5: 'cpu die shot',
  },
  '2026-11-29': {
    p1: 'astrophotography milky way',
    p2: 'light painting photography',
    p3: 'flashlight headlamp comparison',
    p4: 'bioluminescent waves',
    p5: 'firefly synchronization',
  },
  '2026-11-30': {
    p1: 'cast iron waffle iron restoration',
    p2: 'vintage tube amp restoration',
    p3: 'book binding restoration',
    p4: 'mechanical watch restoration',
    p5: 'sewing machine restoration',
  },
};

type RealPostMatch = {
  post: Post;
  thumbnailUrl: string;
};

function stripSubredditPrefix(value: string): string {
  return value.startsWith('r/') ? value.slice(2) : value;
}

function isRedditHostedUrl(value: string): boolean {
  try {
    const { hostname } = new URL(value);
    const host = hostname.toLowerCase();
    return (
      host === 'reddit.com' ||
      host.endsWith('.reddit.com') ||
      host === 'redd.it' ||
      host.endsWith('.redd.it') ||
      host === 'redditmedia.com' ||
      host.endsWith('.redditmedia.com')
    );
  } catch {
    return false;
  }
}

function isSafePost(post: Post): boolean {
  return (
    !post.nsfw &&
    !post.removed &&
    !post.spoiler &&
    !post.spam &&
    !post.quarantined &&
    post.title.trim().length > 0 &&
    post.permalink.length > 0
  );
}

async function findThumbnailUrl(post: Post): Promise<string | undefined> {
  const thumbnailUrl = post.thumbnail?.url;
  const galleryUrl = post.gallery[0]?.url;
  const directUrl =
    thumbnailUrl && isRedditHostedUrl(thumbnailUrl)
      ? thumbnailUrl
      : galleryUrl && isRedditHostedUrl(galleryUrl)
        ? galleryUrl
        : undefined;

  if (!directUrl) return undefined;

  try {
    const enriched = await post.getEnrichedThumbnail();
    const enrichedUrl = enriched?.image?.url;
    if (enrichedUrl && isRedditHostedUrl(enrichedUrl)) {
      return enrichedUrl;
    }
  } catch (error) {
    console.warn('Could not load enriched Reddit thumbnail:', error);
  }

  return directUrl;
}

async function findRealPostMatch(query: string, subredditName: string): Promise<RealPostMatch | null> {
  const searches = [
    { query, subredditName },
    { query },
  ];

  for (const search of searches) {
    try {
      const posts = await reddit
        .searchPosts({
          ...search,
          sort: 'top',
          timeframe: 'all',
          limit: 8,
          pageSize: 8,
        })
        .get(8);

      for (const post of posts) {
        if (!isSafePost(post)) continue;
        const thumbnailUrl = await findThumbnailUrl(post);
        if (thumbnailUrl) return { post, thumbnailUrl };
      }
    } catch (error) {
      console.warn(`Reddit post search failed for "${query}":`, error);
    }
  }

  return null;
}

function toPuzzlePost(id: string, match: RealPostMatch): PuzzlePost {
  const body = match.post.body?.trim() ?? '';
  const content = body.length > 900 ? `${body.slice(0, 897)}...` : body;

  return {
    id,
    title: match.post.title,
    author: match.post.authorName,
    subreddit: match.post.subredditName,
    score: match.post.score,
    thumbnailUrl: match.thumbnailUrl,
    permalink: match.post.permalink,
    content,
  };
}

function buildSubredditOptions(correctSubreddit: string, candidates: string[]): string[] {
  const options = [correctSubreddit];
  const fallbacks = ['r/pics', 'r/photography', 'r/DIY', 'r/science', 'r/AskReddit'];

  for (const candidate of [...candidates, ...fallbacks]) {
    const formatted = formatSubreddit(stripSubredditPrefix(candidate));
    if (!options.includes(formatted)) options.push(formatted);
    if (options.length === 3) break;
  }

  return options;
}

async function enrichPuzzleWithRealPosts(puzzle: Puzzle): Promise<Puzzle> {
  const queries = POST_SEARCH_QUERIES[puzzle.id] ?? {};
  const posts: PuzzlePost[] = [];

  for (const seedPost of puzzle.posts) {
    const query = queries[seedPost.id] ?? seedPost.title;
    const match = await findRealPostMatch(query, stripSubredditPrefix(seedPost.subreddit));
    posts.push(
      match
        ? toPuzzlePost(seedPost.id, match)
        : { ...seedPost, thumbnailUrl: undefined }
    );
  }

  const subredditQuestions = puzzle.subredditQuestions.map((question) => {
    const post = posts.find((candidate) => candidate.id === question.postId);
    const correctSubreddit = post ? formatSubreddit(post.subreddit) : question.correctSubreddit;
    const otherSubreddits = posts
      .filter((candidate) => candidate.id !== question.postId)
      .map((candidate) => candidate.subreddit);

    return {
      ...question,
      correctSubreddit,
      options: buildSubredditOptions(correctSubreddit, [
        ...otherSubreddits,
        ...question.options,
      ]),
    };
  });

  return { ...puzzle, posts, subredditQuestions };
}

export type UserProgress = {
  streak: number;
  totalCompleted: number;
  flairTier: FlairTier;
};

const PUZZLE_VERSION = '4';
const THUMBNAIL_RETRY_MS = 10 * 60 * 1000;

export async function seedPuzzles(): Promise<void> {
  let thumbnailCount = 0;

  for (const puzzle of DEFAULT_PUZZLES) {
    const enrichedPuzzle = await enrichPuzzleWithRealPosts(puzzle);
    thumbnailCount += enrichedPuzzle.posts.filter((post) => post.thumbnailUrl).length;
    await redis.set(`${KEYS.PUZZLE}${puzzle.id}`, JSON.stringify(enrichedPuzzle));
  }

  await redis.set(KEYS.PUZZLE_VERSION, PUZZLE_VERSION);
  await redis.set(KEYS.PUZZLE_THUMBNAILS, thumbnailCount >= 25 ? '1' : '0');
  await redis.set(KEYS.LAST_SEED_ATTEMPT, Date.now().toString());
}

export async function ensurePuzzlesSeeded(): Promise<void> {
  const currentVersion = await redis.get(KEYS.PUZZLE_VERSION);
  const hasThumbnails = await redis.get(KEYS.PUZZLE_THUMBNAILS);
  const lastAttemptValue = await redis.get(KEYS.LAST_SEED_ATTEMPT);
  const lastAttempt = lastAttemptValue ? Number(lastAttemptValue) : 0;
  const retryDue =
    !Number.isFinite(lastAttempt) || Date.now() - lastAttempt >= THUMBNAIL_RETRY_MS;

  if (currentVersion !== PUZZLE_VERSION || (hasThumbnails !== '1' && retryDue)) {
    await seedPuzzles();
  }
}

function parsePuzzle(data: string): Puzzle {
  const parsed: Puzzle = JSON.parse(data);
  return parsed;
}

function parseSession(data: string, puzzleId: string): GameSession {
  const stored: Partial<GameSession> = JSON.parse(data);
  return normalizeSession(stored, puzzleId);
}

function normalizeStage(value: unknown): GameState {
  if (value === 'STAGE_1' || value === 'STAGE_1_READY' || value === 'STAGE_1_FIRST_SUBMISSION') {
    return 'STAGE_1_READY';
  }
  if (value === 'STAGE_1_SECOND_CHANCE') return 'STAGE_1_SECOND_CHANCE';
  if (value === 'STAGE_1_SUCCESS') return 'STAGE_1_SUCCESS';
  if (value === 'STAGE_1_FAILED') return 'STAGE_1_FAILED';
  if (value === 'STAGE_2' || value === 'STAGE_2_READY') return 'STAGE_2_READY';
  if (value === 'STAGE_2_QUESTION_2') return 'STAGE_2_QUESTION_2';
  if (value === 'STAGE_2_QUESTION_3') return 'STAGE_2_QUESTION_3';
  if (value === 'RESULTS') return 'RESULTS';
  if (value === 'COMPLETED') return 'COMPLETED';
  return 'STAGE_1_READY';
}

function normalizeSession(stored: Partial<GameSession>, puzzleId: string): GameSession {
  const normalizedStage = normalizeStage(stored.stage);
  const stage1Correct =
    stored.stage1Correct === true ||
    normalizedStage === 'STAGE_1_SUCCESS' ||
    normalizedStage === 'STAGE_2_READY' ||
    normalizedStage === 'STAGE_2_QUESTION_2' ||
    normalizedStage === 'STAGE_2_QUESTION_3' ||
    normalizedStage === 'RESULTS' ||
    normalizedStage === 'COMPLETED';

  const selectedPostIds: string[] = [];
  if (Array.isArray(stored.selectedPostIds)) {
    for (const id of stored.selectedPostIds) {
      if (typeof id === 'string') selectedPostIds.push(id);
    }
  }

  const stage2Answers: Stage2Answer[] = [];
  if (Array.isArray(stored.stage2Answers)) {
    for (const item of stored.stage2Answers) {
      const answer: Partial<Stage2Answer> = item;
      if (
        typeof answer.postId === 'string' &&
        typeof answer.selectedSubreddit === 'string' &&
        typeof answer.isCorrect === 'boolean' &&
        typeof answer.lockedAt === 'number'
      ) {
        stage2Answers.push({
          postId: answer.postId,
          selectedSubreddit: answer.selectedSubreddit,
          isCorrect: answer.isCorrect,
          lockedAt: answer.lockedAt,
        });
      }
    }
  }

  const stage1Attempts = typeof stored.stage1Attempts === 'number' ? stored.stage1Attempts : 0;
  const startedAt = typeof stored.startedAt === 'number' ? stored.startedAt : Date.now();
  const storedCompletedAt = typeof stored.completedAt === 'number' ? stored.completedAt : undefined;
  const stage: GameState = storedCompletedAt ? 'COMPLETED' : normalizedStage;

  return {
    puzzleId: typeof stored.puzzleId === 'string' ? stored.puzzleId : puzzleId,
    stage,
    selectedPostIds,
    stage1Attempts,
    stage1Correct,
    stage2Answers,
    stage2CurrentQuestion:
      typeof stored.stage2CurrentQuestion === 'number'
        ? stored.stage2CurrentQuestion
        : stage2Answers.length,
    startedAt,
    completedAt: storedCompletedAt,
    score: stored.score,
    streak: stored.streak,
  };
}

function sessionKey(userId: string, puzzleId: string): string {
  return `${KEYS.SESSION}${userId}:${puzzleId}`;
}

async function readSession(userId: string, puzzleId: string): Promise<GameSession> {
  const data = await redis.get(sessionKey(userId, puzzleId));
  if (!data) throw new Error('Session not found');
  const session = parseSession(data, puzzleId);
  return session;
}

async function saveSession(userId: string, session: GameSession): Promise<void> {
  await redis.set(sessionKey(userId, session.puzzleId), JSON.stringify(session));
}

export async function getPuzzle(puzzleId?: string): Promise<Puzzle | null> {
  await ensurePuzzlesSeeded();

  const requestedId = puzzleId ?? getTodayPuzzleId();
  const data = await redis.get(`${KEYS.PUZZLE}${requestedId}`);
  if (data) return parsePuzzle(data);

  if (requestedId !== getTodayPuzzleId()) {
    const todayData = await redis.get(`${KEYS.PUZZLE}${getTodayPuzzleId()}`);
    if (todayData) return parsePuzzle(todayData);
  }

  for (const puzzle of DEFAULT_PUZZLES) {
    const fallbackData = await redis.get(`${KEYS.PUZZLE}${puzzle.id}`);
    if (fallbackData) return parsePuzzle(fallbackData);
  }

  return DEFAULT_PUZZLES[0] ?? null;
}

export async function getSession(
  userId: string,
  puzzleId: string
): Promise<{ session: GameSession | null; isNew: boolean }> {
  const data = await redis.get(sessionKey(userId, puzzleId));
  if (data) {
    const session = parseSession(data, puzzleId);
    await saveSession(userId, session);
    return { session, isNew: false };
  }

  const session: GameSession = {
    puzzleId,
    stage: 'STAGE_1_READY',
    selectedPostIds: [],
    stage1Attempts: 0,
    stage1Correct: false,
    stage2Answers: [],
    stage2CurrentQuestion: 0,
    startedAt: Date.now(),
  };
  await saveSession(userId, session);
  return { session, isNew: true };
}

function countCorrectSelectedPosts(puzzle: Puzzle, selectedPostIds: string[]): number {
  const correctIds = new Set(puzzle.connection.connectedPostIds);
  let count = 0;
  for (const id of selectedPostIds) {
    if (correctIds.has(id)) count += 1;
  }
  return count;
}

export async function submitStage1(
  userId: string,
  puzzleId: string,
  selectedPostIds: string[]
): Promise<{
  success: boolean;
  correct: boolean;
  attempts: number;
  correctCount: number;
  feedback: {
    correctCount: number;
    attempts: number;
    canRetry: boolean;
    failed: boolean;
  };
  session: GameSession;
}> {
  const puzzle = await getPuzzle(puzzleId);
  if (!puzzle) throw new Error('Puzzle not found');

  const session = await readSession(userId, puzzleId);
  const correctCount = countCorrectSelectedPosts(puzzle, selectedPostIds);

  if (session.stage1Correct) {
    return {
      success: true,
      correct: true,
      attempts: session.stage1Attempts,
      correctCount: 3,
      feedback: { correctCount: 3, attempts: session.stage1Attempts, canRetry: false, failed: false },
      session,
    };
  }

  if (session.stage1Attempts >= 2) {
    return {
      success: false,
      correct: false,
      attempts: session.stage1Attempts,
      correctCount,
      feedback: { correctCount, attempts: session.stage1Attempts, canRetry: false, failed: true },
      session,
    };
  }

  session.selectedPostIds = selectedPostIds;
  session.stage1Attempts += 1;

  if (correctCount === 3) {
    session.stage1Correct = true;
    session.stage = 'STAGE_1_SUCCESS';
    session.stage2CurrentQuestion = 0;
    session.stage2Answers = [];
    await saveSession(userId, session);
    return {
      success: true,
      correct: true,
      attempts: session.stage1Attempts,
      correctCount,
      feedback: { correctCount, attempts: session.stage1Attempts, canRetry: false, failed: false },
      session,
    };
  }

  const failed = session.stage1Attempts >= 2;
  session.stage = failed ? 'STAGE_1_FAILED' : 'STAGE_1_SECOND_CHANCE';
  await saveSession(userId, session);
  return {
    success: false,
    correct: false,
    attempts: session.stage1Attempts,
    correctCount,
    feedback: { correctCount, attempts: session.stage1Attempts, canRetry: !failed, failed },
    session,
  };
}

function stageForQuestion(questionIndex: number): GameState {
  if (questionIndex === 1) return 'STAGE_2_QUESTION_2';
  if (questionIndex === 2) return 'STAGE_2_QUESTION_3';
  return 'STAGE_2_READY';
}

export async function submitStage2(
  userId: string,
  puzzleId: string,
  postId: string,
  selectedSubreddit: string
): Promise<{
  correct: boolean;
  answer: Stage2Answer;
  nextQuestion: number;
  session: GameSession;
}> {
  const puzzle = await getPuzzle(puzzleId);
  if (!puzzle) throw new Error('Puzzle not found');

  const session = await readSession(userId, puzzleId);
  if (!session.stage1Correct) throw new Error('Stage 1 is not complete');

  const questionIndex = session.stage2CurrentQuestion;
  const existingAnswer = session.stage2Answers[questionIndex];
  if (existingAnswer) {
    return {
      correct: existingAnswer.isCorrect,
      answer: existingAnswer,
      nextQuestion: session.stage2CurrentQuestion,
      session,
    };
  }

  const question = puzzle.subredditQuestions[questionIndex];
  if (!question) throw new Error('No more questions');
  if (question.postId !== postId) throw new Error('Invalid post for current question');
  if (!question.options.includes(selectedSubreddit)) throw new Error('Invalid option');

  const answer: Stage2Answer = {
    postId,
    selectedSubreddit,
    isCorrect: selectedSubreddit === question.correctSubreddit,
    lockedAt: Date.now(),
  };

  session.stage2Answers.push(answer);
  session.stage2CurrentQuestion += 1;
  session.stage =
    session.stage2CurrentQuestion >= puzzle.subredditQuestions.length
      ? 'RESULTS'
      : stageForQuestion(session.stage2CurrentQuestion);

  await saveSession(userId, session);
  return {
    correct: answer.isCorrect,
    answer,
    nextQuestion: session.stage2CurrentQuestion,
    session,
  };
}

async function getProgress(userId: string): Promise<{ streak: number; totalCompleted: number }> {
  const streakData = await redis.get(`${KEYS.STREAK}${userId}`);
  const totalData = await redis.get(`${KEYS.TOTAL_COMPLETED}${userId}`);
  return {
    streak: streakData ? parseInt(streakData, 10) : 0,
    totalCompleted: totalData ? parseInt(totalData, 10) : 0,
  };
}

function toUtcDate(value: string): Date | null {
  const parts = value.split('-');
  if (parts.length !== 3) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

function isConsecutiveDate(previous: string, current: string): boolean {
  const previousDate = toUtcDate(previous);
  const currentDate = toUtcDate(current);
  if (!previousDate || !currentDate) return false;
  return currentDate.getTime() - previousDate.getTime() === 86_400_000;
}

async function completeDailyAttempt(userId: string): Promise<{ streak: number; totalCompleted: number }> {
  const today = getTodayPuzzleId();
  const playedKey = `${KEYS.PLAYED}${userId}:${today}`;
  const alreadyPlayed = await redis.get(playedKey);
  if (alreadyPlayed) return getProgress(userId);

  await redis.set(playedKey, '1');

  const progress = await getProgress(userId);
  const lastCompletedDate = await redis.get(`${KEYS.LAST_COMPLETED}${userId}`);
  const streak =
    lastCompletedDate && isConsecutiveDate(lastCompletedDate, today)
      ? progress.streak + 1
      : 1;
  const totalCompleted = progress.totalCompleted + 1;

  await redis.set(`${KEYS.STREAK}${userId}`, streak.toString());
  await redis.set(`${KEYS.LAST_COMPLETED}${userId}`, today);
  await redis.set(`${KEYS.TOTAL_COMPLETED}${userId}`, totalCompleted.toString());

  return { streak, totalCompleted };
}

export async function calculateScore(userId: string, puzzleId: string): Promise<GameScore> {
  const puzzle = await getPuzzle(puzzleId);
  if (!puzzle) throw new Error('Puzzle not found');

  const session = await readSession(userId, puzzleId);

  if (session.score) {
    const progress = await getProgress(userId);
    return {
      ...session.score,
      streak: session.score.streak || progress.streak,
      totalCompleted: session.score.totalCompleted || progress.totalCompleted,
      flairTier: session.score.flairTier || getFlairTier(progress.totalCompleted),
    };
  }

  const stage1Finished = session.stage === 'STAGE_1_FAILED' || session.stage1Attempts >= 2;
  if (!session.stage1Correct && !stage1Finished) {
    throw new Error('Stage 1 is still in progress');
  }
  if (
    session.stage1Correct &&
    session.stage2Answers.length < puzzle.subredditQuestions.length
  ) {
    throw new Error('Stage 2 is still in progress');
  }

  const progress = await completeDailyAttempt(userId);
  const correctGuesses = session.stage1Correct
    ? session.stage2Answers.filter((answer) => answer.isCorrect).length
    : 0;

  const score: GameScore = {
    connectionSolved: session.stage1Correct,
    correctSubredditGuesses: correctGuesses,
    starsEarned: session.stage1Correct ? correctGuesses : 0,
    streak: progress.streak,
    totalCompleted: progress.totalCompleted,
    flairTier: getFlairTier(progress.totalCompleted),
  };

  session.score = score;
  session.streak = progress.streak;
  session.completedAt = Date.now();
  session.stage = 'COMPLETED';
  await saveSession(userId, session);

  return score;
}

export async function getStreak(userId: string): Promise<UserProgress> {
  const progress = await getProgress(userId);
  return {
    ...progress,
    flairTier: getFlairTier(progress.totalCompleted),
  };
}
