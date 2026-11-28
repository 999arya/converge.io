/**
 * LoadingAnimation Component - 2 to 3 second branded animation for CONVERGE.
 * Matches the project's exact aesthetic: Delta glyph, blue/purple/orange gradients,
 * converging beams, and animated letter-spacing shimmer.
 */

import { useEffect, useState } from 'react';

type LoadingAnimationProps = {
  durationMs?: number;
  onComplete?: () => void;
  message?: string;
};

export const LoadingAnimation = ({
  durationMs = 2400,
  onComplete,
  message = "Loading today's puzzle...",
}: LoadingAnimationProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / durationMs) * 100));
      setProgress(pct);
      if (elapsed >= durationMs) {
        clearInterval(interval);
        onComplete?.();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [durationMs, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[460px] h-full w-full px-4 py-12 select-none">
      <div className="relative flex flex-col items-center justify-center">
        <div className="absolute inset-x-0 -top-8 flex items-center justify-center pointer-events-none opacity-80">
          <div
            className="w-24 sm:w-36 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-purple-500 animate-line-left"
            style={{ marginRight: '30px' }}
          />
          <div
            className="w-24 sm:w-36 h-[2px] bg-gradient-to-l from-transparent via-orange-500 to-purple-500 animate-line-right"
            style={{ marginLeft: '30px' }}
          />
        </div>

        <div className="relative mb-6">
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 opacity-30 blur-lg animate-pulse-ring" />
          <div
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold shadow-xl animate-converge-logo"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 60%, #ea580c 100%)',
            }}
          >
            <span className="transform -translate-y-0.5 tracking-tighter">△</span>
          </div>
        </div>

        <div className="text-center overflow-hidden">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-widest uppercase animate-converge-title">
            <span className="animate-converge-shimmer drop-shadow-sm">
              Converge
            </span>
          </h1>
          <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400 mt-2 animate-fade-delayed">
            Daily Social Discovery Puzzle
          </p>
        </div>

        <div className="w-48 sm:w-60 mt-8 space-y-2">
          <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-75 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #3b82f6, #a855f7, #ea580c)',
              }}
            />
          </div>
          <p className="text-xs text-center text-gray-400 dark:text-gray-500 font-mono">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
