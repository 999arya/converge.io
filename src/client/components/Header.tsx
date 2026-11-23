/**
 * Header Component - Game header with title, streak, and menu
 */

import { useGame } from '../hooks/useGame';

export const Header = () => {
  const { session } = useGame();
  const streak = session?.streak ?? 0;

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #a855f7)' }}>
          △
        </div>
        <div>
          <h1 className="font-bold text-xl text-gray-900 dark:text-white">Converge</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Daily Puzzle</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Streak */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/30">
          <span className="text-orange-500 dark:text-orange-400">🔥</span>
          <span className="font-mono font-semibold text-orange-600 dark:text-orange-300">
            {streak}
          </span>
        </div>

        {/* Settings/Menu - placeholder */}
        <button
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Menu"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </header>
  );
};