/**
 * GameBoard Component - Main game grid with posts and group zones
 */

import { useGame } from '../hooks/useGame';
import { GroupZone } from './GroupZone';
import { PostCard } from './PostCard';
import type { PuzzlePost } from '../../shared/gameTypes';

// Group colors - distinct and accessible
const GROUP_COLORS = ['#3b82f6', '#22c55e', '#a855f7']; // Blue, Green, Purple

// Type definitions for reveal screen
interface Score {
  correctGroups: number;
  totalGroups: number;
  correctPosts: number;
  totalPosts: number;
  crossPollinationFound: boolean;
  streak: number;
  flairTier: string;
}

interface Group {
  id: number;
  theme: string;
  subreddit: string;
  postIds: string[];
  description: string;
}

interface Puzzle {
  id: string;
  date: string;
  posts: PuzzlePost[];
  groups: Group[];
  crossPollination?: { postId: string; connectsGroups: number[]; bonusDescription: string }[];
}

interface Session {
  playerGroups: { groupId: number; postIds: string[] }[];
  streak?: number;
  score?: Score;
}

interface RevealScreenProps {
  puzzle: Puzzle;
  session: Session;
}

interface StatCardProps {
  label: string;
  value: string;
  color: string;
}

interface RevealGroupCardProps {
  group: Group;
  puzzle: Puzzle;
  session: Session;
}

