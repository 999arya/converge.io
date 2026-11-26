/**
 * Converge Splash - Inline Feed View
 * Minecraft Boxy Aesthetic Entry Screen
 */

import './index.css';

import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { navigateTo, requestExpandedMode } from '@devvit/web/client';
import type { GetPuzzleResponse } from '../shared/api';
import type { GameScore, GameSession, PublicPuzzlePost } from '../shared/gameTypes';
import { sounds } from './utils/sound';

type SplashPostProps = {
  post: PublicPuzzlePost;
  index: number;
};

const SplashPost = ({ post, index }: SplashPostProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const showThumbnail = Boolean(post.thumbnailUrl) && !imageFailed;

  return (
    <div className="mc-card bg-white dark:bg-zinc-900 p-2.5 flex items-center gap-2.5 transition-transform hover:-translate-y-0.5">
      <div className="mc-slot w-10 h-10 shrink-0 flex items-center justify-center overflow-hidden">
        {showThumbnail ? (
          <img
            src={post.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="font-pixel text-[10px] text-emerald-400 font-bold">#{index + 1}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 leading-snug">
          {post.title}
        </p>
        <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
          u/{post.author} · {post.score.toLocaleString()} ↑
        </p>
      </div>
    </div>
  );
};

export const Splash = () => {
  const [posts, setPosts] = useState<PublicPuzzlePost[]>([]);
  const [session, setSession] = useState<GameSession | null>(null);
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

  const handleStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    sounds.playSelect();
    requestExpandedMode(e.nativeEvent, 'game');
  };

  return (
    <div className="flex flex-col h-full min-h-[380px] bg-amber-50/40 dark:bg-zinc-950 bg-pixel-grid p-3 sm:p-4 text-zinc-900 dark:text-zinc-100">
      {/* Top Boxy Brand Bar */}
      <div className="mc-card bg-emerald-700 text-white p-3 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-400 text-zinc-950 border-2 border-zinc-950 shadow-[2px_2px_0_#000] flex items-center justify-center font-pixel text-xs font-black">
            C
          </div>
          <div>
            <h1 className="font-pixel text-xs sm:text-sm tracking-wider uppercase text-amber-300 drop-shadow-[1px_1px_0_#000]">
              Converge
            </h1>
            <p className="text-[10px] font-mono text-emerald-100">DAILY REDDIT PUZZLE</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="mc-badge bg-zinc-900 text-amber-300 text-[9px] px-2 py-1 uppercase">
            {puzzleDate}
          </span>
        </div>
      </div>

      {/* Player Stats HUD */}
      <div className="grid grid-cols-4 gap-1.5 mb-3 text-center">
        <div className="mc-card bg-white dark:bg-zinc-900 p-1.5">
          <p className="text-[9px] font-mono text-zinc-500 uppercase">Streak</p>
          <p className="font-pixel text-[11px] text-amber-500 font-bold mt-0.5">🔥{streak}</p>
        </div>
        <div className="mc-card bg-white dark:bg-zinc-900 p-1.5">
          <p className="text-[9px] font-mono text-zinc-500 uppercase">Stars</p>
          <p className="font-pixel text-[11px] text-amber-400 font-bold mt-0.5">⭐{lifetimeStars}</p>
        </div>
        <div className="mc-card bg-white dark:bg-zinc-900 p-1.5">
          <p className="text-[9px] font-mono text-zinc-500 uppercase">Solved</p>
          <p className="font-pixel text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
            {totalCompleted}
          </p>
        </div>
        <div className="mc-card bg-white dark:bg-zinc-900 p-1.5">
          <p className="text-[9px] font-mono text-zinc-500 uppercase">Tier</p>
          <p className="font-pixel text-[8px] text-purple-600 dark:text-purple-400 font-bold mt-1 truncate">
            {flairTier}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center">
        {isCompleted ? (
          <div className="mc-card bg-emerald-50 dark:bg-zinc-900 border-emerald-600 p-4 text-center my-auto">
            <div className="inline-block mc-badge bg-emerald-600 text-white text-[10px] px-2.5 py-1 mb-2">
              TODAY'S CHALLENGE COMPLETED
            </div>
            <div className="text-3xl my-2 text-amber-400 drop-shadow-[2px_2px_0_#000]">
              {'★'.repeat(completedScore?.starsEarned ?? 0)}
              {'☆'.repeat(3 - (completedScore?.starsEarned ?? 0))}
            </div>
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {completedScore?.connectionSolved
                ? 'You solved the connection!'
                : 'Connection missed for today.'}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              {completedScore?.correctSubredditGuesses ?? 0} of 3 subreddits identified correctly.
            </p>
          </div>
        ) : (
          <div>
            <div className="mc-card bg-amber-100 dark:bg-zinc-900/90 p-2.5 mb-2.5">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                🎯 Connect 3 posts · Name 3 subreddits · Earn 3 stars
              </p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                5 posts are shown. 3 share a hidden theme, 2 are distractors. Can you find them?
              </p>
            </div>

            {loading ? (
              <div className="mc-card bg-white dark:bg-zinc-900 p-6 text-center text-xs text-zinc-500 font-mono">
                Loading today's posts...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {posts.slice(0, 4).map((post, idx) => (
                  <SplashPost key={post.id} post={post} index={idx} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="mt-3 pt-2">
        <button
          type="button"
          onClick={handleStart}
          className="w-full mc-btn mc-btn-gold py-3 px-4 text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
        >
          <span>⚔️</span>
          <span>{isCompleted ? "View Today's Result" : "Start Today's Challenge"}</span>
          <span>➔</span>
        </button>
      </div>

      {/* Footer Navigation */}
      <footer className="mt-2.5 flex items-center justify-center gap-3 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
        <button
          type="button"
          className="hover:text-amber-600 dark:hover:text-amber-400 underline cursor-pointer"
          onClick={() => navigateTo('https://developers.reddit.com/docs')}
        >
          Devvit Docs
        </button>
        <span>·</span>
        <button
          type="button"
          className="hover:text-amber-600 dark:hover:text-amber-400 underline cursor-pointer"
          onClick={() => navigateTo('https://www.reddit.com/r/Devvit')}
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
