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
- The player gets 2 total attempts.
- A wrong first attempt reveals how many selected posts were connected and allows one retry.
- A wrong second attempt ends Stage 1.

### Stage 2: Identify source subreddits

- For each connected post, the player chooses from 3 subreddit options.
- Each question has one attempt.
- Answers lock permanently.
- Each correct answer earns 1 star.

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
    └── gameTypes.ts
```

Puzzle data lives in `src/server/core/puzzleStore.ts`. Puzzles are seeded into KV automatically on first access and on app install, so no manual seed command is needed.

During seeding, each hand-curated puzzle slot is replaced with a real Reddit post found via the Reddit API. Only safe posts with Reddit-hosted thumbnails are used, so cards show actual Reddit media. This requires the `reddit` permission in `devvit.json`.

## API Endpoints

- `GET /api/game/puzzle` - Load the public puzzle and session.
- `POST /api/game/stage1` - Submit the 3-post selection.
- `POST /api/game/stage2` - Submit one locked subreddit answer.
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
