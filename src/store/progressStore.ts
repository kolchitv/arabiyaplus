import { create } from "zustand";
import type { StudentProgress } from "@/types/progress";
import { createEmptyProgress } from "@/types/progress";
import { loadProgress, saveProgress } from "@/services/db";

interface ProgressState {
  progress: StudentProgress | null;
  load: (bookId: string) => Promise<void>;
  visitPage: (pageId: string) => void;
  addStars: (count: number) => void;
  addCoins: (count: number) => void;
  toggleBookmark: (pageId: string) => void;
  recordQuizResult: (quizId: string, earnedPoints: number, totalPoints: number) => void;
}

function persist(progress: StudentProgress) {
  saveProgress({ ...progress, updatedAt: new Date().toISOString() });
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: null,

  load: async (bookId) => {
    const existing = await loadProgress(bookId);
    set({ progress: existing ?? createEmptyProgress(bookId) });
  },

  visitPage: (pageId) => {
    const { progress } = get();
    if (!progress) return;
    if (progress.visitedPageIds.includes(pageId)) {
      const updated = { ...progress, lastPageId: pageId };
      set({ progress: updated });
      persist(updated);
      return;
    }
    const updated: StudentProgress = {
      ...progress,
      lastPageId: pageId,
      visitedPageIds: [...progress.visitedPageIds, pageId]
    };
    set({ progress: updated });
    persist(updated);
  },

  addStars: (count) => {
    const { progress } = get();
    if (!progress) return;
    const updated = { ...progress, stars: progress.stars + count };
    set({ progress: updated });
    persist(updated);
  },

  addCoins: (count) => {
    const { progress } = get();
    if (!progress) return;
    const updated = { ...progress, coins: progress.coins + count };
    set({ progress: updated });
    persist(updated);
  },

  toggleBookmark: (pageId) => {
    const { progress } = get();
    if (!progress) return;
    const bookmarks = progress.bookmarks.includes(pageId)
      ? progress.bookmarks.filter((id) => id !== pageId)
      : [...progress.bookmarks, pageId];
    const updated = { ...progress, bookmarks };
    set({ progress: updated });
    persist(updated);
  },

  recordQuizResult: (quizId, earnedPoints, totalPoints) => {
    const { progress } = get();
    if (!progress) return;
    const previous = progress.quizResults[quizId];
    const updated: StudentProgress = {
      ...progress,
      quizResults: {
        ...progress.quizResults,
        [quizId]: {
          earnedPoints: Math.max(earnedPoints, previous?.earnedPoints ?? 0),
          totalPoints,
          attempts: (previous?.attempts ?? 0) + 1
        }
      }
    };
    set({ progress: updated });
    persist(updated);
  }
}));
