# Converge - Daily Puzzle Game for Reddit

Converge is a Devvit Web interactive post where players find the hidden connection between five Reddit posts, then identify the source subreddit for each connected post.

## Game Loop

Each daily puzzle contains:

- 5 Reddit posts
- 3 connected posts
- 2 distractors
- 2 stages
- Maximum 3 stars

### Stage 1: Find the connection

- The player selects exactly 3 posts.
- Attempts are unlimited: a wrong submission reveals how many selected posts were connected, and the player can keep changing the selection.
- Stage 1 ends only when the correct three posts are found.

### Stage 2: Identify source subreddits

- For each connected post, the player chooses from 3 subreddit options.
- Answers are editable until the final reveal, so every question has unlimited attempts.
- Correctness is hidden until results are revealed.
- Each correct answer earns 1 star.

### Development replay

- A yellow **Replay (Dev)** button appears after a wrong Stage 1 attempt, and a **Replay Daily Challenge (Dev)** button appears on the results screen.
- Replay clears only the current puzzle session. Daily stars, streak, and totals are still awarded at most once per day.
- `src/shared/gameConfig.ts` contains the temporary controls: set `DEV_REPLAY_ENABLED` to `false` and `STAGE1_ATTEMPT_CAP` to `3` when the production three-attempt rule is enabled.

## Project Structure

```
src/
├── client/
│   ├── components/
│   │   ├── GameBoard.tsx
│   │   ├── Header.tsx
│   │   └── PostCard.tsx
│   ├── hooks/useGame.ts
│   ├── game.tsx
│   └── splash.tsx
├── server/
│   ├── core/puzzleStore.ts
│   ├── routes/gameApi.ts
│   └── index.ts
└── shared/
    ├── api.ts
    ├── gameConfig.ts
    └── gameTypes.ts
```

Puzzle data lives in `src/server/core/puzzleStore.ts`. Puzzles are seeded into KV automatically on first access and on app install, so no manual seed command is needed.

During seeding, each hand-curated puzzle slot is replaced with a real Reddit post found via the Reddit API. Only safe posts with Reddit-hosted thumbnails are used, so cards show actual Reddit media. This requires the `reddit` permission in `devvit.json`.

## API Endpoints

- `GET /api/game/puzzle` - Load the public puzzle and session.
- `POST /api/game/stage1` - Submit the 3-post selection.
- `POST /api/game/stage2` - Save or replace one subreddit answer.
- `POST /api/game/replay` - Development-only session reset.
- `POST /api/game/finalize` - Finalize score and return the reveal.
- `GET /api/game/streak` - Load streak, completed count, and flair.
- `POST /api/game/seed` - Re-seed puzzles manually if needed.

## Progression

Flair is based on completed daily puzzles:

| Completed puzzles | Flair |
|---:|---|
| 1 | Novice |
| 5 | Connector |
| 15 | Pattern Seeker |
| 30 | Community Explorer |
| 60 | Converger |

A completed attempt counts even with wrong answers. Missing a day resets the streak.

## Development

```bash
npm install
npm run dev
npm run test:types
npx eslint src --ext .ts,.tsx
npm run build
```

Playtest URL:

```
https://www.reddit.com/r/converge_io_dev/?playtest=converge-io
```
