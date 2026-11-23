/**
 * useGame Hook - Main game logic for Converge
 * Handles puzzle loading, grouping, submission, and state management
 */

import { useCallback, useEffect, useState } from 'react';
import type { Puzzle, PuzzlePost, PlayerGroup, GameSession, GameScore } from '../../shared/gameTypes';

interface GameState {
  puzzle: Puzzle | null;
  session: GameSession | null;
  score: GameScore | null;
  loading: boolean;
  error: string | null;
  phase: 'loading' | 'playing' | 'submitted' | 'revealed';
}

export const useGame = () => {
  const [state, setState] = useState<GameState>({
    puzzle: null,
    session: null,
    score: null,
    loading: true,
    error: null,
    phase: 'loading',
  });

  // Load puzzle on mount
  useEffect(() => {
    const loadPuzzle = async () => {
      try {
        const res = await fetch('/api/game/puzzle');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.puzzle) {
          setState((prev) => ({
            ...prev,
            puzzle: data.puzzle,
            session: data.session ?? null,
            loading: false,
            phase: data.session?.submittedAt ? 'revealed' : 'playing',
          }));

          // If already submitted, load score
          if (data.session?.submittedAt && data.session?.score) {
            setState((prev) => ({
              ...prev,
              score: data.session.score,
              phase: 'revealed',
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load puzzle:', err);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: 'Failed to load puzzle. Please refresh.',
        }));
      }
    };
    void loadPuzzle();
  }, []);

  // Toggle post in a group
  const togglePostInGroup = useCallback((postId: string, groupId: number) => {
    setState((prev) => {
      if (!prev.puzzle || prev.phase !== 'playing') return prev;

      const newPlayerGroups = [...(prev.session?.playerGroups ?? [])];

      // Find if post is already in a group
      let existingGroupIndex = -1;
      let existingPostIndex = -1;
      for (let i = 0; i < newPlayerGroups.length; i++) {
        const idx = newPlayerGroups[i].postIds.indexOf(postId);
        if (idx !== -1) {
          existingGroupIndex = i;
          existingPostIndex = idx;
          break;
        }
      }

      // If post already in this group, remove it
      if (existingGroupIndex !== -1 && newPlayerGroups[existingGroupIndex].groupId === groupId) {
        const updatedGroup = { ...newPlayerGroups[existingGroupIndex] };
        updatedGroup.postIds = updatedGroup.postIds.filter((id) => id !== postId);
        if (updatedGroup.postIds.length === 0) {
          newPlayerGroups.splice(existingGroupIndex, 1);
        } else {
          newPlayerGroups[existingGroupIndex] = updatedGroup;
        }
      }
      // If post in different group, move it
      else if (existingGroupIndex !== -1) {
        // Remove from old group
        const oldGroup = { ...newPlayerGroups[existingGroupIndex] };
        oldGroup.postIds = oldGroup.postIds.filter((id) => id !== postId);
        if (oldGroup.postIds.length === 0) {
          newPlayerGroups.splice(existingGroupIndex, 1);
        } else {
          newPlayerGroups[existingGroupIndex] = oldGroup;
        }

        // Add to new group
        const targetIndex = newPlayerGroups.findIndex((g) => g.groupId === groupId);
        if (targetIndex !== -1) {
          newPlayerGroups[targetIndex] = {
            ...newPlayerGroups[targetIndex],
            postIds: [...newPlayerGroups[targetIndex].postIds, postId],
          };
        } else {
          newPlayerGroups.push({ groupId, postIds: [postId] });
        }
      }
      // Post not in any group, add it
      else {
        const targetIndex = newPlayerGroups.findIndex((g) => g.groupId === groupId);
        if (targetIndex !== -1) {
          newPlayerGroups[targetIndex] = {
            ...newPlayerGroups[targetIndex],
            postIds: [...newPlayerGroups[targetIndex].postIds, postId],
          };
        } else {
          newPlayerGroups.push({ groupId, postIds: [postId] });
        }
      }

      return {
        ...prev,
        session: prev.session ? { ...prev.session, playerGroups: newPlayerGroups } : null,
      };
    });
  }, []);

  // Check if a post is in a specific group
  const isPostInGroup = useCallback(
    (postId: string, groupId: number): boolean => {
      const group = state.session?.playerGroups.find((g) => g.groupId === groupId);
      return group?.postIds.includes(postId) ?? false;
    },
    [state.session?.playerGroups]
  );

  // Get posts in a group
  const getPostsInGroup = useCallback(
    (groupId: number): PuzzlePost[] => {
      if (!state.puzzle) return [];
      const group = state.session?.playerGroups.find((g) => g.groupId === groupId);
      if (!group) return [];
      return state.puzzle.posts.filter((p) => group.postIds.includes(p.id));
    },
    [state.puzzle, state.session?.playerGroups]
  );

  // Check if all posts are grouped
  const allPostsGrouped = useCallback((): boolean => {
    if (!state.puzzle || !state.session) return false;
    const groupedCount = state.session.playerGroups.reduce(
      (sum, g) => sum + g.postIds.length,
      0
    );
    return groupedCount === state.puzzle.posts.length;
  }, [state.puzzle, state.session]);

  // Submit answer
  const submitAnswer = useCallback(async () => {
    if (!state.puzzle || !state.session) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puzzleId: state.puzzle.id,
          playerGroups: state.session.playerGroups,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setState((prev) => ({
        ...prev,
        score: data.score,
        puzzle: data.puzzle,
        session: data.session,
        loading: false,
        phase: 'revealed',
      }));
    } catch (err) {
      console.error('Submit failed:', err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to submit. Please try again.',
      }));
    }
  }, [state.puzzle, state.session]);

  // Reset game (for testing or replay)
  const resetGame = useCallback(() => {
    setState({
      puzzle: null,
      session: null,
      score: null,
      loading: true,
      error: null,
      phase: 'loading',
    });
    // Reload puzzle
    window.location.reload();
  }, []);

  return {
    ...state,
    togglePostInGroup,
    isPostInGroup,
    getPostsInGroup,
    allPostsGrouped,
    submitAnswer,
    resetGame,
    // Computed
    groupedCount: state.session?.playerGroups.reduce((sum, g) => sum + g.postIds.length, 0) ?? 0,
    totalPosts: state.puzzle?.posts.length ?? 0,
  };
};