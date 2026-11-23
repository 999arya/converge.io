/**
 * useGame Hook - Main game logic for Converge
 * Handles puzzle loading, grouping, submission, and state management
 */

import { useCallback, useEffect, useState } from 'react';

// Safe array access helper
function getArrayElement<T>(arr: T[], index: number): T | undefined {
  return index >= 0 && index < arr.length ? arr[index] : undefined;
}

export const useGame = () => {
  const [state, setState] = useState<{
    puzzle: {
      id: string;
      date: string;
      posts: { id: string; title: string; author: string; subreddit: string; score: number; thumbnailUrl?: string; permalink: string; isCorrectGroup?: number }[];
      groups: { id: number; theme: string; subreddit: string; postIds: string[]; description: string }[];
      crossPollination?: { postId: string; connectsGroups: number[]; bonusDescription: string }[];
    } | null;
    session: { playerGroups: { groupId: number; postIds: string[] }[]; streak?: number } | null;
    score: { correctGroups: number; totalGroups: number; correctPosts: number; totalPosts: number; crossPollinationFound: boolean; streak: number; flairTier: string } | null;
    loading: boolean;
    error: string | null;
    phase: 'loading' | 'playing' | 'submitted' | 'revealed';
  }>({
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
        if (!res.ok) throw new Error('HTTP ' + res.status);
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

      const newPlayerGroups = [...(prev.session?.playerGroups ?? [])] as { groupId: number; postIds: string[] }[];

      // Find if post is already in a group
      let existingGroupIndex = -1;
      for (let i = 0; i < newPlayerGroups.length; i++) {
        const group = newPlayerGroups[i];
        if (!group) continue;
        if (group.postIds.includes(postId)) {
          existingGroupIndex = i;
          break;
        }
      }

      // If post already in this group, remove it
      if (existingGroupIndex !== -1) {
        const group = getArrayElement(newPlayerGroups, existingGroupIndex);
        if (!group) return prev;
        if (group.groupId === groupId) {
          const updatedPostIds = group.postIds.filter((id) => id !== postId);
          if (updatedPostIds.length === 0) {
            newPlayerGroups.splice(existingGroupIndex, 1);
          } else {
            newPlayerGroups[existingGroupIndex] = { groupId: group.groupId, postIds: updatedPostIds };
          }
        }
        // If post in different group, move it
        else {
          // Remove from old group
          const oldGroup = getArrayElement(newPlayerGroups, existingGroupIndex);
          if (!oldGroup) return prev;
          const updatedPostIds = oldGroup.postIds.filter((id) => id !== postId);
          if (updatedPostIds.length === 0) {
            newPlayerGroups.splice(existingGroupIndex, 1);
          } else {
            newPlayerGroups[existingGroupIndex] = { groupId: oldGroup.groupId, postIds: updatedPostIds };
          }

          // Add to new group
          const targetIndex = newPlayerGroups.findIndex((g) => g.groupId === groupId);
          if (targetIndex !== -1) {
            const targetGroup = getArrayElement(newPlayerGroups, targetIndex);
            if (targetGroup) {
              newPlayerGroups[targetIndex] = { groupId, postIds: [...targetGroup.postIds, postId] };
            }
          } else {
            newPlayerGroups.push({ groupId, postIds: [postId] });
          }
        }
      }
      // Post not in any group, add it
      else {
        const targetIndex = newPlayerGroups.findIndex((g) => g.groupId === groupId);
        if (targetIndex !== -1) {
          const targetGroup = getArrayElement(newPlayerGroups, targetIndex);
          if (targetGroup) {
            newPlayerGroups[targetIndex] = { groupId, postIds: [...targetGroup.postIds, postId] };
          }
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

  // Remove post from its group
  const removePostFromGroup = useCallback((postId: string) => {
    setState((prev) => {
      if (!prev.puzzle || prev.phase !== 'playing') return prev;

      const newPlayerGroups = [...(prev.session?.playerGroups ?? [])] as { groupId: number; postIds: string[] }[];

      for (let i = 0; i < newPlayerGroups.length; i++) {
        const group = getArrayElement(newPlayerGroups, i);
        if (!group) continue;
        const idx = group.postIds.indexOf(postId);
        if (idx !== -1) {
          const updatedPostIds = group.postIds.filter((id) => id !== postId);
          if (updatedPostIds.length === 0) {
            newPlayerGroups.splice(i, 1);
          } else {
            newPlayerGroups[i] = { groupId: group.groupId, postIds: updatedPostIds };
          }
          break;
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
    (groupId: number) => {
      if (!state.puzzle) return [] as { id: string; title: string; author: string; subreddit: string; score: number; thumbnailUrl?: string; permalink: string; isCorrectGroup?: number }[];
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

      if (!res.ok) throw new Error('HTTP ' + res.status);
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
    removePostFromGroup,
    isPostInGroup,
    getPostsInGroup,
    allPostsGrouped,
    submitAnswer,
    resetGame,
    // Computed
    groupedCount: state.session?.playerGroups.reduce((sum, g) => sum + g.postIds.length, 0) ?? 0,
    totalPosts: state.puzzle?.posts.length ?? 0,
  };
}