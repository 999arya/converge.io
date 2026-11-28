/**
 * GameBoard Component - Light Mode Minecraft Boxy 2-Stage Gameplay
 * Features:
 * - Stage 1: 5-post selection, tactile 3D Hotbar inventory, Hint scroll, unlimited attempts.
 * - Stage 2: Editable subreddit choices; answers can be changed until the final reveal.
 * - Results: 3D animated star score, connection reveal, community codex, share to clipboard.
 * - Optimized for full scrollability and light-theme contrast.
 */

import { useEffect, useState } from 'react';
import { navigateTo } from '@devvit/web/client';
import { DEV_REPLAY_ENABLED } from '../../shared/gameConfig';
import { formatSubreddit } from '../../shared/gameTypes';
import type {
  GameScore,
  PublicGameSession,
  PublicPuzzle,
  PublicPuzzlePost,
  Puzzle,
  PuzzlePost,
} from '../../shared/gameTypes';
import { useGame } from '../hooks/useGame';
import { PixelPalmBanner } from './PixelArt';
import { PostCard } from './PostCard';
import { sounds } from '../utils/sound';

function isFullPuzzle(value: PublicPuzzle | Puzzle): value is Puzzle {
  return Boolean(value.connection.theme && value.connection.theme !== '???');
}

/** GoaBuilds-inspired arcade boot screen shown before the daily quest. */
const ArcadeLoader = () => (
  <div className="arcade-loader fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#071426] text-white">
    <div className="arcade-loader-tiles" aria-hidden="true" />
    <PixelPalmBanner className="absolute inset-x-0 bottom-0 z-0 h-24 opacity-90" dark />
    <div className="relative z-10 flex flex-col items-center px-6 text-center">
      <div className="arcade-loader-logo mb-6 flex h-24 w-24 items-center justify-center border-4 border-[#FFC247] bg-[#050505] font-pixel text-4xl font-black text-[#FFC247] shadow-[8px_8px_0_#FF4B18]">
        C
      </div>
      <p className="font-pixel text-lg tracking-[0.35em] text-[#FFC247] uppercase drop-shadow-[2px_2px_0_#050505]">
        Converge
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-white/70">
        Loading today&apos;s quest
      </p>
      <div className="arcade-loader-track mt-6">
        <div className="arcade-loader-fill" />
      </div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
        Generating Reddit world...
      </p>
    </div>
  </div>
);

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
    togglePostSelection,
    clearSelection,
    submitStage1,
    submitStage2,
    finalizeGame,
    replayGame,
    reloadGame,
  } = useGame();

  const [hintOpen, setHintOpen] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 1600);
    return () => window.clearTimeout(timer);
  }, []);

  // Arcade-style boot sequence before the daily game appears.
  if (booting || loading || (!puzzle && !error)) {
    return <ArcadeLoader />;
  }

  // Error Screen
  if (error || !puzzle) {
    return (
      <div className="flex items-center justify-center min-h-[420px] p-4">
        <div className="mc-card bg-white max-w-md w-full p-6 text-center">
          <div className="text-3xl mb-3">⚠️</div>
          <h2 className="font-pixel text-sm text-red-600 mb-2 uppercase">
            World Error
          </h2>
          <p className="text-xs font-mono text-zinc-700 mb-5">
            {error ?? 'Puzzle data unavailable. Please reconnect.'}
          </p>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              void reloadGame();
            }}
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
        onReplay={() => void (DEV_REPLAY_ENABLED ? replayGame() : reloadGame())}
      />
    );
  }

  // Stage 2: Identify Subreddits (answers stay editable until the final reveal)
  if (session?.stage1Correct) {
    return (
      <StageTwo
        puzzle={puzzle}
        session={session}
        submitting={submitting}
        error={error}
        onSubmit={async (postId, subreddit) => {
          sounds.playSelect();
          await submitStage2(postId, subreddit);
        }}
        onFinalize={() => {
          sounds.playClick();
          sounds.playWinFanfare();
          void finalizeGame();
        }}
      />
    );
  }

  // Stage 1: Find Connection
  const attemptsUsed = session?.stage1Attempts ?? 0;

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
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-5 pb-44 flex flex-col">
      {/* Header Stage Banner */}
      <div className="mc-card bg-emerald-700 text-white p-3.5 sm:p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="mc-badge bg-amber-400 text-zinc-950 text-[9px] px-1.5 py-0.5 font-bold uppercase">
              STAGE 1 OF 2
            </span>
            <span className="mc-badge bg-zinc-950 text-emerald-300 text-[9px] px-1.5 py-0.5 font-mono">
              Attempt #{attemptsUsed + 1} - unlimited tries
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

      <PixelPalmBanner className="mc-card mb-4 h-14 w-full" />

      {/* Clue Scroll Drawer / Modal */}
      {hintOpen && puzzle.connection.hint && (
        <div className="mc-card bg-amber-100 border-amber-600 p-3.5 mb-4 animate-drawer-drop">
          <div className="flex items-center gap-2 mb-1 text-amber-900">
            <span className="text-base">📜</span>
            <span className="font-pixel text-[10px] uppercase font-bold">
              The Alchemist's Clue
            </span>
          </div>
          <p className="text-xs sm:text-sm font-mono text-amber-950 italic">
            "{puzzle.connection.hint}"
          </p>
        </div>
      )}

      {/* Feedback Alert Banner */}
      {stage1Feedback && (
        <div className="mc-card bg-amber-100 text-amber-900 border-amber-600 p-3.5 mb-4 text-xs font-mono font-bold flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
          <span className="text-base">⚡</span>
          <p className="flex-1">
            Not quite: {stage1Feedback.correctCount} of 3 selected posts are connected. Change
            your selection and try again - unlimited attempts!
          </p>
          {DEV_REPLAY_ENABLED && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                sounds.playClick();
                void replayGame();
              }}
              className="mc-btn mc-btn-gold py-2 px-3 text-[10px] uppercase whitespace-nowrap"
            >
              🔄 Replay (Dev)
            </button>
          )}
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
              disabled={submitting}
              onSelect={() => togglePostSelection(post.id)}
            />
          );
        })}
      </div>

      {/* Bottom Floating Hotbar / Inventory System (Light Theme) */}
      <aside
        aria-label="Selection Hotbar"
        className="fixed bottom-0 left-0 right-0 z-30 p-2.5 sm:p-3 bg-amber-50/95 backdrop-blur-md border-t-3 border-zinc-950 shadow-[0_-4px_0_#090d16] animate-hotbar-slide-up"
      >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* 3 Hotbar Slots */}
            <div className="flex items-center gap-2">
              <span className="font-pixel text-[9px] text-zinc-800 uppercase hidden md:inline-block mr-1">
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
                        <span className="font-pixel text-[10px] text-zinc-950 font-bold">
                          #{slotIdx + 1}
                        </span>
                        <span className="text-[8px] font-mono text-zinc-900 font-bold truncate w-full px-0.5">
                          {slottedPost.author}
                        </span>
                      </div>
                    ) : (
                      <span className="font-pixel text-[10px] text-zinc-700">
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
                  className="text-[10px] font-mono text-zinc-700 hover:text-zinc-950 underline ml-2 font-bold cursor-pointer"
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
                  selectedPostIds.length === 3 ? 'mc-btn-gold animate-pulse-gold' : 'mc-btn-slate'
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
    </div>
  );
};

