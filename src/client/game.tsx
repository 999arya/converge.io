/**
 * Converge Game - Expanded View Entry Point
 * Light Mode Only - Minecraft Boxy Aesthetic
 */

import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Header } from './components/Header';
import { GameBoard } from './components/GameBoard';

export const App = () => {
  return (
    <StrictMode>
      <div className="flex flex-col min-h-screen bg-[#faf8f5] text-zinc-900">
        <Header />
        <main className="flex-1 w-full overflow-y-auto">
          <GameBoard />
        </main>
      </div>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
