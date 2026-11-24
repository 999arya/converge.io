/**
 * Converge Splash - Inline Feed View
 */

import './index.css';

import { navigateTo, requestExpandedMode } from '@devvit/web/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

export const Splash = () => {
  const puzzleDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col h-full min-h-[300px] bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #a855f7)' }}
          >
            △
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 dark:text-white">Converge</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Daily Puzzle</p>
          </div>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
          {puzzleDate}
        </span>
      </div>

      <div className="flex-1 p-4">
        <div className="text-center mb-4">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            Find the three posts that belong together.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            5 posts · 3 connected · 2 distractors · 2 stages
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
          {[
            'My sourdough starter finally doubled in 4 hours!',
            'Crumb shot: 75% hydration, cold retard 18h',
            'My Ender 3 prints perfect benchys now',
            'First loaf in my new Challenger bread pan',
          ].map((title) => (
            <div
              key={title}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
          className="w-full py-3 px-6 rounded-xl font-semibold text-base text-white transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #d93900, #ea580c)',
            boxShadow: '0 4px 14px rgba(217, 57, 0, 0.3)',
          }}
        >
          Start Today's Puzzle
        </button>
      </div>

      <footer className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-3 text-[0.75rem] text-gray-500 dark:text-gray-400">
          <button
            className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            onClick={() => navigateTo('https://developers.reddit.com/docs')}
          >
            Docs
          </button>
          <span>·</span>
          <button
            className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            onClick={() => navigateTo('https://www.reddit.com/r/Devvit')}
          >
            r/Devvit
          </button>
        </div>
      </footer>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
