/**
 * Seed Puzzles Script
 * Run this to populate KV with the 7 daily puzzles for hackathon demo
 * Usage: npx tsx scripts/seedPuzzles.ts
 */

import { devvit } from '@devvit/web/server';

// Puzzle data for 7 days (hackathon demo)
const PUZZLES = [
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
  // Day 2: Precision & Craft
  {
    id: '2024-11-14',
    date: '2024-11-14',
    posts: [
      { id: 'p1', title: 'My new Japanese waterstone progression', author: 'SharpEdge', subreddit: 'sharpening', score: 1200, permalink: '/r/sharpening/comments/aaa', isCorrectGroup: 0 },
      { id: 'p2', title: 'Finally got my chisel to mirror polish', author: 'WoodworkerJoe', subreddit: 'woodworking', score: 2100, permalink: '/r/woodworking/comments/bbb', isCorrectGroup: 0 },
      { id: 'p3', title: '0.3mm mechanical pencil lead comparison', author: 'LeadLover', subreddit: 'pencils', score: 800, permalink: '/r/pencils/comments/ccc', isCorrectGroup: 1 },
      { id: 'p4', title: 'Rotring 600 vs 800 - the ultimate test', author: 'PenAddict', subreddit: 'pens', score: 1500, permalink: '/r/pens/comments/ddd', isCorrectGroup: 1 },
      { id: 'p5', title: 'Watchmaking: installing a hairspring', author: 'Horologist', subreddit: 'watchmaking', score: 900, permalink: '/r/watchmaking/comments/eee', isCorrectGroup: 2 },
      { id: 'p6', title: 'Regulating my Seiko 7S26 to +2s/day', author: 'WatchNerd', subreddit: 'WatchRepair', score: 600, permalink: '/r/WatchRepair/comments/fff', isCorrectGroup: 2 },
    ],
    groups: [
      { id: 0, theme: 'Edge Geometry & Sharpening', subreddit: 'r/sharpening', postIds: ['p1', 'p2'], description: 'The pursuit of the perfect edge — waterstones, angles, and mirror polish.' },
      { id: 1, theme: 'Precision Writing Instruments', subreddit: 'r/pens', postIds: ['p3', 'p4'], description: 'Mechanical pencils and pens — lead sizes, tolerances, and engineering.' },
      { id: 2, theme: 'Micromechanics & Regulation', subreddit: 'r/watchmaking', postIds: ['p5', 'p6'], description: 'Tiny parts, huge precision — hairsprings, regulation, and chronometry.' },
    ],
    crossPollination: [
      { postId: 'p2', connectsGroups: [0, 1], bonusDescription: 'A woodworker\'s chisel and a pen enthusiast\'s Rotring both demand micron-level precision!' },
    ],
  },
  // Day 3: Urban Decay & Nature
  {
    id: '2024-11-15',
    date: '2024-11-15',
    posts: [
      { id: 'p1', title: 'Abandoned theater - nature taking over', author: 'UrbexPhoto', subreddit: 'AbandonedPorn', score: 4500, permalink: '/r/AbandonedPorn/comments/ggg', isCorrectGroup: 0 },
      { id: 'p2', title: 'Vines consuming an old factory', author: 'DecayHunter', subreddit: 'UrbanExploration', score: 2800, permalink: '/r/UrbanExploration/comments/hhh', isCorrectGroup: 0 },
      { id: 'p3', title: 'Moss garden in a cracked sidewalk', author: 'SidewalkBotanist', subreddit: 'moss', score: 1200, permalink: '/r/moss/comments/iii', isCorrectGroup: 1 },
      { id: 'p4', title: 'Tree growing through abandoned roof', author: 'NatureWins', subreddit: 'NatureReclaims', score: 3500, permalink: '/r/NatureReclaims/comments/jjj', isCorrectGroup: 1 },
      { id: 'p5', title: 'Ferns in brick mortar - identification?', author: 'PlantID', subreddit: 'whatsthisplant', score: 400, permalink: '/r/whatsthisplant/comments/kkk', isCorrectGroup: 2 },
      { id: 'p6', title: 'Lichen patterns on gravestones', author: 'LichenLover', subreddit: 'lichens', score: 300, permalink: '/r/lichens/comments/lll', isCorrectGroup: 2 },
    ],
    groups: [
      { id: 0, theme: 'Architecture Surrendering to Nature', subreddit: 'r/AbandonedPorn', postIds: ['p1', 'p2'], description: 'Human structures slowly consumed — theaters, factories, homes returning to earth.' },
      { id: 1, theme: 'Life in the Cracks', subreddit: 'r/NatureReclaims', postIds: ['p3', 'p4'], description: 'Moss, trees, vines finding footholds in concrete and brick.' },
      { id: 2, theme: 'Micro-Ecologies on Stone', subreddit: 'r/lichens', postIds: ['p5', 'p6'], description: 'The tiny worlds of ferns, mosses, and lichens on human-made surfaces.' },
    ],
    crossPollination: [
      { postId: 'p4', connectsGroups: [1, 0], bonusDescription: 'A tree growing through a roof bridges urban decay and natural reclamation!' },
    ],
  },
  // Day 4: Analog Craft
  {
    id: '2024-11-16',
    date: '2024-11-16',
    posts: [
      { id: 'p1', title: 'Hand-cut dovetails - 3rd attempt', author: 'JoineryJourney', subreddit: 'woodworking', score: 3200, permalink: '/r/woodworking/comments/mmm', isCorrectGroup: 0 },
      { id: 'p2', title: 'My first hand-forged knife', author: 'SmithyStart', subreddit: 'Blacksmith', score: 2800, permalink: '/r/Blacksmith/comments/nnn', isCorrectGroup: 0 },
      { id: 'p3', title: 'Fountain pen nib smoothing results', author: 'NibMeister', subreddit: 'fountainpens', score: 1800, permalink: '/r/fountainpens/comments/ooo', isCorrectGroup: 1 },
      { id: 'p4', title: 'Leather wallet - saddle stitching', author: 'LeatherCrafter', subreddit: 'Leathercraft', score: 1500, permalink: '/r/Leathercraft/comments/ppp', isCorrectGroup: 1 },
      { id: 'p5', title: 'Mechanical keyboard switch lubing guide', author: 'SwitchScientist', subreddit: 'MechanicalKeyboards', score: 4200, permalink: '/r/MechanicalKeyboards/comments/qqq', isCorrectGroup: 2 },
      { id: 'p6', title: 'Custom keycap set - GMK Olive', author: 'KeycapCollector', subreddit: 'MechanicalKeyboards', score: 1900, permalink: '/r/MechanicalKeyboards/comments/rrr', isCorrectGroup: 2 },
    ],
    groups: [
      { id: 0, theme: 'Traditional Hand Tools & Joinery', subreddit: 'r/woodworking', postIds: ['p1', 'p2'], description: 'Wood and steel shaped by hand — dovetails, forging, the sound of hammer on steel.' },
      { id: 1, theme: 'Fine Writing & Leather Craft', subreddit: 'r/fountainpens', postIds: ['p3', 'p4'], description: 'Nibs that glide, leather that ages — tools that become extensions of the hand.' },
      { id: 2, theme: 'Modern Mechanical Precision', subreddit: 'r/MechanicalKeyboards', postIds: ['p5', 'p6'], description: 'Switches, stabilizers, keycaps — engineered tactility for the digital age.' },
    ],
    crossPollination: [
      { postId: 'p2', connectsGroups: [0, 2], bonusDescription: 'A hand-forged knife and a lubed switch both celebrate tactile feedback and material honesty!' },
    ],
  },
  // Day 5: Micro Worlds
  {
    id: '2024-11-17',
    date: '2024-11-17',
    posts: [
      { id: 'p1', title: 'Snowflake under microscope - stellar dendrite', author: 'SnowCrystals', subreddit: 'microscopy', score: 5200, permalink: '/r/microscopy/comments/sss', isCorrectGroup: 0 },
      { id: 'p2', title: 'Butterfly wing scales at 500x', author: 'WingWatcher', subreddit: 'microscopy', score: 3100, permalink: '/r/microscopy/comments/ttt', isCorrectGroup: 0 },
      { id: 'p3', title: 'PCB traces - 0.1mm spacing', author: 'HardwareHacker', subreddit: 'PrintedCircuitBoard', score: 1800, permalink: '/r/PrintedCircuitBoard/comments/uuu', isCorrectGroup: 1 },
      { id: 'p3b', title: 'CPU die shot - Ryzen 7000', author: 'SiliconSleuth', subreddit: 'hardware', score: 4500, permalink: '/r/hardware/comments/vvv', isCorrectGroup: 1 },
      { id: 'p4', title: 'Salt crystal formation - time lapse', author: 'CrystalGrower', subreddit: 'crystals', score: 2200, permalink: '/r/crystals/comments/www', isCorrectGroup: 2 },
      { id: 'p5', title: 'Vitamin C crystallization patterns', author: 'ChemistryArt', subreddit: 'chemistry', score: 1600, permalink: '/r/chemistry/comments/xxx', isCorrectGroup: 2 },
    ],
    groups: [
      { id: 0, theme: 'Biological Microstructure', subreddit: 'r/microscopy', postIds: ['p1', 'p2'], description: 'Nature\'s architecture at microscopic scale — snowflakes, wing scales, cellular geometry.' },
      { id: 1, theme: 'Engineered Silicon Landscapes', subreddit: 'r/PrintedCircuitBoard', postIds: ['p3', 'p3b'], description: 'Human-designed microscopic worlds — traces, transistors, nanometer precision.' },
      { id: 2, theme: 'Chemical Crystallization', subreddit: 'r/crystals', postIds: ['p4', 'p5'], description: 'Molecules arranging themselves — salt, vitamins, supersaturated solutions.' },
    ],
    crossPollination: [
      { postId: 'p3', connectsGroups: [1, 0], bonusDescription: 'PCB traces and butterfly wings both use microscopic ridges for structural color/function!' },
    ],
  },
  // Day 6: Night & Light
  {
    id: '2024-11-18',
    date: '2024-11-18',
    posts: [
      { id: 'p1', title: 'Milky Way over abandoned gas station', author: 'AstroNomad', subreddit: 'astrophotography', score: 6200, permalink: '/r/astrophotography/comments/yyy', isCorrectGroup: 0 },
      { id: 'p2', title: 'Light painting - orbital tool', author: 'LightPainter', subreddit: 'lightpainting', score: 2800, permalink: '/r/lightpainting/comments/zzz', isCorrectGroup: 0 },
      { id: 'p3', title: 'Headlamp beam comparison - 2024 models', author: 'GearTester', subreddit: 'flashlight', score: 3400, permalink: '/r/flashlight/comments/aaaa', isCorrectGroup: 1 },
      { id: 'p4', title: 'Camping lantern runtime test', author: 'CampGear', subreddit: 'CampingGear', score: 1200, permalink: '/r/CampingGear/comments/bbbb', isCorrectGroup: 1 },
      { id: 'p5', title: 'Bioluminescent waves at midnight', author: 'OceanGlow', subreddit: 'natureismetal', score: 8500, permalink: '/r/natureismetal/comments/cccc', isCorrectGroup: 2 },
      { id: 'p6', title: 'Firefly synchronization in Great Smokies', author: 'BugWatcher', subreddit: 'Entomology', score: 2100, permalink: '/r/Entomology/comments/dddd', isCorrectGroup: 2 },
    ],
    groups: [
      { id: 0, theme: 'Capturing the Night Sky', subreddit: 'r/astrophotography', postIds: ['p1', 'p2'], description: 'Stars, galaxies, and light painted by hand — photography when the sun goes down.' },
      { id: 1, theme: 'Portable Illumination Tech', subreddit: 'r/flashlight', postIds: ['p3', 'p4'], description: 'Lumens, throw, runtime — the engineering of light you can carry.' },
      { id: 2, theme: 'Living Light in Nature', subreddit: 'r/natureismetal', postIds: ['p5', 'p6'], description: 'Bioluminescence — waves, fireflies, organisms that make their own light.' },
    ],
    crossPollination: [
      { postId: 'p1', connectsGroups: [0, 2], bonusDescription: 'An abandoned gas station under the Milky Way — human ruins lit by cosmic and biological light!' },
    ],
  },
  // Day 7: Restored & Revived
  {
    id: '2024-11-19',
    date: '2024-11-19',
    posts: [
      { id: 'p1', title: '1920s waffle iron restoration', author: 'CastIronChef', subreddit: 'castiron', score: 3800, permalink: '/r/castiron/comments/eeee', isCorrectGroup: 0 },
      { id: 'p2', title: 'Vintage tube amp brought back to life', author: 'AudiophileFix', subreddit: 'vintageaudio', score: 2200, permalink: '/r/vintageaudio/comments/ffff', isCorrectGroup: 0 },
      { id: 'p3', title: 'Rebinding a 1850s family bible', author: 'BookBinder', subreddit: 'bookbinding', score: 1500, permalink: '/r/bookbinding/comments/gggg', isCorrectGroup: 1 },
      { id: 'p4', title: 'Restored 1960s mechanical watch', author: 'WatchRestorer', subreddit: 'WatchRepair', score: 1800, permalink: '/r/WatchRepair/comments/hhhh', isCorrectGroup: 1 },
      { id: 'p5', title: 'Rusted pocket knife to mirror finish', author: 'KnifeRestore', subreddit: 'knives', score: 2500, permalink: '/r/knives/comments/iiii', isCorrectGroup: 2 },
      { id: 'p6', title: 'Grandmother\'s sewing machine restored', author: 'SewingHeirloom', subreddit: 'sewing', score: 1200, permalink: '/r/sewing/comments/jjjj', isCorrectGroup: 2 },
    ],
    groups: [
      { id: 0, theme: 'Metal & Heat Restoration', subreddit: 'r/castiron', postIds: ['p1', 'p2'], description: 'Iron and vacuum tubes — rust removed, seasoning rebuilt, electrons flowing again.' },
      { id: 1, theme: 'Paper & Precision Mechanics', subreddit: 'r/bookbinding', postIds: ['p3', 'p4'], description: 'Leather, paper, gears — centuries-old craftsmanship repaired by steady hands.' },
      { id: 2, theme: 'Everyday Tools Renewed', subreddit: 'r/knives', postIds: ['p5', 'p6'], description: 'Knives, machines — objects of daily use returned to function and beauty.' },
    ],
    crossPollination: [
      { postId: 'p2', connectsGroups: [0, 1], bonusDescription: 'A tube amplifier and a mechanical watch — both measure time through controlled energy release!' },
    ],
  },
];

// This script would be run via Devvit CLI or a custom endpoint
// For now, it's a reference data file
console.log('Puzzle data loaded:', PUZZLES.length, 'puzzles');
console.log('Total posts:', PUZZLES.reduce((sum, p) => sum + p.posts.length, 0));

export { PUZZLES };