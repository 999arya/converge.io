/**
 * Header Component - Light Theme Minecraft Boxy HUD Header
 * Shows brand, flair tier XP bar, streak counter, and audio toggle.
 */

import { useState } from 'react';
import { useGame } from '../hooks/useGame';
import { sounds } from '../utils/sound';

export const Header = () => {
  const { streak, totalCompleted, flairTier, puzzle } = useGame();
  const [muted, setMuted] = useState(() => sounds.getMuted());

  const handleToggleSound = () => {
    if (!muted) {
      sounds.playClick();
    }
    const nextMuted = sounds.toggleMute();
    setMuted(nextMuted);
    if (!nextMuted) {
      sounds.playSelect();
    }
  };

  // Calculate XP progress to next flair tier
  const getTierTarget = (completed: number): { current: number; max: number; nextName: string } => {
    if (completed < 5) return { current: completed, max: 5, nextName: 'Connector' };
    if (completed < 15) return { current: completed - 5, max: 10, nextName: 'Pattern Seeker' };
    if (completed < 30) return { current: completed - 15, max: 15, nextName: 'Community Explorer' };
    if (completed < 60) return { current: completed - 30, max: 30, nextName: 'Converger' };
    return { current: 60, max: 60, nextName: 'Max Level' };
  };

  const xp = getTierTarget(totalCompleted);
  const xpPercent = Math.min(100, Math.round((xp.current / xp.max) * 100));

  const displayDate = puzzle?.date
    ? new Date(puzzle.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-zinc-950 shadow-[0_3px_0_#090d16] px-3 sm:px-6 py-2.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-400 text-zinc-950 border-2 border-zinc-950 shadow-[2px_2px_0_#090d16] flex items-center justify-center font-pixel text-xs sm:text-sm font-black select-none transform hover:-rotate-3 transition-transform">
            C
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-pixel text-xs sm:text-sm tracking-wider text-zinc-950 uppercase select-none">
                CONVERGE
              </h1>
              <span className="hidden sm:inline-block mc-badge bg-zinc-900 text-amber-300 text-[8px] px-1.5 py-0.5 uppercase">
                {displayDate}
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-900">
              DAILY REDDIT PUZZLE
            </p>
          </div>
        </div>

        {/* Center: Minecraft XP Bar */}
        <div className="hidden md:flex flex-col items-center min-w-[200px] max-w-[260px] flex-1 px-4">
          <div className="w-full flex items-center justify-between text-[9px] font-mono mb-1 text-zinc-900 font-bold uppercase">
            <span>Tier: {flairTier}</span>
            <span>
              {xp.current}/{xp.max} XP
            </span>
          </div>
          <div className="w-full mc-xp-container" title={`${xpPercent}% to ${xp.nextName}`}>
            <div className="mc-xp-fill" style={{ width: `${xpPercent}%` }} />
          </div>
        </div>

        {/* Right: Streak & Controls */}
        <div className="flex items-center gap-2">
          {/* Daily Streak Badge */}
          <div
            className="mc-badge bg-amber-100 text-amber-900 px-2.5 py-1 text-[10px] sm:text-xs font-bold"
            title="Current Daily Streak"
          >
            <span>🔥</span>
            <span>{streak}</span>
          </div>

          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={handleToggleSound}
            className="mc-btn mc-btn-slate w-8 h-8 text-xs p-0 flex items-center justify-center"
            title={muted ? 'Unmute sound effects' : 'Mute sound effects'}
            aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
          >
            <span>{muted ? '🔇' : '🔊'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
