# Converge - Daily Puzzle Game for Reddit

A Devvit web application where players group Reddit posts by hidden connections, then discover the theme and subreddit for each group.

## Game Concept

Each day, players see 7 Reddit posts from 3 different subreddits (names hidden). They must group related posts together. On submit, the reveal shows:
- The hidden theme connecting each group
- The actual subreddit each group came from
- Cross-pollination bonuses for posts that bridge groups

## Project Structure

```
src/
├── client/                    # Frontend (React, runs in iframe on Reddit)
│   ├── components/
│   │   ├── Header.tsx         # Game header with streak/flair
│   │   ├── PostCard.tsx       # Individual Reddit post card
│   │   ├── GroupZone.tsx      # Drop zone for a group
│   │   └── GameBoard.tsx      # Main game grid + reveal screen
│   ├── hooks/
│   │   ├── useCounter.ts      # Legacy counter hook (reference)
│   │   └── useGame.ts         # Main game logic hook
│   ├── game.tsx               # Expanded view entry point
│   ├── splash.tsx             # Inline feed view entry point
│   ├── game.html              # HTML for expanded view
│   ├── splash.html            # HTML for inline view
│   ├── index.css              # Tailwind + custom styles
│   ├── global.ts              # CSS module declarations
│   └── module.d.ts            # Asset module declarations
├── server/                    # Backend (Node.js, Hono, tRPC)
│   ├── core/
│   │   ├── post.ts            # Legacy post creation (reference)
│   │   └── puzzleStore.ts     # KV operations for puzzles/sessions/streaks
│   ├── routes/
│   │   ├── api.ts             # Legacy counter API (reference)
│   │   ├── gameApi.ts         # Game API endpoints
│   │   ├── forms.ts           # Legacy forms (reference)
│   │   ├── menu.ts            # Legacy menu (reference)
│   │   └── triggers.ts        # Legacy triggers (reference)
│   └── index.ts               # Server entry point (Hono app)
├── shared/                    # Shared types between client/server
│   ├── api.ts                 # API request/response types
│   └── gameTypes.ts           # Core game type definitions
scripts/
└── seedPuzzles.ts             # Puzzle data for 7-day hackathon demo
```

## Game Types (src/shared/gameTypes.ts)

- `PuzzlePost` - Reddit post with metadata
- `PuzzleGroup` - Hidden theme + subreddit + post IDs
- `Puzzle` - Complete daily puzzle
- `PlayerGroup` - Player's grouping attempt
- `GameSession` - Player's session state
- `GameScore` - Scoring results
- `FlairTier` - Streak-based flair progression

## API Endpoints (src/server/routes/gameApi.ts)

- `GET /api/game/puzzle` - Get today's puzzle (groups hidden)
- `POST /api/game/submit` - Submit grouping, get score + full reveal
- `GET /api/game/streak` - Get user's streak and flair tier
- `POST /api/game/seed` - Seed puzzles into KV (run once)

## KV Storage Keys

- `puzzle:{id}` - Puzzle data
- `session:{userId}:{puzzleId}` - Player session
- `streak:{userId}` - Current streak count
- `played:{userId}:{date}` - Daily play tracking

## Development

```bash
# Install dependencies
npm install

# Start dev server (playtest)
npm run dev

# Type check
npm run test:types

# Lint
npm run lint

# Build
npm run build

# Deploy
npm run deploy
```

## Seeding Puzzles

After first deploy, call the seed endpoint:
```
POST /api/game/seed
```
Or run the seed script data manually via Devvit KV.

## Hackathon Demo

7 puzzles defined in `scripts/seedPuzzles.ts`:
1. **Day 1** - Fermentation & Temperature (Breadit, 3Dprinting, AskBaking)
2. **Day 2** - Precision & Craft (sharpening, pens, watchmaking)
3. **Day 3** - Urban Decay & Nature (AbandonedPorn, NatureReclaims, lichens)
4. **Day 4** - Analog Craft (woodworking, fountainpens, MechanicalKeyboards)
5. **Day 5** - Micro Worlds (microscopy, PrintedCircuitBoard, crystals)
6. **Day 6** - Night & Light (astrophotography, flashlight, natureismetal)
7. **Day 7** - Restored & Revived (castiron, bookbinding, knives)

## Flair Tiers

| Streak | Tier | Label |
|--------|------|-------|
| 0-2 | Novice | 🔰 Novice |
| 3-6 | Seeker | 🔍 Seeker |
| 7-13 | Connector | 🔗 Connector |
| 14-29 | Cartographer | 🗺️ Cartographer |
| 30+ | Converger | ✨ Converger |

## Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, Vite
- **Backend**: Node.js 22, Hono, tRPC
- **Platform**: Devvit (Reddit's developer platform)
- **Storage**: Devvit KV (Redis)

## Deployment

1. `npm run build`
2. `devvit upload`
3. `devvit publish`

## License

BSD-3-Clause