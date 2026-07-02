import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type { Book, BookInfo, BookPage, Hotspot } from "@/types/book";
import { saveBook, loadBook, listBooks, deleteBook as dbDeleteBook } from "@/services/db";

function nowIso() {
  return new Date().toISOString();
}

export function createEmptyBook(info: Partial<BookInfo> = {}): Book {
  const timestamp = nowIso();
  return {
    id: uuid(),
    info: {
      title: info.title ?? "كتاب جديد",
      author: info.author ?? "",
      grade: info.grade ?? "",
      language: info.language ?? "ar",
      subject: info.subject ?? "",
      unit: info.unit ?? "",
      lesson: info.lesson ?? "",
      description: info.description ?? "",
      coverImageId: info.coverImageId
    },
    settings: {
      theme: "light",
      fontFamily: "tajawal",
      rtl: true,
      soundEnabled: true,
      animationsEnabled: true
    },
    pages: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    version: 1
  };
}

function createEmptyPage(order: number): BookPage {
  return {
    id: uuid(),
    order,
    title: `صفحة ${order + 1}`,
    width: 1240,
    height: 1754, // A4-ish portrait at 150dpi, matches PDF import default
    hotspots: []
  };
}

interface PageHistory {
  past: Hotspot[][];
  future: Hotspot[][];
}

interface BookState {
  book: Book | null;
  recentBooks: Book[];
  activePageId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  /** Per-page undo/redo stacks of hotspot snapshots. Kept in memory only —
   *  history is intentionally not persisted across sessions. */
  history: Record<string, PageHistory>;
  undo: (pageId: string) => void;
  redo: (pageId: string) => void;
  canUndo: (pageId: string) => boolean;
  canRedo: (pageId: string) => boolean;

  // Lifecycle
  refreshRecentBooks: () => Promise<void>;
  newBook: (info?: Partial<BookInfo>) => void;
  openBook: (id: string) => Promise<void>;
  save: () => Promise<void>;
  removeBook: (id: string) => Promise<void>;

  // Book-level edits
  updateInfo: (info: Partial<BookInfo>) => void;
  updateSettings: (settings: Partial<Book["settings"]>) => void;

  // Page management
  addPage: () => string; // returns new page id
  deletePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => void;
  movePage: (pageId: string, direction: "up" | "down") => void;
  reorderPages: (orderedIds: string[]) => void;
  setActivePage: (pageId: string | null) => void;
  updatePage: (pageId: string, patch: Partial<BookPage>) => void;

  // Hotspot management
  addHotspot: (pageId: string, hotspot: Hotspot) => void;
  updateHotspot: (pageId: string, hotspotId: string, patch: Partial<Hotspot>) => void;
  deleteHotspot: (pageId: string, hotspotId: string) => void;
}

function touch(book: Book): Book {
  return { ...book, updatedAt: nowIso() };
}

function recordHistory(state: BookState, pageId: string, snapshot: Hotspot[]): BookState["history"] {
  const existing = state.history[pageId] ?? { past: [], future: [] };
  return {
    ...state.history,
    [pageId]: { past: [...existing.past, snapshot], future: [] }
  };
}

