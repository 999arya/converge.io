/**
 * PostCard Component - Light Mode Minecraft Boxy Reddit Post Tile
 * Displays a candidate post with tactile selection and preview.
 */

import { useState, type MouseEvent } from 'react';
import { navigateTo } from '@devvit/web/client';
import type { PublicPuzzlePost, PuzzlePost } from '../../shared/gameTypes';
import { sounds } from '../utils/sound';

type DisplayPost = PuzzlePost | PublicPuzzlePost;

type PostCardProps = {
  post: DisplayPost;
  selected?: boolean | undefined;
  selectionNumber?: number | undefined;
  disabled?: boolean | undefined;
  revealSubreddit?: boolean | undefined;
  onSelect?: (() => void) | undefined;
};

export const PostCard = ({
  post,
  selected = false,
  selectionNumber,
  disabled = false,
  revealSubreddit = false,
  onSelect,
}: PostCardProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const openOriginal = (e: MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    navigateTo(`https://www.reddit.com${post.permalink}`);
  };

  const handleCardClick = () => {
    if (disabled || !onSelect) return;
    if (selected) {
      sounds.playDeselect();
    } else {
      sounds.playSelect();
    }
    onSelect();
  };

  const showThumbnail = Boolean(post.thumbnailUrl) && !imageFailed;
  const isPostRevealed = revealSubreddit && post.subreddit && post.subreddit !== 'r/????';

  return (
    <div
      onClick={handleCardClick}
      className={`mc-card relative bg-white flex flex-col justify-between overflow-hidden transition-all duration-100 ${
        selected ? 'mc-card-selected' : 'mc-card-hover'
      } ${disabled ? 'opacity-65 cursor-not-allowed' : 'cursor-pointer'}`}
      role="checkbox"
      aria-checked={selected}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Top Media Slot / Thumbnail Frame */}
      {showThumbnail ? (
        <div className="mc-slot w-full aspect-video max-h-44 overflow-hidden relative group bg-zinc-900">
          <img
            src={post.thumbnailUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>
      ) : (
        <div className="h-2.5 w-full bg-gradient-to-r from-amber-400 via-emerald-500 to-sky-500 border-b-2 border-zinc-950" />
      )}

      {/* Card Body */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] font-mono text-zinc-600 mb-2">
            <div className="flex items-center gap-1.5">
              {isPostRevealed ? (
                <span className="mc-badge bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[9px] font-bold">
                  {post.subreddit}
                </span>
              ) : (
                <span className="mc-badge bg-zinc-100 text-zinc-800 px-1.5 py-0.5 text-[9px]">
                  r/???
                </span>
              )}
              <span className="truncate max-w-[120px] font-semibold">u/{post.author}</span>
            </div>

            <span className="mc-badge bg-amber-100 text-amber-900 px-1.5 py-0.5 text-[9px] font-bold">
              ↑ {post.score.toLocaleString()}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-xs sm:text-sm text-zinc-950 leading-snug line-clamp-2">
            {post.title}
          </h3>

          {/* Content snippet */}
          {post.content && (
            <p
              className={`mt-1.5 text-[11px] sm:text-xs text-zinc-700 leading-relaxed font-body ${
                expanded ? 'whitespace-pre-wrap' : 'line-clamp-2'
              }`}
            >
              {post.content}
            </p>
          )}

          {post.content && post.content.length > 90 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((prev) => !prev);
              }}
              className="mt-1 text-[10px] font-mono font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              {expanded ? '▲ Show less' : '▼ Read full'}
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-3 pt-2.5 border-t border-zinc-200 flex items-center justify-between">
          <button
            type="button"
            onClick={openOriginal}
            className="text-[10px] font-mono text-zinc-600 hover:text-amber-700 underline flex items-center gap-1 cursor-pointer font-semibold"
          >
            <span>Original Post</span>
            <span>↗</span>
          </button>

          <span className="text-[10px] font-mono font-bold text-zinc-500">
            {selected ? 'SELECTED' : 'TAP TO SELECT'}
          </span>
        </div>
      </div>

      {/* Selected Voxel Slot Badge */}
      {selected && (
        <div className="absolute top-2 right-2 mc-badge bg-emerald-600 text-white text-[10px] px-2 py-1 font-pixel animate-star-pop shadow-[2px_2px_0_#090d16]">
          ✓ #{selectionNumber ?? '1'}
        </div>
      )}
    </div>
  );
};
