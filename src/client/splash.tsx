/**
 * Converge Splash - Inline Feed View
 * Light Mode Only - Minecraft Boxy Aesthetic Entry Screen for Reddit Feed
 */

import './index.css';

import { StrictMode, useEffect, useState, type MouseEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { navigateTo, requestExpandedMode } from '@devvit/web/client';
import type { GetPuzzleResponse } from '../shared/api';
import type { GameScore, PublicGameSession, PublicPuzzlePost } from '../shared/gameTypes';
import { PixelPalmBanner } from './components/PixelArt';
import { sounds } from './utils/sound';

type SplashPostProps = {
  post: PublicPuzzlePost;
  index: number;
};

const SplashPost = ({ post, index }: SplashPostProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const showThumbnail = Boolean(post.thumbnailUrl) && !imageFailed;

  return (
    <div className="mc-card bg-white p-2.5 flex items-center gap-2.5 transition-transform hover:-translate-y-0.5">
      <div className="mc-slot w-10 h-10 shrink-0 flex items-center justify-center overflow-hidden bg-zinc-100">
        {showThumbnail ? (
          <img
            src={post.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="font-pixel text-[10px] text-amber-800 font-bold">#{index + 1}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-zinc-950 line-clamp-1 leading-snug">
          {post.title}
        </p>
        <p className="text-[10px] font-mono text-zinc-700 truncate mt-0.5">
          u/{post.author} · ↑ {post.score.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export const Splash = () => {
  const [posts, setPosts] = useState<PublicPuzzlePost[]>([]);
  const [session, setSession] = useState<PublicGameSession | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [lifetimeStars, setLifetimeStars] = useState(0);
  const [flairTier, setFlairTier] = useState('Novice');
  const [loading, setLoading] = useState(true);

  const puzzleDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const response = await fetch('/api/game/puzzle');
        if (!response.ok) return;
        const data: GetPuzzleResponse = await response.json();
        if (active) {
          setPosts(data.puzzle.posts);
          setSession(data.session ?? null);
          setStreak(data.streak);
          setTotalCompleted(data.totalCompleted);
          setLifetimeStars(data.lifetimeStars);
          setFlairTier(data.flairTier);
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    };

    void loadData();
    return () => {
      active = false;
    };
  }, []);

  const isCompleted = Boolean(
    session?.completedAt || session?.stage === 'COMPLETED' || session?.score
  );
  const completedScore: GameScore | undefined = session?.score;

  const handleStart = (e: MouseEvent<HTMLButtonElement>) => {
    sounds.playSelect();
    requestExpandedMode(e.nativeEvent, 'game');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#faf8f5] bg-pixel-grid p-3 sm:p-4 pb-4 text-zinc-900">
      {/* Top Boxy Brand Bar */}
      <div className="mc-card bg-emerald-700 text-white p-3 flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-400 text-zinc-950 border-2 border-zinc-950 shadow-[2px_2px_0_#090d16] flex items-center justify-center font-pixel text-xs font-black">
            C
          </div>
          <div>
            <h1 className="font-pixel text-xs sm:text-sm tracking-wider uppercase text-amber-300 drop-shadow-[1px_1px_0_#000]">
              CONVERGE
            </h1>
            <p className="text-[9px] font-mono text-emerald-100">DAILY REDDIT DISCOVERY QUEST</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="mc-badge bg-zinc-950 text-amber-300 text-[9px] px-2 py-1 uppercase font-pixel">
            {puzzleDate}
          </span>
        </div>
      </div>

      <PixelPalmBanner className="mc-card mb-2.5 h-10 w-full" />

      {/* Player Stats HUD */}
      <div className="grid grid-cols-4 gap-1.5 mb-2.5 text-center">
        <div className="mc-card bg-white p-1.5">
          <p className="text-[9px] font-mono text-zinc-700 uppercase">Streak</p>
          <p className="font-pixel text-[11px] text-amber-800 font-bold mt-0.5">🔥{streak}</p>
        </div>
        <div className="mc-card bg-white p-1.5">
          <p className="text-[9px] font-mono text-zinc-700 uppercase">Stars</p>
          <p className="font-pixel text-[11px] text-amber-700 font-bold mt-0.5">⭐{lifetimeStars}</p>
        </div>
        <div className="mc-card bg-white p-1.5">
          <p className="text-[9px] font-mono text-zinc-700 uppercase">Solved</p>
          <p className="font-pixel text-[11px] text-emerald-700 font-bold mt-0.5">
            {totalCompleted}
          </p>
        </div>
        <div className="mc-card bg-white p-1.5">
          <p className="text-[9px] font-mono text-zinc-700 uppercase">Tier</p>
          <p className="font-pixel text-[8px] text-purple-700 font-bold mt-1 truncate">
            {flairTier}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-start sm:justify-center my-1">
        {isCompleted ? (
          <div className="mc-card bg-emerald-50 border-emerald-600 p-4 text-center my-auto">
            <div className="inline-block mc-badge bg-emerald-600 text-white text-[9px] px-2.5 py-1 mb-2 font-pixel">
              TODAY'S QUEST COMPLETED
            </div>
            <div className="text-3xl my-2 text-amber-700 drop-shadow-[2px_2px_0_#000]">
              {'★'.repeat(completedScore?.starsEarned ?? 0)}
              {'☆'.repeat(3 - (completedScore?.starsEarned ?? 0))}
            </div>
            <p className="text-xs font-bold text-zinc-900">
              {completedScore?.connectionSolved
                ? '✨ You conquered the daily connection!'
                : 'Connection missed for today.'}
            </p>
            <p className="text-[11px] font-mono text-zinc-700 mt-1">
              {completedScore?.correctSubredditGuesses ?? 0} of 3 subreddits identified.
            </p>
          </div>
        ) : (
          <div>
            {/* Rules Overview Banner */}
            <div className="mc-card bg-amber-100 p-2.5 mb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-950">
                <span>🎯</span>
                <span>HOW TO PLAY:</span>
              </div>
              <p className="text-[11px] text-zinc-800 mt-1 font-mono leading-tight">
                1. Inspect 5 Reddit posts & pick the 3 connected posts (2 are distractors).
                <br />
                2. Identify the originating subreddit for each connected post.
                <br />
                3. Earn up to 3 stars & expand your community discovery collection!
              </p>
            </div>

            {loading ? (
              <div className="mc-card bg-white p-5 text-center text-xs text-zinc-700 font-mono">
                Loading today's challenge...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1">
                {posts.slice(0, 4).map((post, idx) => (
                  <SplashPost key={post.id} post={post} index={idx} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="mt-auto shrink-0 pt-3">
        <div className="mc-card bg-amber-400 text-zinc-950 p-2 mb-1.5 text-center">
          <p className="font-pixel text-[10px] font-black uppercase tracking-widest">
            {isCompleted ? "▶ TODAY'S RESULT READY" : '▶ START GAME TO ENTER'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleStart}
          className="w-full mc-btn mc-btn-gold py-3 px-4 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider animate-pulse-gold"
        >
          <span>⚔️</span>
          <span>{isCompleted ? "VIEW TODAY'S RESULT" : 'START GAME'}</span>
          <span>➔</span>
        </button>
      </div>

      {/* Footer Navigation */}
      <footer className="mt-2 shrink-0 pb-1 flex items-center justify-center gap-3 text-[10px] font-mono text-zinc-700">
        <button
          type="button"
          className="hover:text-amber-700 underline cursor-pointer"
          onClick={() => {
            sounds.playClick();
            navigateTo('https://developers.reddit.com/docs');
          }}
        >
          Devvit Docs
        </button>
        <span>·</span>
        <button
          type="button"
          className="hover:text-amber-700 underline cursor-pointer"
          onClick={() => {
            sounds.playClick();
            navigateTo('https://www.reddit.com/r/Devvit');
          }}
        >
          r/Devvit
        </button>
      </footer>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
