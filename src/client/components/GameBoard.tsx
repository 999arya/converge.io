/**
 * GameBoard Component - Minecraft Boxy Aesthetic 2-Stage Gameplay
 * Features:
 * - Stage 1: 5-post selection, tactile 3D Hotbar inventory, Hint scroll, 2 attempts.
 * - Stage 2: Subreddit biome discovery portal, 1-attempt locked choices.
 * - Results: 3D animated star score, connection reveal, community codex, share to clipboard.
 */

import { useState } from 'react';
import { navigateTo } from '@devvit/web/client';
import { formatSubreddit } from '../../shared/gameTypes';
import type {
  DisplaySubredditQuestion,
  GameScore,
  GameSession,
  PublicPuzzle,
  Puzzle,
  SubredditQuestion,
} from '../../shared/gameTypes';
import { useGame } from '../hooks/useGame';
import { PostCard } from './PostCard';
import { sounds } from '../utils/sound';

function isFullPuzzle(value: PublicPuzzle | Puzzle): value is Puzzle {
  return Boolean(value.connection.theme && value.connection.theme !== '???');
}

export const GameBoard = () => {
  const {
    puzzle,
    session,
    score,
    error,
    loading,
    submitting,
    selectedPostIds,
    stage1Feedback,
    gameState,
    currentQuestion,
    togglePostSelection,
    clearSelection,
    submitStage1,
    submitStage2,
    finalizeGame,
    reloadGame,
  } = useGame();

  const [hintOpen, setHintOpen] = useState(false);

  // Loading Screen with Minecraft spin box
  if (loading || (!puzzle && !error)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] p-6 text-center bg-pixel-grid">
        <div className="w-14 h-14 bg-amber-400 border-3 border-zinc-950 shadow-[4px_4px_0_#090d16] flex items-center justify-center font-pixel text-lg font-black animate-block-float mb-4 text-zinc-950">
          C
        </div>
        <h2 className="font-pixel text-sm text-zinc-900 dark:text-amber-400 uppercase tracking-wider mb-2">
          Generating Today's World...
        </h2>
        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
          Fetching 5 Reddit artifacts and community biomes
        </p>
      </div>
    );
  }

  // Error Screen
  if (error || !puzzle) {
    return (
      <div className="flex items-center justify-center min-h-[420px] p-4 bg-pixel-grid">
        <div className="mc-card bg-white dark:bg-zinc-900 max-w-md w-full p-6 text-center">
          <div className="text-3xl mb-3">⚠️</div>
          <h2 className="font-pixel text-sm text-red-600 dark:text-red-400 mb-2 uppercase">
            World Error
          </h2>
          <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-5">
            {error ?? 'Puzzle data unavailable. Please reconnect.'}
          </p>
          <button
            type="button"
            onClick={() => void reloadGame()}
            className="mc-btn mc-btn-gold px-6 py-2.5 text-xs uppercase"
          >
            Respawn Challenge ➔
          </button>
        </div>
      </div>
    );
  }

  // Final Results Screen
  if (score && session) {
    return (
      <ResultsScreen
        puzzle={puzzle}
        session={session}
        score={score}
        onReplay={() => void reloadGame()}
      />
    );
  }

  // Stage 2: Identify Subreddits
  if (
    gameState === 'STAGE_2_READY' ||
    gameState === 'STAGE_2_QUESTION_2' ||
    gameState === 'STAGE_2_QUESTION_3' ||
    gameState === 'RESULTS'
  ) {
    return (
      <StageTwo
        puzzle={puzzle}
        session={session}
        currentQuestion={currentQuestion}
        submitting={submitting}
        error={error}
        onSubmit={async (subreddit) => {
          sounds.playSelect();
          await submitStage2(subreddit);
        }}
        onFinalize={() => {
          sounds.playWinFanfare();
          void finalizeGame();
        }}
      />
    );
  }

  // Stage 1: Find Connection
  const stage1Failed = gameState === 'STAGE_1_FAILED';
  const attemptsUsed = session?.stage1Attempts ?? 0;
  const attemptsLeft = Math.max(0, 2 - attemptsUsed);

  const handleSubmit = async () => {
    if (selectedPostIds.length !== 3 || submitting) return;
    sounds.playClick();
    await submitStage1();
  };

  const handleToggleHint = () => {
    sounds.playClick();
    setHintOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col min-h-full bg-pixel-grid p-3 sm:p-5 max-w-5xl mx-auto pb-32">
      {/* Header Stage Banner */}
      <div className="mc-card bg-emerald-700 text-white p-3.5 sm:p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="mc-badge bg-amber-400 text-zinc-950 text-[9px] px-1.5 py-0.5 font-bold uppercase">
              STAGE 1 OF 2
            </span>
            <span className="mc-badge bg-zinc-950 text-emerald-300 text-[9px] px-1.5 py-0.5 font-mono">
              Attempts Left: {attemptsLeft} / 2
            </span>
          </div>
          <h2 className="font-pixel text-sm sm:text-base text-amber-300 uppercase tracking-wide">
            FIND THE CONNECTION
          </h2>
          <p className="text-xs text-emerald-100 font-mono mt-0.5">
            Select the 3 connected posts sharing a secret theme. 2 posts are distractors.
          </p>
        </div>

        {/* Hint Scroll Button */}
        {puzzle.connection.hint && (
          <button
            type="button"
            onClick={handleToggleHint}
            className="mc-btn mc-btn-gold text-[10px] sm:text-xs py-2 px-3 self-start sm:self-center uppercase"
            title="Unlock thematic clue"
          >
            <span>📜</span>
            <span>{hintOpen ? 'Hide Scroll' : 'Scroll of Clues'}</span>
          </button>
        )}
      </div>

      {/* Clue Scroll Drawer / Modal */}
      {hintOpen && puzzle.connection.hint && (
        <div className="mc-card bg-amber-100 dark:bg-amber-950/80 border-amber-600 dark:border-amber-500 p-3.5 mb-4 animate-star-pop">
          <div className="flex items-center gap-2 mb-1 text-amber-900 dark:text-amber-200">
            <span className="text-base">📜</span>
            <span className="font-pixel text-[10px] uppercase font-bold">
              The Alchemist's Clue
            </span>
          </div>
          <p className="text-xs sm:text-sm font-mono text-amber-950 dark:text-amber-100 italic">
            "{puzzle.connection.hint}"
          </p>
        </div>
      )}

      {/* Feedback Alert Banner */}
      {stage1Feedback && (
        <div
          className={`mc-card p-3.5 mb-4 text-xs font-mono font-bold flex items-center gap-2.5 ${
            stage1Feedback.failed
              ? 'bg-red-100 text-red-900 border-red-600 dark:bg-red-950/60 dark:text-red-200'
              : 'bg-amber-100 text-amber-900 border-amber-600 dark:bg-amber-950/60 dark:text-amber-200'
          }`}
        >
          <span className="text-base">{stage1Feedback.failed ? '💀' : '⚡'}</span>
          <div>
            {stage1Feedback.failed ? (
              <p>
                NO ATTEMPTS REMAINING! Only {stage1Feedback.correctCount} of 3 selected posts were
                connected. Click below to reveal the answers.
              </p>
            ) : (
              <p>
                INCORRECT SELECTION: {stage1Feedback.correctCount} of 3 selected posts are
                connected. You have 1 final retry!
              </p>
            )}
          </div>
        </div>
      )}

      {/* 5-Post Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 mb-6">
        {puzzle.posts.map((post) => {
          const selectionIndex = selectedPostIds.indexOf(post.id);
          const isSelected = selectionIndex >= 0;

          return (
            <PostCard
              key={post.id}
              post={post}
              selected={isSelected}
              selectionNumber={isSelected ? selectionIndex + 1 : undefined}
              disabled={stage1Failed || submitting}
              onSelect={() => togglePostSelection(post.id)}
            />
          );
        })}
      </div>

      {/* Stage 1 Failed Finalize Bar */}
      {stage1Failed && (
        <div className="mc-card bg-zinc-900 text-white p-4 text-center my-4">
          <p className="font-pixel text-xs text-red-400 mb-2 uppercase">Quest Incomplete</p>
          <p className="text-xs font-mono text-zinc-400 mb-4">
            Daily streak will be preserved, but no subreddit stars can be earned today.
          </p>
          <button
            type="button"
            onClick={() => void finalizeGame()}
            disabled={submitting}
            className="mc-btn mc-btn-red py-3 px-6 text-xs uppercase font-bold"
          >
            Reveal Solution & Finish Quest ➔
          </button>
        </div>
      )}

      {/* Bottom Floating Hotbar / Inventory System */}
      {!stage1Failed && (
        <aside
          aria-label="Selection Hotbar"
          className="fixed bottom-0 left-0 right-0 z-30 p-2.5 sm:p-3 bg-zinc-900/95 dark:bg-black/95 backdrop-blur-md border-t-3 border-zinc-950 shadow-[0_-4px_0_#090d16]"
        >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* 3 Hotbar Slots */}
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[9px] text-amber-400 uppercase hidden md:inline-block mr-1">
                INVENTORY:
              </span>

              {[0, 1, 2].map((slotIdx) => {
                const postId = selectedPostIds[slotIdx];
                const slottedPost = postId
                  ? puzzle.posts.find((p) => p.id === postId)
                  : undefined;

                return (
                  <button
                    key={slotIdx}
                    type="button"
                    onClick={() => {
                      if (slottedPost) {
                        sounds.playDeselect();
                        togglePostSelection(slottedPost.id);
                      }
                    }}
                    title={
                      slottedPost
                        ? `Click to remove: ${slottedPost.title}`
                        : `Empty Slot #${slotIdx + 1}`
                    }
                    className={`mc-slot w-12 h-12 sm:w-14 sm:h-14 flex flex-col items-center justify-center p-1 cursor-pointer transition-transform hover:scale-105 ${
                      slottedPost ? 'mc-slot-filled' : 'mc-slot-empty'
                    }`}
                  >
                    {slottedPost ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center overflow-hidden">
                        <span className="font-pixel text-[10px] text-amber-300 font-bold">
                          #{slotIdx + 1}
                        </span>
                        <span className="text-[8px] font-mono text-white truncate w-full px-0.5">
                          {slottedPost.author}
                        </span>
                      </div>
                    ) : (
                      <span className="font-pixel text-[10px] text-zinc-600">
                        {slotIdx + 1}
                      </span>
                    )}
                  </button>
                );
              })}

              {selectedPostIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playDeselect();
                    clearSelection();
                  }}
                  disabled={submitting}
                  className="text-[10px] font-mono text-zinc-400 hover:text-white underline ml-2"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Submission CTA */}
            <div className="w-full sm:w-auto flex items-center gap-2">
              <button
                type="button"
                disabled={selectedPostIds.length !== 3 || submitting}
                onClick={handleSubmit}
                className={`w-full sm:w-auto mc-btn py-3 px-6 text-xs uppercase font-black tracking-wide ${
                  selectedPostIds.length === 3 ? 'mc-btn-gold animate-pulse-gold' : 'mc-btn-dark'
                }`}
              >
                <span>⚔️</span>
                <span>
                  {submitting
                    ? 'Crafting...'
                    : selectedPostIds.length === 3
                      ? 'Submit Connection ➔'
                      : `Select 3 Posts (${selectedPostIds.length}/3)`}
                </span>
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};

