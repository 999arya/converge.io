/**
 * Converge Game - Expanded View Entry Point
 * Main game experience when user taps "Tap to Start"
 */

import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Header } from './components/Header';
import { GameBoard } from './components/GameBoard';

export const App = () => {
  return (
    <StrictMode>
      <div className="flex flex-col h-full min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header />
        <main className="flex-1 overflow-hidden">
          <GameBoard />
        </main>
      </div>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')!).render(<App />);