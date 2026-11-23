/**
 * PostCard Component - Displays a single Reddit post in the puzzle
 */

import type { PuzzlePost } from '../../shared/gameTypes';

interface PostCardProps {
  post: PuzzlePost;
  selectedGroup: number | null; // Which group this post is assigned to (0,1,2 or null)
  onSelect: (groupId: number | null) => void;
  groupColors: string[];
  disabled?: boolean;
}

export const PostCard = ({
  post,
  selectedGroup,
  onSelect,
  groupColors,
  disabled = false,
}: PostCardProps) => {
  const isSelected = selectedGroup !== null;
  const groupColor = isSelected ? groupColors[selectedGroup!] : 'transparent';

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-200 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
      } ${isSelected ? 'ring-2 ring-offset-2' : ''}`}
      style={{
        borderColor: isSelected ? groupColor : 'transparent',
        boxShadow: isSelected ? `0 0 0 2px ${groupColor}, 0 4px 12px rgba(0,0,0,0.1)` : undefined,
      }}
      onClick={() => !disabled && onSelect(isSelected ? null : 0)}
    >
      {/* Group indicator badge */}
      {isSelected && (
        <div
          className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: groupColors[selectedGroup!] }}
        >
          {selectedGroup! + 1}
        </div>
      )}

      {/* Thumbnail */}
      {post.thumbnailUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100 dark:bg-gray-800">
          <img
            src={post.thumbnailUrl}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span className="font-mono text-orange-500">r/{post.subreddit}</span>
          <span>·</span>
          <span>u/{post.author}</span>
          <span>·</span>
          <span>{post.score.toLocaleString()} ↑</span>
        </div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{post.title}</h3>
      </div>

      {/* Selection hint */}
      {!isSelected && !disabled && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400 bg-white/90 dark:bg-gray-900/90 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          Tap to group
        </div>
      )}

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium text-white px-2 py-1 rounded"
          style={{ backgroundColor: groupColors[selectedGroup!] }}
        >
          Group {selectedGroup! + 1}
        </div>
      )}
    </div>
  );
};