/* =========================================================
   STAGE 2: IDENTIFY SUBREDDIT BIOMES (LIGHT THEME)
   ========================================================= */

/** Artifact preview with the real Reddit thumbnail to help identify the biome. */
const StageTwoArtifact = ({
  post,
  index,
}: {
  post: PuzzlePost | PublicPuzzlePost | undefined;
  index: number;
}) => {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(post?.thumbnailUrl) && !imageFailed;

  return (
    <div className="mc-card bg-amber-50/50 p-3 sm:p-4 mb-5 border-2 border-zinc-950 flex flex-col sm:flex-row gap-3">
      <div className="mc-slot relative h-28 w-full shrink-0 overflow-hidden bg-zinc-900 sm:w-40">
        {showImage ? (
          <img
            src={post?.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-pixel text-[10px] text-amber-300 uppercase">
            No preview
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-sm sm:text-base leading-snug text-zinc-950">
          {post?.title ?? `Artifact #${index + 1}`}
        </h3>
        {post?.content && (
          <p className="mt-2 line-clamp-4 text-xs sm:text-sm leading-relaxed text-zinc-700 font-body">
            {post.content}
          </p>
        )}
      </div>
    </div>
  );
};

type StageTwoProps = {
  puzzle: PublicPuzzle | Puzzle;
  session: PublicGameSession;
  submitting: boolean;
  error: string | null;
  onSubmit: (postId: string, selectedSubreddit: string) => Promise<void>;
  onFinalize: () => void;
};

const StageTwo = ({
  puzzle,
  session,
  submitting,
  error,
  onSubmit,
  onFinalize,
}: StageTwoProps) => {
  const answers = session.stage2Answers;
  const questions = puzzle.subredditQuestions;
  const answeredCount = answers.length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-5 pb-24 flex flex-col">
      {/* Stage Header */}
      <div className="mc-card bg-sky-700 text-white p-3.5 sm:p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="mc-badge bg-amber-400 text-zinc-950 text-[9px] px-1.5 py-0.5 font-bold uppercase">
            STAGE 2 OF 2
          </span>
          <span className="font-pixel text-[9px] text-sky-100 uppercase">
            Biomes answered: {answeredCount}/{questions.length}
          </span>
        </div>

        <h2 className="font-pixel text-sm sm:text-base text-amber-300 uppercase tracking-wide">
          NAME THE SUBREDDIT
        </h2>
        <p className="text-xs text-sky-100 font-mono mt-0.5">
          Pick a home community for each post. You can change any answer until you reveal results.
        </p>

        {/* XP Progress Bar */}
        <div className="mt-3 mc-xp-container">
          <div className="mc-xp-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <PixelPalmBanner className="mc-card mb-4 h-14 w-full" />

      {error && (
        <div className="mc-card bg-red-100 border-red-600 text-red-900 p-3 text-xs font-mono font-bold mb-4">
          ⚠️ {error}
        </div>
      )}

      <div className="space-y-4">
        {questions.map((question, index) => {
          const post = puzzle.posts.find((item) => item.id === question.postId);
          const answer = answers.find((item) => item.postId === question.postId);

          return (
            <div key={question.postId} className="mc-card bg-white p-4 sm:p-6">
              {/* Artifact Tag */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="mc-badge bg-zinc-900 text-amber-300 text-[9px] px-2 py-0.5 uppercase">
                  Artifact #{index + 1}
                </span>
                {post && (
                  <span className="text-[10px] font-mono text-zinc-700 font-bold">
                    u/{post.author} · ↑ {post.score.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Artifact Content Card with Reddit thumbnail */}
              <StageTwoArtifact post={post} index={index} />

              <p className="font-pixel text-[11px] sm:text-xs text-zinc-950 uppercase mb-3 text-center">
                Which subreddit biome did this post originate from?
              </p>

              {/* 3 Subreddit Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {question.options.map((option) => {
                  const isSelected = answer?.selectedSubreddit === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={submitting}
                      aria-pressed={isSelected}
                      onClick={() => void onSubmit(question.postId, option)}
                      className={`mc-btn py-3.5 px-3 text-center text-xs font-pixel uppercase tracking-wide transition-colors ${
                        isSelected
                          ? 'mc-btn-gold'
                          : 'mc-btn-slate hover:bg-amber-400 hover:text-zinc-950'
                      }`}
                    >
                      {formatSubreddit(option)}
                    </button>
                  );
                })}
              </div>

              {answer && (
                <p className="text-[10px] font-mono text-emerald-800 mt-3 text-center font-bold">
                  Saved: {formatSubreddit(answer.selectedSubreddit)} - tap another option to change
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Final Reveal Action */}
      <div className="mc-card bg-emerald-50 border-emerald-600 p-5 text-center mt-5">
        <h3 className="font-pixel text-xs text-emerald-800 uppercase mb-2">
          {allAnswered ? 'All Biomes Explored!' : 'Finish Your Expedition'}
        </h3>
        <p className="text-xs font-mono text-zinc-700 mb-4">
          {allAnswered
            ? 'Your answers are saved. Reveal results when you are ready - correct communities stay hidden until then.'
            : `Answer all ${questions.length} questions to unlock the final reveal.`}
        </p>
        <button
          type="button"
          onClick={onFinalize}
          disabled={!allAnswered || submitting}
          className="mc-btn mc-btn-gold py-3 px-8 text-xs uppercase font-bold"
        >
          Reveal Final Stars & Lore ➔
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   STAGE 3: RESULTS & COMMUNITY REVEAL (LIGHT THEME)
   ========================================================= */

type ResultsScreenProps = {
  puzzle: PublicPuzzle | Puzzle;
  session: PublicGameSession;
  score: GameScore;
  onReplay: () => void;
};

const ResultsScreen = ({ puzzle, session, score, onReplay }: ResultsScreenProps) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'reveal' | 'codex'>('reveal');

  if (!isFullPuzzle(puzzle)) {
    return (
      <div className="mc-card bg-white p-8 text-center my-8 max-w-md mx-auto">
        <p className="font-pixel text-xs text-amber-800 uppercase">Deciphering Lore...</p>
      </div>
    );
  }

  const connectedPosts = puzzle.posts.filter((post) =>
    puzzle.connection.connectedPostIds.includes(post.id)
  );

  // Generate shareable results summary
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
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-5 pb-24 flex flex-col">
      {/* Triumphant Voxel Star Rating Banner */}
      <div className="mc-card bg-amber-400 text-zinc-950 p-6 text-center mb-4">
        {/* Animated Voxel Stars */}
        <div className="flex items-center justify-center gap-3 my-3">
          {[0, 1, 2].map((starIdx) => {
            const isEarned = starIdx < score.starsEarned;
            return (
              <div
                key={starIdx}
                className={`w-12 h-12 sm:w-16 sm:h-16 mc-card flex items-center justify-center text-2xl sm:text-3xl font-black animate-star-pop ${
                  isEarned
                    ? 'bg-amber-300 text-zinc-950 border-zinc-950'
                    : 'bg-zinc-200 text-zinc-700 border-zinc-500'
                }`}
                style={{ animationDelay: `${starIdx * 150}ms` }}
              >
                {isEarned ? '★' : '☆'}
              </div>
            );
          })}
        </div>

        <h2 className="font-pixel text-base sm:text-lg uppercase tracking-wider text-zinc-950">
          {score.connectionSolved ? 'QUEST COMPLETED!' : 'CHALLENGE FINISHED'}
        </h2>

        <p className="text-xs sm:text-sm font-mono text-zinc-800 mt-1">
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

      <PixelPalmBanner className="mc-card mb-4 h-12 w-full" />

      {/* Player Stats HUD */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-center">
        <div className="mc-card bg-white p-2.5">
          <p className="text-[9px] font-mono text-zinc-700 uppercase">Streak</p>
          <p className="font-pixel text-xs text-amber-800 font-bold mt-1">🔥 {score.streak}</p>
        </div>
        <div className="mc-card bg-white p-2.5">
          <p className="text-[9px] font-mono text-zinc-700 uppercase">Total Stars</p>
          <p className="font-pixel text-xs text-amber-700 font-bold mt-1">⭐ {score.lifetimeStars}</p>
        </div>
        <div className="mc-card bg-white p-2.5">
          <p className="text-[9px] font-mono text-zinc-700 uppercase">Solved</p>
          <p className="font-pixel text-xs text-emerald-700 font-bold mt-1">
            {score.totalCompleted}
          </p>
        </div>
        <div className="mc-card bg-white p-2.5">
          <p className="text-[9px] font-mono text-zinc-700 uppercase">Tier</p>
          <p className="font-pixel text-[8px] sm:text-[9px] text-purple-700 font-bold mt-1 truncate">
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
            activeTab === 'reveal' ? 'mc-btn-gold' : 'mc-btn-slate'
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
            activeTab === 'codex' ? 'mc-btn-gold' : 'mc-btn-slate'
          }`}
        >
          📚 Discovered Communities
        </button>
      </div>

      {activeTab === 'reveal' ? (
        <div className="space-y-4">
          {/* Revealed Connection Box */}
          <div className="mc-card bg-amber-50 border-amber-600 p-4">
            <span className="mc-badge bg-amber-500 text-zinc-950 text-[9px] px-2 py-0.5 uppercase mb-2">
              THE HIDDEN THEME
            </span>
            <h3 className="font-pixel text-sm sm:text-base text-zinc-950 mt-1 uppercase">
              {puzzle.connection.theme}
            </h3>
            <p className="text-xs sm:text-sm font-mono text-zinc-800 mt-2 leading-relaxed">
              {puzzle.connection.explanation}
            </p>
          </div>

          {/* Post-by-Post Subreddit Breakdown */}
          <div className="space-y-3">
            <h4 className="font-pixel text-xs text-zinc-900 uppercase">
              Post & Community Breakdown
            </h4>

            {connectedPosts.map((post) => {
              const answer = session.stage2Answers.find((item) => item.postId === post.id);
              const question = puzzle.subredditQuestions.find(
                (item) => item.postId === post.id
              );
              const correctSubreddit = question?.correctSubreddit ?? post.subreddit;
              const wasCorrect = answer?.selectedSubreddit === correctSubreddit;

              return (
                <div
                  key={post.id}
                  className="mc-card bg-white p-4 flex flex-col justify-between gap-3"
                >
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-zinc-950">
                      {post.title}
                    </h5>
                    <p className="text-[11px] font-mono text-zinc-700 mt-0.5">
                      u/{post.author} · ↑ {post.score.toLocaleString()}
                    </p>
                  </div>

                  {/* Subreddit Comparison */}
                  <div className="mc-slot p-3 bg-zinc-50 text-xs font-mono space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-700">Correct Subreddit:</span>
                      <span className="text-emerald-700 font-bold">
                        {formatSubreddit(correctSubreddit)}
                      </span>
                    </div>

                    {answer && (
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-700">Your Answer:</span>
                        <span
                          className={`font-bold ${wasCorrect ? 'text-emerald-700' : 'text-red-600'}`}
                        >
                          {formatSubreddit(answer.selectedSubreddit)} {wasCorrect ? '✓' : '✗'}
                        </span>
                      </div>
                    )}

                    {question?.description && (
                      <p className="text-[11px] text-zinc-700 pt-1 border-t border-zinc-200 italic">
                        {question.description}
                      </p>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        navigateTo(
                          `https://www.reddit.com/${question?.correctSubreddit ?? post.subreddit}`
                        );
                      }}
                      className="text-amber-700 hover:underline font-bold cursor-pointer"
                    >
                      Visit {question?.correctSubreddit ?? post.subreddit} ↗
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        navigateTo(`https://www.reddit.com${post.permalink}`);
                      }}
                      className="text-zinc-700 hover:underline cursor-pointer"
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
          <div className="mc-card bg-white p-4">
            <h4 className="font-pixel text-xs text-amber-800 uppercase mb-1">
              Community Biome Codex
            </h4>
            <p className="text-xs font-mono text-zinc-700 mb-4">
              Subreddits discovered and cataloged during your Converge expeditions.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {puzzle.subredditQuestions.map((subQuestion) => {
                return (
                  <div
                    key={subQuestion.postId}
                    className="mc-card bg-zinc-50 p-3 flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-pixel text-xs text-emerald-700">
                        {formatSubreddit(subQuestion.correctSubreddit)}
                      </span>
                      <span className="mc-badge bg-zinc-200 text-zinc-800 text-[8px] px-1.5 py-0.5 font-bold">
                        DISCOVERED
                      </span>
                    </div>
                    {subQuestion.description && (
                      <p className="text-xs font-mono text-zinc-700">
                        {subQuestion.description}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        navigateTo(`https://www.reddit.com/${subQuestion.correctSubreddit}`);
                      }}
                      className="text-[11px] font-mono text-amber-700 hover:underline self-start font-bold cursor-pointer"
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
          {DEV_REPLAY_ENABLED
            ? '🔄 Replay Daily Challenge (Dev)'
            : '🔄 Refresh Daily Challenge'}
        </button>
      </div>
    </div>
  );
};
