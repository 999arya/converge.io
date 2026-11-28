/**
 * Header Component - Game header with title, streak, and progress.
 */

import { useGame } from '../hooks/useGame';

export const Header = () => {
  const { streak, totalCompleted, flairTier, isModerator } = useGame();

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #a855f7)' }}
        >
          △
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-xl text-gray-900 dark:text-white">Converge</h1>
            {isModerator && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                Mod
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{flairTier}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/30">
          <span className="text-orange-500 dark:text-orange-400">🔥</span>
          <span className="font-mono font-semibold text-orange-600 dark:text-orange-300">{streak}</span>
        </div>
        <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">
          {totalCompleted} completed
        </div>
      </div>
    </header>
  );
};
