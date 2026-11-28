/**
 * GameBoard Component - Main 2-stage game UI.
 */

import { useState } from 'react';
import { formatSubreddit } from '../../shared/gameTypes';
import type {
  DisplaySubredditQuestion,
  GameScore,
  GameSession,
  PublicPuzzle,
  Puzzle,
} from '../../shared/gameTypes';
import { useGame } from '../hooks/useGame';
import { PostCard } from './PostCard';
import { LoadingAnimation } from './LoadingAnimation';

function isFullPuzzle(value: PublicPuzzle | Puzzle): value is Puzzle {
  return value.connection.theme !== '???';
}

function starText(starsEarned: number): string {
  const count = Math.min(3, Math.max(0, starsEarned));
  return `${'★'.repeat(count)}${'☆'.repeat(3 - count)}`;
}

export const GameBoard = () => {
  const [animationDone, setAnimationDone] = useState(false);

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
    isModerator,
    togglePostSelection,
    clearSelection,
    submitStage1,
    submitStage2,
    finalizeGame,
    reloadGame,
  } = useGame();

  if (loading || !animationDone || (!puzzle && !error)) {
    return (
      <LoadingAnimation
        durationMs={2400}
        onComplete={() => setAnimationDone(true)}
      />
    );
  }

  if (error || !puzzle) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-3">{error ?? 'Puzzle unavailable.'}</p>
          <button
            type="button"
            onClick={() => void reloadGame()}
            className="px-4 py-2 rounded-lg bg-orange-500 text-white font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (score && session) {
    return <ResultsScreen puzzle={puzzle} session={session} score={score} onReplay={() => void reloadGame()} />;
  }

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
        onSubmit={submitStage2}
        onFinalize={() => void finalizeGame()}
      />
    );
  }

  const stage1Failed = gameState === 'STAGE_1_FAILED';

  return (
    <div className="flex flex-col h-full gap-4 p-4 overflow-y-auto">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">Stage 1 of 2</p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Find the connection</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Pick exactly 3 of the 5 posts that share a hidden theme.{' '}
          {isModerator ? (
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              Moderator mode: unlimited attempts.
            </span>
          ) : (
            <span>
              You get 3 attempts ({Math.max(0, 3 - (session?.stage1Attempts ?? 0))} remaining).
            </span>
          )}
        </p>
      </div>

      {stage1Feedback && (
        <div
          className={`rounded-xl p-3 text-sm ${
            stage1Feedback.failed
              ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
          }`}
        >
          {stage1Feedback.failed
            ? `No attempts left. ${stage1Feedback.correctCount} of 3 posts were connected.`
            : isModerator
              ? `${stage1Feedback.correctCount} of 3 posts were connected. Try again (Moderator: unlimited attempts).`
              : `${stage1Feedback.correctCount} of 3 posts were connected. Try again (${Math.max(0, 3 - stage1Feedback.attempts)} attempts remaining).`}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {puzzle.posts.map((post) => {
          const selectionIndex = selectedPostIds.indexOf(post.id);
          return (
            <PostCard
              key={post.id}
              post={post}
              selected={selectionIndex >= 0}
              selectionNumber={selectionIndex >= 0 ? selectionIndex + 1 : undefined}
              disabled={stage1Failed || submitting}
              onSelect={() => togglePostSelection(post.id)}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={clearSelection}
          disabled={stage1Failed || submitting || selectedPostIds.length === 0}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 disabled:opacity-50"
        >
          Clear selection
        </button>
        <button
          type="button"
          disabled={selectedPostIds.length !== 3 || stage1Failed || submitting}
          onClick={() => void submitStage1()}
          className="px-6 py-3 rounded-xl font-semibold bg-orange-500 text-white disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800"
        >
          {submitting
            ? 'Submitting...'
            : stage1Failed
              ? 'No attempts left'
              : `Submit ${selectedPostIds.length}/3 selected`}
        </button>
      </div>

      {stage1Failed && (
        <button
          type="button"
          onClick={() => void finalizeGame()}
          disabled={submitting}
          className="w-full py-3 rounded-xl font-semibold bg-gray-900 text-white dark:bg-white dark:text-gray-900"
        >
          See results
        </button>
      )}
    </div>
  );
};

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
  const currentPost = currentQuestion
    ? puzzle.posts.find((post) => post.id === currentQuestion.postId)
    : undefined;

  return (
    <div className="flex flex-col h-full gap-4 p-4 overflow-y-auto">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">Stage 2 of 2</p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Name the subreddit</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Choose the source subreddit for each connected post. Answers lock permanently.
        </p>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {currentQuestion && currentPost ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Question {answers.length + 1} of 3
          </p>
          <p className="font-semibold text-gray-900 dark:text-white">{currentPost.title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            u/{currentPost.author} · {currentPost.score.toLocaleString()} ↑
          </p>

          <div className="mt-4 grid grid-cols-1 gap-2">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                type="button"
                disabled={submitting}
                onClick={() => void onSubmit(option)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-left font-medium text-gray-900 dark:text-white hover:border-orange-400 disabled:opacity-60"
              >
                {formatSubreddit(option)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl p-4 bg-gray-100 dark:bg-gray-800 text-center">
          <p className="text-gray-700 dark:text-gray-200">All answers submitted.</p>
          <button
            type="button"
            onClick={onFinalize}
            disabled={submitting}
            className="mt-3 px-5 py-2 rounded-lg bg-orange-500 text-white font-semibold"
          >
            Show results
          </button>
        </div>
      )}

      {answers.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Locked answers</p>
          {answers.map((answer, index) => {
            const answeredPost = puzzle.posts.find((post) => post.id === answer.postId);
            return (
              <div
                key={`${answer.postId}-${index}`}
                className="flex items-center justify-between gap-3 rounded-lg bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <span className="text-gray-700 dark:text-gray-200 line-clamp-1">
                  {answeredPost?.title ?? answer.postId}
                </span>
                <span className={answer.isCorrect ? 'text-green-600' : 'text-red-500'}>
                  {formatSubreddit(answer.selectedSubreddit)} {answer.isCorrect ? '✓' : '✗'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

type ResultsScreenProps = {
  puzzle: PublicPuzzle | Puzzle;
  session: GameSession;
  score: GameScore;
  onReplay: () => void;
};

const ResultsScreen = ({ puzzle, session, score, onReplay }: ResultsScreenProps) => {
  if (!isFullPuzzle(puzzle)) {
    return <div className="p-6 text-center text-gray-500">Loading reveal...</div>;
  }

  const connectedPosts = puzzle.posts.filter((post) =>
    puzzle.connection.connectedPostIds.includes(post.id)
  );

  return (
    <div className="flex flex-col h-full gap-4 p-4 overflow-y-auto">
      <div className="text-center py-4">
        <p className="text-5xl mb-2 text-orange-500">{starText(score.starsEarned)}</p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {score.connectionSolved ? 'Connection found!' : 'Connection missed'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {score.correctSubredditGuesses} of 3 subreddits correct
        </p>
      </div>

      <div className="rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">The connection</p>
        <h3 className="font-bold text-gray-900 dark:text-white mt-1">{puzzle.connection.theme}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {puzzle.connection.explanation}
        </p>
      </div>

      <div className="space-y-2">
        {connectedPosts.map((post) => {
          const answer = session.stage2Answers.find((item) => item.postId === post.id);
          const question = puzzle.subredditQuestions.find((item) => item.postId === post.id);
          return (
            <div key={post.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <p className="font-medium text-gray-900 dark:text-white">{post.title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Correct: {formatSubreddit(question?.correctSubreddit ?? post.subreddit)}
              </p>
              {answer && (
                <p className={`text-sm mt-1 ${answer.isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                  You chose: {formatSubreddit(answer.selectedSubreddit)} {answer.isCorrect ? '✓' : '✗'}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-6 rounded-xl bg-gray-100 dark:bg-gray-800 p-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Streak</p>
          <p className="text-xl font-bold text-orange-500">{score.streak}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{score.totalCompleted}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Flair</p>
          <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{score.flairTier}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onReplay}
        className="w-full py-3 rounded-xl font-semibold bg-orange-500 text-white"
      >
        Reload puzzle
      </button>
    </div>
  );
};
