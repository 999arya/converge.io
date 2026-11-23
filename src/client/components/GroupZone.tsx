/**
 * GroupZone Component - Drop zone for a group of posts
 */

import { PostCard } from './PostCard';
import type { PuzzlePost } from '../../shared/gameTypes';

interface GroupZoneProps {
  groupId: number;
  posts: PuzzlePost[];
  color: string;
  onPostClick: (postId: string, groupId: number) => void;
  disabled?: boolean;
  isComplete?: boolean;
}

const GROUP_LABELS = ['Group 1', 'Group 2', 'Group 3'];
const GROUP_ICONS = ['🔵', '🟢', '🟣'];

export const GroupZone = ({
  groupId,
  posts,
  color,
  onPostClick,
  disabled = false,
  isComplete = false,
}: GroupZoneProps) => {
  return (
    <div
      className={`relative flex flex-col min-h-[200px] transition-all duration-300 ${
        isComplete ? 'ring-2' : 'border-2 border-dashed'
      }`}
      style={{
        borderColor: isComplete ? color : color + '80',
        backgroundColor: isComplete ? color + '10' : 'transparent',
        boxShadow: isComplete ? `0 0 0 2px ${color}, 0 8px 24px ${color}40` : undefined,
      }}
    >
      {/* Group Header */}
      <div
        className="flex items-center justify-between p-3 sticky top-0 z-10"
        style={{ backgroundColor: isComplete ? color + '20' : 'transparent' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{GROUP_ICONS[groupId]}</span>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{GROUP_LABELS[groupId]}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{posts.length} posts</p>
          </div>
        </div>
        {isComplete && (
          <span
            className="text-xs font-medium px-2 py-1 rounded-full text-white"
            style={{ backgroundColor: color }}
          >
            Complete
          </span>
        )}
      </div>

      {/* Posts in this group */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {posts.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-500"
            style={{ borderColor: color + '80' }}
          >
            <span className="text-4xl mb-2">{GROUP_ICONS[groupId]}</span>
            <p className="font-medium">Drop posts here</p>
            <p className="text-sm">Tap a post to add it to this group</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              selectedGroup={groupId}
              groupColors={[color]}
              onSelect={(g) => onPostClick(post.id, g)}
              disabled={disabled}
            />
          ))
        )}
      </div>

      {/* Completion indicator */}
      {isComplete && (
        <div className="absolute bottom-3 right-3 text-3xl animate-bounce" style={{ color }}>
          ✓
        </div>
      )}
    </div>
  );
};