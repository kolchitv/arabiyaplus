export interface StudentProgress {
  bookId: string;
  lastPageId: string | null;
  visitedPageIds: string[];
  stars: number;
  coins: number;
  badges: string[];
  level: number;
  quizResults: Record<string, { earnedPoints: number; totalPoints: number; attempts: number }>;
  totalReadingSeconds: number;
  bookmarks: string[]; // page ids
  favorites: string[]; // page ids
  updatedAt: string;
}

export function createEmptyProgress(bookId: string): StudentProgress {
  return {
    bookId,
    lastPageId: null,
    visitedPageIds: [],
    stars: 0,
    coins: 0,
    badges: [],
    level: 1,
    quizResults: {},
    totalReadingSeconds: 0,
    bookmarks: [],
    favorites: [],
    updatedAt: new Date().toISOString()
  };
}
