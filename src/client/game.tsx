/**
 * Converge Game - Expanded View Entry Point
 * Light Mode Only - Minecraft Boxy Aesthetic
 */

import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Header } from './components/Header';
import { GameBoard } from './components/GameBoard';
import { PixelGameBackground } from './components/PixelArt';

export const App = () => {
  return (
    <StrictMode>
      <div className="relative flex flex-col min-h-screen bg-[#faf8f5] text-zinc-900 overflow-x-hidden selection:bg-amber-300 selection:text-zinc-950">
        {/* Animated Background Scenery: Pixel Palm Trees & Moving Flying Birds */}
        <PixelGameBackground />

        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 w-full">
            <GameBoard />
          </main>
        </div>
      </div>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
