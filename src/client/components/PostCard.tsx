/**
 * PostCard Component - Displays one Reddit post in the puzzle.
 */

import { formatSubreddit } from '../../shared/gameTypes';
import type { PublicPuzzlePost, PuzzlePost } from '../../shared/gameTypes';

type DisplayPost = PuzzlePost | PublicPuzzlePost;

type PostCardProps = {
  post: DisplayPost;
  selected?: boolean | undefined;
  selectionNumber?: number | undefined;
  disabled?: boolean | undefined;
  onSelect?: (() => void) | undefined;
};

export const PostCard = ({
  post,
  selected = false,
  selectionNumber,
  disabled = false,
  onSelect,
}: PostCardProps) => {
  return (
    <button
      type="button"
      disabled={disabled || !onSelect}
      onClick={onSelect}
      className={`relative w-full overflow-hidden rounded-xl border text-left transition-all duration-200 ${
        selected
          ? 'border-orange-500 ring-2 ring-orange-300 bg-orange-50 dark:bg-orange-950/30'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-orange-300'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {post.thumbnailUrl && (
        <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={post.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-3">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span className="font-mono text-orange-500">{formatSubreddit(post.subreddit)}</span>
          <span>·</span>
          <span>u/{post.author}</span>
          <span>·</span>
          <span>{post.score.toLocaleString()} ↑</span>
        </div>
        <p className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{post.title}</p>
        {post.content && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{post.content}</p>
        )}
      </div>

      {selected && (
        <span className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold bg-orange-500">
          {selectionNumber ?? '✓'}
        </span>
      )}
    </button>
  );
};