/* =========================================================
   STAGE 2: IDENTIFY SUBREDDIT BIOMES
   ========================================================= */

type StageTwoProps = {
  puzzle: PublicPuzzle | Puzzle;
  session: GameSession | null;
  currentQuestion: DisplaySubredditQuestion | null;
  submitting: boolean;
  error: string | null;
  onSubmit: (selectedSubreddit: string) => Promise<void>;
  onFinalize: () => void;
};

const StageTwo = ({
  puzzle,
  session,
  currentQuestion,
  submitting,
  error,
  onSubmit,
  onFinalize,
}: StageTwoProps) => {
  const answers = session?.stage2Answers ?? [];
  const questionNumber = answers.length + 1;
  const currentPost = currentQuestion
    ? puzzle.posts.find((post) => post.id === currentQuestion.postId)
    : undefined;

  const totalQuestions = puzzle.subredditQuestions.length;
  const progressPercent = Math.round((answers.length / totalQuestions) * 100);

  return (
    <div className="flex flex-col min-h-full bg-pixel-grid p-3 sm:p-5 max-w-4xl mx-auto pb-16">
      {/* Stage Header */}
      <div className="mc-card bg-sky-700 text-white p-3.5 sm:p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="mc-badge bg-amber-400 text-zinc-950 text-[9px] px-1.5 py-0.5 font-bold uppercase">
            STAGE 2 OF 2
          </span>
          <span className="font-pixel text-[9px] text-sky-200 uppercase">
            Biome {Math.min(questionNumber, 3)} of {totalQuestions}
          </span>
        </div>

        <h2 className="font-pixel text-sm sm:text-base text-amber-300 uppercase tracking-wide">
          NAME THE SUBREDDIT
        </h2>
        <p className="text-xs text-sky-100 font-mono mt-0.5">
          Identify the source subreddit for each connected post. Answers lock permanently!
        </p>

        {/* XP Progress Bar */}
        <div className="mt-3 mc-xp-container">
          <div className="mc-xp-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {error && (
        <div className="mc-card bg-red-100 border-red-600 text-red-900 p-3 text-xs font-mono font-bold mb-4">
          ⚠️ {error}
        </div>
      )}

      {currentQuestion && currentPost ? (
        <div className="mc-card bg-white dark:bg-zinc-900 p-4 sm:p-6 mb-6">
          {/* Artifact Tag */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="mc-badge bg-zinc-900 text-amber-300 text-[9px] px-2 py-0.5 uppercase">
              Artifact #{questionNumber}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              u/{currentPost.author} · ↑ {currentPost.score.toLocaleString()}
            </span>
          </div>

          {/* Artifact Content */}
          <div className="mc-slot p-3.5 sm:p-4 mb-5 bg-zinc-950 text-white">
            <h3 className="font-bold text-sm sm:text-base text-zinc-100 leading-snug">
              {currentPost.title}
            </h3>
            {currentPost.content && (
              <p className="mt-2 text-xs sm:text-sm text-zinc-300 font-mono leading-relaxed line-clamp-3">
                {currentPost.content}
              </p>
            )}
          </div>

          <p className="font-pixel text-[11px] sm:text-xs text-zinc-900 dark:text-amber-400 uppercase mb-3 text-center">
            Which subreddit biome did this post originate from?
          </p>

          {/* 3 Subreddit Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                type="button"
                disabled={submitting}
                onClick={() => void onSubmit(option)}
                className="mc-btn mc-btn-dark py-3.5 px-3 text-center text-xs font-pixel uppercase tracking-wide hover:bg-amber-500 hover:text-zinc-950 transition-colors"
              >
                {formatSubreddit(option)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mc-card bg-emerald-50 dark:bg-zinc-900 border-emerald-600 p-6 text-center my-6">
          <div className="text-3xl mb-2">🎉</div>
          <h3 className="font-pixel text-sm text-emerald-700 dark:text-emerald-400 uppercase mb-2">
            All Biomes Explored!
          </h3>
          <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-5">
            Your answers have been permanently registered on Reddit's ledger.
          </p>
          <button
            type="button"
            onClick={onFinalize}
            disabled={submitting}
            className="mc-btn mc-btn-gold py-3 px-8 text-xs uppercase font-bold"
          >
            Reveal Final Stars & Lore ➔
          </button>
        </div>
      )}

      {/* Locked Answers Log */}
      {answers.length > 0 && (
        <div className="mc-card bg-zinc-100 dark:bg-zinc-900/80 p-3 sm:p-4">
          <h4 className="font-pixel text-[10px] text-zinc-600 dark:text-zinc-400 uppercase mb-2">
            Locked Community Stamps ({answers.length}/3)
          </h4>
          <div className="space-y-2">
            {answers.map((answer, index) => {
              const answeredPost = puzzle.posts.find((p) => p.id === answer.postId);
              return (
                <div
                  key={`${answer.postId}-${index}`}
                  className="mc-card bg-white dark:bg-zinc-950 p-2.5 flex items-center justify-between gap-3 text-xs font-mono"
                >
                  <span className="truncate max-w-[240px] text-zinc-800 dark:text-zinc-200">
                    #{index + 1}: {answeredPost?.title ?? answer.postId}
                  </span>
                  <span
                    className={`mc-badge px-2 py-0.5 text-[10px] font-bold ${
                      answer.isCorrect
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {formatSubreddit(answer.selectedSubreddit)} {answer.isCorrect ? '✓' : '✗'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   STAGE 3: RESULTS & COMMUNITY REVEAL
   ========================================================= */

type ResultsScreenProps = {
  puzzle: PublicPuzzle | Puzzle;
  session: GameSession;
  score: GameScore;
  onReplay: () => void;
};

const ResultsScreen = ({ puzzle, session, score, onReplay }: ResultsScreenProps) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'reveal' | 'codex'>('reveal');

  if (!isFullPuzzle(puzzle)) {
    return (
      <div className="mc-card bg-white dark:bg-zinc-900 p-8 text-center my-8 max-w-md mx-auto">
        <p className="font-pixel text-xs text-amber-500 uppercase">Deciphering Lore...</p>
      </div>
    );
  }

  const connectedPosts = puzzle.posts.filter((post) =>
    puzzle.connection.connectedPostIds.includes(post.id)
  );

  // Generate shareable results summary (Connections/Wordle block emoji style)
  const handleShare = async () => {
    sounds.playSelect();
    const starEmoji = '⭐'.repeat(score.starsEarned) + '☆'.repeat(3 - score.starsEarned);
    const connStatus = score.connectionSolved ? '🟩 Solved' : '🟥 Missed';

    const shareText = [
      `🧩 CONVERGE #${puzzle.date}`,
      `Connection: ${connStatus}`,
      `Stars: ${starEmoji} (${score.starsEarned}/3)`,
      `Streak: 🔥 ${score.streak} days`,
      `Tier: ${score.flairTier}`,
      `Play on Reddit!`,
    ].join('\n');

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-pixel-grid p-3 sm:p-5 max-w-4xl mx-auto pb-16">
      {/* Triumphant Voxel Star Rating Banner */}
      <div className="mc-card bg-amber-400 dark:bg-zinc-900 text-zinc-950 dark:text-white p-6 text-center mb-4">
        {/* Animated Voxel Stars */}
        <div className="flex items-center justify-center gap-3 my-3">
          {[0, 1, 2].map((starIdx) => {
            const isEarned = starIdx < score.starsEarned;
            return (
              <div
                key={starIdx}
                className={`w-12 h-12 sm:w-16 sm:h-16 mc-card flex items-center justify-center text-2xl sm:text-3xl font-black animate-star-pop ${
                  isEarned
                    ? 'bg-amber-400 text-zinc-950 border-zinc-950'
                    : 'bg-zinc-800 text-zinc-600 border-zinc-700'
                }`}
                style={{ animationDelay: `${starIdx * 150}ms` }}
              >
                {isEarned ? '★' : '☆'}
              </div>
            );
          })}
        </div>

        <h2 className="font-pixel text-base sm:text-lg uppercase tracking-wider text-zinc-950 dark:text-amber-400">
          {score.connectionSolved ? 'QUEST COMPLETED!' : 'CHALLENGE FINISHED'}
        </h2>

        <p className="text-xs sm:text-sm font-mono text-zinc-800 dark:text-zinc-300 mt-1">
          {score.connectionSolved
            ? `Discovered the connection & identified ${score.correctSubredditGuesses} of 3 subreddits.`
            : `Connection missed, but your daily streak has been preserved!`}
        </p>

        {/* Share Button with Toast */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="mc-btn mc-btn-dark py-2.5 px-5 text-xs uppercase font-bold"
          >
            <span>📋</span>
            <span>{copied ? 'Copied to Clipboard!' : 'Share Quest Result'}</span>
          </button>
        </div>
      </div>

      {/* Player Stats HUD */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-center">
        <div className="mc-card bg-white dark:bg-zinc-900 p-2.5">
          <p className="text-[9px] font-mono text-zinc-500 uppercase">Streak</p>
          <p className="font-pixel text-xs text-amber-500 font-bold mt-1">🔥 {score.streak}</p>
        </div>
        <div className="mc-card bg-white dark:bg-zinc-900 p-2.5">
          <p className="text-[9px] font-mono text-zinc-500 uppercase">Total Stars</p>
          <p className="font-pixel text-xs text-amber-400 font-bold mt-1">⭐ {score.lifetimeStars}</p>
        </div>
        <div className="mc-card bg-white dark:bg-zinc-900 p-2.5">
          <p className="text-[9px] font-mono text-zinc-500 uppercase">Solved</p>
          <p className="font-pixel text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
            {score.totalCompleted}
          </p>
        </div>
        <div className="mc-card bg-white dark:bg-zinc-900 p-2.5">
          <p className="text-[9px] font-mono text-zinc-500 uppercase">Tier</p>
          <p className="font-pixel text-[8px] sm:text-[9px] text-purple-600 dark:text-purple-400 font-bold mt-1 truncate">
            {score.flairTier}
          </p>
        </div>
      </div>

      {/* Tab Navigation: Reveal Lore vs Community Codex */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab('reveal');
          }}
          className={`flex-1 mc-btn py-2 text-xs uppercase ${
            activeTab === 'reveal' ? 'mc-btn-gold' : 'mc-btn-dark'
          }`}
        >
          🔍 The Connection & Answers
        </button>
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setActiveTab('codex');
          }}
          className={`flex-1 mc-btn py-2 text-xs uppercase ${
            activeTab === 'codex' ? 'mc-btn-gold' : 'mc-btn-dark'
          }`}
        >
          📚 Discovered Communities
        </button>
      </div>

      {activeTab === 'reveal' ? (
        <div className="space-y-4">
          {/* Revealed Connection Box */}
          <div className="mc-card bg-amber-50 dark:bg-zinc-900 border-amber-600 p-4">
            <span className="mc-badge bg-amber-500 text-zinc-950 text-[9px] px-2 py-0.5 uppercase mb-2">
              THE HIDDEN THEME
            </span>
            <h3 className="font-pixel text-sm sm:text-base text-zinc-900 dark:text-amber-300 mt-1 uppercase">
              {puzzle.connection.theme}
            </h3>
            <p className="text-xs sm:text-sm font-mono text-zinc-700 dark:text-zinc-300 mt-2 leading-relaxed">
              {puzzle.connection.explanation}
            </p>
          </div>

          {/* Post-by-Post Subreddit Breakdown */}
          <div className="space-y-3">
            <h4 className="font-pixel text-xs text-zinc-800 dark:text-zinc-200 uppercase">
              Post & Community Breakdown
            </h4>

            {connectedPosts.map((post) => {
              const answer = session.stage2Answers.find((item) => item.postId === post.id);
              const question = puzzle.subredditQuestions.find(
                (item) => item.postId === post.id
              ) as SubredditQuestion | undefined;

              return (
                <div
                  key={post.id}
                  className="mc-card bg-white dark:bg-zinc-900 p-4 flex flex-col justify-between gap-3"
                >
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                      {post.title}
                    </h5>
                    <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                      u/{post.author} · ↑ {post.score.toLocaleString()}
                    </p>
                  </div>

                  {/* Subreddit Comparison */}
                  <div className="mc-slot p-3 bg-zinc-950 text-xs font-mono space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Correct Subreddit:</span>
                      <span className="text-emerald-400 font-bold">
                        {formatSubreddit(question?.correctSubreddit ?? post.subreddit)}
                      </span>
                    </div>

                    {answer && (
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Your Answer:</span>
                        <span
                          className={`font-bold ${
                            answer.isCorrect ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {formatSubreddit(answer.selectedSubreddit)}{' '}
                          {answer.isCorrect ? '✓' : '✗'}
                        </span>
                      </div>
                    )}

                    {question?.description && (
                      <p className="text-[11px] text-zinc-300 pt-1 border-t border-zinc-800 italic">
                        {question.description}
                      </p>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() =>
                        navigateTo(
                          `https://www.reddit.com/${question?.correctSubreddit ?? post.subreddit}`
                        )
                      }
                      className="text-amber-600 dark:text-amber-400 hover:underline font-bold"
                    >
                      Visit {question?.correctSubreddit ?? post.subreddit} ↗
                    </button>

                    <button
                      type="button"
                      onClick={() => navigateTo(`https://www.reddit.com${post.permalink}`)}
                      className="text-zinc-500 hover:underline"
                    >
                      View Original Post ↗
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Discovery Collection (Codex) */
        <div className="space-y-3">
          <div className="mc-card bg-white dark:bg-zinc-900 p-4">
            <h4 className="font-pixel text-xs text-amber-500 uppercase mb-1">
              Community Biome Codex
            </h4>
            <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-4">
              Subreddits discovered and cataloged during your Converge expeditions.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {puzzle.subredditQuestions.map((q) => {
                const subQuestion = q as SubredditQuestion;
                return (
                  <div
                    key={subQuestion.postId}
                    className="mc-card bg-zinc-50 dark:bg-zinc-950 p-3 flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-pixel text-xs text-emerald-600 dark:text-emerald-400">
                        {formatSubreddit(subQuestion.correctSubreddit)}
                      </span>
                      <span className="mc-badge bg-zinc-800 text-amber-300 text-[8px] px-1.5 py-0.5">
                        DISCOVERED
                      </span>
                    </div>
                    {subQuestion.description && (
                      <p className="text-xs font-mono text-zinc-600 dark:text-zinc-300">
                        {subQuestion.description}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        navigateTo(`https://www.reddit.com/${subQuestion.correctSubreddit}`)
                      }
                      className="text-[11px] font-mono text-amber-600 dark:text-amber-400 hover:underline self-start font-bold"
                    >
                      Explore {formatSubreddit(subQuestion.correctSubreddit)} ➔
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Return Action */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onReplay();
          }}
          className="mc-btn mc-btn-gold py-3 px-8 text-xs uppercase font-bold"
        >
          🔄 Refresh Daily Challenge
        </button>
      </div>
    </div>
  );
};