export const useBookStore = create<BookState>((set, get) => ({
  book: null,
  recentBooks: [],
  activePageId: null,
  isDirty: false,
  isSaving: false,
  history: {},

  undo: (pageId) => {
    const { book, history } = get();
    if (!book) return;
    const pageHistory = history[pageId];
    if (!pageHistory || pageHistory.past.length === 0) return;
    const page = book.pages.find((p) => p.id === pageId);
    if (!page) return;

    const previous = pageHistory.past[pageHistory.past.length - 1];
    const past = pageHistory.past.slice(0, -1);
    const future = [page.hotspots, ...pageHistory.future];

    const pages = book.pages.map((p) => (p.id === pageId ? { ...p, hotspots: previous } : p));
    set({
      book: { ...book, pages },
      history: { ...history, [pageId]: { past, future } },
      isDirty: true
    });
  },

  redo: (pageId) => {
    const { book, history } = get();
    if (!book) return;
    const pageHistory = history[pageId];
    if (!pageHistory || pageHistory.future.length === 0) return;
    const page = book.pages.find((p) => p.id === pageId);
    if (!page) return;

    const next = pageHistory.future[0];
    const future = pageHistory.future.slice(1);
    const past = [...pageHistory.past, page.hotspots];

    const pages = book.pages.map((p) => (p.id === pageId ? { ...p, hotspots: next } : p));
    set({
      book: { ...book, pages },
      history: { ...history, [pageId]: { past, future } },
      isDirty: true
    });
  },

  canUndo: (pageId) => (get().history[pageId]?.past.length ?? 0) > 0,
  canRedo: (pageId) => (get().history[pageId]?.future.length ?? 0) > 0,

  refreshRecentBooks: async () => {
    const books = await listBooks();
    books.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
    set({ recentBooks: books });
  },

  newBook: (info) => {
    const book = createEmptyBook(info);
    const firstPage = createEmptyPage(0);
    book.pages = [firstPage];
    set({ book, activePageId: firstPage.id, isDirty: true });
  },

  openBook: async (id) => {
    const book = await loadBook(id);
    if (book) {
      set({ book, activePageId: book.pages[0]?.id ?? null, isDirty: false });
    }
  },

  save: async () => {
    const { book } = get();
    if (!book) return;
    set({ isSaving: true });
    const toSave = touch(book);
    await saveBook(toSave);
    set({ book: toSave, isDirty: false, isSaving: false });
    await get().refreshRecentBooks();
  },

  removeBook: async (id) => {
    await dbDeleteBook(id);
    await get().refreshRecentBooks();
  },

  updateInfo: (info) => {
    const { book } = get();
    if (!book) return;
    set({ book: { ...book, info: { ...book.info, ...info } }, isDirty: true });
  },

  updateSettings: (settings) => {
    const { book } = get();
    if (!book) return;
    set({ book: { ...book, settings: { ...book.settings, ...settings } }, isDirty: true });
  },

  addPage: () => {
    const { book } = get();
    if (!book) return "";
    const page = createEmptyPage(book.pages.length);
    const pages = [...book.pages, page];
    set({ book: { ...book, pages }, activePageId: page.id, isDirty: true });
    return page.id;
  },

  deletePage: (pageId) => {
    const { book } = get();
    if (!book) return;
    const pages = book.pages
      .filter((p) => p.id !== pageId)
      .map((p, index) => ({ ...p, order: index }));
    const nextActive = pages[0]?.id ?? null;
    set({
      book: { ...book, pages },
      activePageId: get().activePageId === pageId ? nextActive : get().activePageId,
      isDirty: true
    });
  },

  duplicatePage: (pageId) => {
    const { book } = get();
    if (!book) return;
    const source = book.pages.find((p) => p.id === pageId);
    if (!source) return;
    const clone: BookPage = {
      ...source,
      id: uuid(),
      title: `${source.title} (نسخة)`,
      hotspots: source.hotspots.map((h) => ({ ...h, id: uuid() }))
    };
    const index = book.pages.findIndex((p) => p.id === pageId);
    const pages = [...book.pages];
    pages.splice(index + 1, 0, clone);
    const reordered = pages.map((p, i) => ({ ...p, order: i }));
    set({ book: { ...book, pages: reordered }, activePageId: clone.id, isDirty: true });
  },

  movePage: (pageId, direction) => {
    const { book } = get();
    if (!book) return;
    const index = book.pages.findIndex((p) => p.id === pageId);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || targetIndex < 0 || targetIndex >= book.pages.length) return;
    const pages = [...book.pages];
    [pages[index], pages[targetIndex]] = [pages[targetIndex], pages[index]];
    const reordered = pages.map((p, i) => ({ ...p, order: i }));
    set({ book: { ...book, pages: reordered }, isDirty: true });
  },

  reorderPages: (orderedIds) => {
    const { book } = get();
    if (!book) return;
    const byId = new Map(book.pages.map((p) => [p.id, p]));
    const pages = orderedIds
      .map((id, index) => {
        const p = byId.get(id);
        return p ? { ...p, order: index } : null;
      })
      .filter((p): p is BookPage => p !== null);
    set({ book: { ...book, pages }, isDirty: true });
  },

  setActivePage: (pageId) => set({ activePageId: pageId }),

  updatePage: (pageId, patch) => {
    const { book } = get();
    if (!book) return;
    const pages = book.pages.map((p) => (p.id === pageId ? { ...p, ...patch } : p));
    set({ book: { ...book, pages }, isDirty: true });
  },

  addHotspot: (pageId, hotspot) => {
    const state = get();
    const { book } = state;
    if (!book) return;
    const page = book.pages.find((p) => p.id === pageId);
    if (!page) return;
    const history = recordHistory(state, pageId, page.hotspots);
    const pages = book.pages.map((p) =>
      p.id === pageId ? { ...p, hotspots: [...p.hotspots, hotspot] } : p
    );
    set({ book: { ...book, pages }, history, isDirty: true });
  },

  updateHotspot: (pageId, hotspotId, patch) => {
    const state = get();
    const { book } = state;
    if (!book) return;
    const page = book.pages.find((p) => p.id === pageId);
    if (!page) return;
    const history = recordHistory(state, pageId, page.hotspots);
    const pages = book.pages.map((p) => {
      if (p.id !== pageId) return p;
      return {
        ...p,
        hotspots: p.hotspots.map((h) => (h.id === hotspotId ? { ...h, ...patch } : h))
      };
    });
    set({ book: { ...book, pages }, history, isDirty: true });
  },

  deleteHotspot: (pageId, hotspotId) => {
    const state = get();
    const { book } = state;
    if (!book) return;
    const page = book.pages.find((p) => p.id === pageId);
    if (!page) return;
    const history = recordHistory(state, pageId, page.hotspots);
    const pages = book.pages.map((p) =>
      p.id === pageId ? { ...p, hotspots: p.hotspots.filter((h) => h.id !== hotspotId) } : p
    );
    set({ book: { ...book, pages }, history, isDirty: true });
  }
}));
