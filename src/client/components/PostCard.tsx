/**
 * PostCard Component - Shows a full Reddit post preview.
 */

import { useState } from 'react';
import { navigateTo } from '@devvit/web/client';
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
  const [imageFailed, setImageFailed] = useState(false);

  const openOriginal = () => {
    navigateTo(`https://www.reddit.com${post.permalink}`);
  };

  const showThumbnail = Boolean(post.thumbnailUrl) && !imageFailed;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${
        selected
          ? 'border-orange-500 ring-2 ring-orange-300 bg-orange-50 dark:bg-orange-950/30'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-orange-300'
      } ${disabled ? 'opacity-60' : ''}`}
    >
      <button
        type="button"
        disabled={disabled || !onSelect}
        onClick={onSelect}
        className={`w-full text-left ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {showThumbnail ? (
          <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={post.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          </div>
        ) : (
          <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500" />
        )}

        <div className="p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span className="font-mono text-orange-500">{formatSubreddit(post.subreddit)}</span>
            <span>·</span>
            <span>u/{post.author}</span>
            <span>·</span>
            <span>{post.score.toLocaleString()} ↑</span>
          </div>

          <p className="font-semibold text-gray-900 dark:text-white whitespace-pre-wrap break-words">
            {post.title}
          </p>

          {post.content && (
            <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
              {post.content}
            </p>
          )}
        </div>

        {selected && (
          <span className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold bg-orange-500">
            {selectionNumber ?? '✓'}
          </span>
        )}
      </button>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={openOriginal}
          className="text-xs font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 underline"
        >
          Open original post
        </button>
      </div>
    </div>
  );
};
