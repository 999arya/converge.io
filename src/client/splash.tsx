/**
 * Converge Splash - Inline Feed View
 * Light Mode Only - Minecraft Boxy Aesthetic Entry Screen for Reddit Feed
 */

import './index.css';

import { StrictMode, useEffect, useState, type MouseEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { navigateTo, requestExpandedMode } from '@devvit/web/client';
import type { GetPuzzleResponse } from '../shared/api';
import type { PublicGameSession } from '../shared/gameTypes';
import { PixelPalmBanner } from './components/PixelArt';
import { sounds } from './utils/sound';

export const Splash = () => {
  const [session, setSession] = useState<PublicGameSession | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [lifetimeStars, setLifetimeStars] = useState(0);
  const [flairTier, setFlairTier] = useState('Novice');

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
          setSession(data.session ?? null);
          setStreak(data.streak);
          setTotalCompleted(data.totalCompleted);
          setLifetimeStars(data.lifetimeStars);
          setFlairTier(data.flairTier);
        }
      } catch {
        // Stats stay at their defaults if the feed preview cannot load.
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

      <PixelPalmBanner className="mc-card mb-2.5 aspect-[200/48] max-h-20 w-full" />

      {/* Player Stats HUD */}
      <div className="grid grid-cols-4 gap-1.5 mb-2.5 text-center">
        <div className="mc-card bg-white p-1.5">
          <p className="text-[9px] font-mono text-zinc-900 uppercase">Streak</p>
          <p className="font-pixel text-[11px] text-amber-800 font-bold mt-0.5">🔥{streak}</p>
        </div>
        <div className="mc-card bg-white p-1.5">
          <p className="text-[9px] font-mono text-zinc-900 uppercase">Stars</p>
          <p className="font-pixel text-[11px] text-amber-700 font-bold mt-0.5">⭐{lifetimeStars}</p>
        </div>
        <div className="mc-card bg-white p-1.5">
          <p className="text-[9px] font-mono text-zinc-900 uppercase">Solved</p>
          <p className="font-pixel text-[11px] text-emerald-700 font-bold mt-0.5">
            {totalCompleted}
          </p>
        </div>
        <div className="mc-card bg-white p-1.5">
          <p className="text-[9px] font-mono text-zinc-900 uppercase">Tier</p>
          <p className="font-pixel text-[8px] text-purple-800 font-bold mt-1 truncate">
            {flairTier}
          </p>
        </div>
      </div>

      {/* Puzzle content only appears after entering the game. */}
      <div className="flex-1" aria-hidden="true" />

      {/* Action Bar */}
      <div className="mt-auto shrink-0 pt-3">
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
      <footer className="mt-2 shrink-0 pb-1 flex items-center justify-center gap-3 text-[10px] font-mono text-zinc-900">
        <button
          type="button"
          className="hover:text-amber-800 underline cursor-pointer"
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
          className="hover:text-amber-800 underline cursor-pointer"
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