export const GameBoard = () => {
  const {
    puzzle,
    session,
    phase,
    togglePostInGroup,
    removePostFromGroup,
    getPostsInGroup,
    allPostsGrouped,
    submitAnswer,
    loading,
    groupedCount,
    totalPosts,
  } = useGame();

  if (!puzzle || phase === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading today's puzzle...</p>
        </div>
      </div>
    );
  }

  if (phase === 'revealed' || phase === 'submitted') {
    return <RevealScreen puzzle={puzzle} session={session!} />;
  }

  // Ungrouped posts (available to place)
  const groupedPostIds = new Set(
    session?.playerGroups.flatMap((g) => g.postIds) ?? []
  );
  const ungroupedPosts = puzzle.posts.filter((p) => !groupedPostIds.has(p.id));

  const handlePostClick = (postId: string, currentGroup: number | null) => {
    if (currentGroup !== null) {
      // Remove from group
      removePostFromGroup(postId);
    } else {
      // Find first incomplete group
      for (let i = 0; i < 3; i++) {
        const groupPosts = getPostsInGroup(i);
        if (groupPosts.length < 3) { // Max 3 per group for now
          togglePostInGroup(postId, i);
          break;
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {GROUP_COLORS.map((color, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {groupedCount} / {totalPosts} posts grouped
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left: Ungrouped Posts */}
        <div className="w-3/5 flex flex-col gap-3 overflow-y-auto">
          <div className="flex items-center justify-between px-2 py-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            <span>Available Posts</span>
            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
              {ungroupedPosts.length} remaining
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            {ungroupedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                selectedGroup={null}
                groupColors={GROUP_COLORS}
                onSelect={() => handlePostClick(post.id, null)}
              />
            ))}
            {ungroupedPosts.length === 0 && (
              <div className="col-span-full flex items-center justify-center text-gray-400 dark:text-gray-500 py-8">
                <p>All posts grouped! Ready to submit.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Group Zones */}
        <div className="w-2/5 flex flex-col gap-3 overflow-y-auto">
          <div className="px-2 py-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            Your Groups
          </div>
          <div className="grid grid-cols-1 gap-3 flex-1">
            {GROUP_COLORS.map((color, i) => {
              const posts = getPostsInGroup(i);
              const isComplete = posts.length > 0 && posts.length <= 3;
              return (
                <GroupZone
                  key={i}
                  groupId={i}
                  posts={posts}
                  color={color}
                  onPostClick={handlePostClick}
                  isComplete={isComplete && groupedCount === totalPosts}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={submitAnswer}
          disabled={!allPostsGrouped() || loading}
          className="w-full sm:w-1/2 lg:w-1/3 px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: allPostsGrouped() ? '#d93900' : '#e5e7eb',
            color: allPostsGrouped() ? 'white' : '#9ca3af',
          }}
        >
          {loading ? 'Submitting...' : allPostsGrouped() ? 'Submit Groups' : 'Group all posts to submit'}
        </button>
      </div>
    </div>
  );
};

/**
 * Reveal Screen - Shows after submission
 */
const RevealScreen = ({ puzzle, session }: RevealScreenProps) => {
  const { score } = session;

  if (!score) return null;

  const percentage = Math.round((score.correctGroups / score.totalGroups) * 100);
  const isPerfect = score.correctGroups === score.totalGroups;

  return (
    <div className="flex flex-col h-full gap-4 p-4 overflow-y-auto">
      {/* Result Header */}
      <div className="text-center py-6">
        <div className="text-6xl mb-4">{isPerfect ? '🎉' : percentage >= 66 ? '👏' : '📚'}</div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isPerfect ? 'Perfect Convergence!' : 'Puzzle Complete'}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {score.correctGroups} of {score.totalGroups} groups correct ({percentage}%)
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <StatCard
          label="Groups Correct"
          value={`${score.correctGroups}/${score.totalGroups}`}
          color={isPerfect ? '#22c55e' : score.correctGroups > 0 ? '#f59e0b' : '#ef4444'}
        />
        <StatCard
          label="Posts Correct"
          value={`${score.correctPosts}/${score.totalPosts}`}
          color='#3b82f6'
        />
        <StatCard
          label="Streak"
          value={score.streak.toString()}
          color='#d93900'
        />
      </div>

      {/* Group Reveals */}
      <div className="space-y-3 mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Group Reveals</h3>
        {puzzle.groups.map((group) => (
          <RevealGroupCard key={group.id} group={group} puzzle={puzzle} session={session} />
        ))}
      </div>

      {/* Cross-pollination */}
      {puzzle.crossPollination?.length && (
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4 mb-4">
          <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
            💫 Cross-Pollination Bonus!
          </h4>
          {puzzle.crossPollination.map((cp, i) => (
            <p key={i} className="text-sm text-gray-700 dark:text-gray-300">
              {cp.bonusDescription}
            </p>
          ))}
        </div>
      )}

      {/* Flair & Streak */}
      <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
          <p className="text-3xl font-bold text-orange-500">{score.streak} days</p>
        </div>
        <div className="w-px h-12 bg-gray-200 dark:bg-gray-700" />
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Flair Tier</p>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{score.flairTier}</p>
        </div>
      </div>

      {/* Play Again */}
      <button
        onClick={() => window.location.reload()}
        className="w-full sm:w-1/2 mx-auto px-6 py-3 rounded-xl font-semibold text-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
      >
        Play Tomorrow's Puzzle
      </button>
    </div>
  );
};

const StatCard = ({ label, value, color }: StatCardProps) => (
  <div className="p-4 rounded-xl text-center" style={{ backgroundColor: color + '15', borderColor: color + '40' }}>
    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</p>
    <p className="text-3xl font-bold mt-1" style={{ color }}>{value}</p>
  </div>
);

const RevealGroupCard = ({ group, puzzle, session }: RevealGroupCardProps) => {
  const groupColors = ['#3b82f6', '#22c55e', '#a855f7'];
  const color = groupColors[group.id];
  const groupPosts = puzzle.posts.filter((p) => group.postIds.includes(p.id));
  const playerPosts = session?.playerGroups?.find((g) => g.groupId === group.id)?.postIds ?? [];
  const correctCount = groupPosts.filter((p) => playerPosts.includes(p.id)).length;

  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: color + '10', border: `1px solid ${color}40` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: color }}>
            {group.id + 1}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{group.theme}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">r/{group.subreddit}</p>
          </div>
        </div>
        <span className="text-sm font-medium px-2 py-1 rounded" style={{ backgroundColor: color + '20', color }}>
          {correctCount}/{group.postIds.length}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">{group.description}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {groupPosts.map((post) => (
          <div key={post.id} className="text-xs p-2 rounded bg-white dark:bg-gray-800">
            <span className="font-medium">{post.title}</span>
            <div className="flex items-center gap-1 mt-1 text-gray-500 dark:text-gray-400">
              <span>r/{post.subreddit}</span>
              <span>·</span>
              <span>{post.score.toLocaleString()} ↑</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};