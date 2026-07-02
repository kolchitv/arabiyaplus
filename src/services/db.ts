import { openDB, type IDBPDatabase } from "idb";
import type { Book } from "@/types/book";
import type { StudentProgress } from "@/types/progress";

const DB_NAME = "arabiaeasy-db";
const DB_VERSION = 1;

export const STORES = {
  books: "books",
  mediaBlobs: "mediaBlobs", // raw file bytes, keyed by media asset id
  progress: "progress"
} as const;

let dbPromise: Promise<IDBPDatabase> | null = null;

/**
 * Lazily opens (and migrates) the single ArabiaEasy IndexedDB database.
 * All persistence in the app funnels through this module so storage
 * concerns stay in one place.
 */
function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORES.books)) {
          db.createObjectStore(STORES.books, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.mediaBlobs)) {
          db.createObjectStore(STORES.mediaBlobs, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.progress)) {
          db.createObjectStore(STORES.progress, { keyPath: "bookId" });
        }
      }
    });
  }
  return dbPromise;
}

export async function saveBook(book: Book): Promise<void> {
  const db = await getDb();
  await db.put(STORES.books, book);
}

export async function loadBook(id: string): Promise<Book | undefined> {
  const db = await getDb();
  return db.get(STORES.books, id);
}

export async function listBooks(): Promise<Book[]> {
  const db = await getDb();
  return db.getAll(STORES.books);
}

export async function deleteBook(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORES.books, id);
}

export interface StoredMediaBlob {
  id: string;
  blob: Blob;
}

export async function saveMediaBlob(id: string, blob: Blob): Promise<void> {
  const db = await getDb();
  await db.put(STORES.mediaBlobs, { id, blob });
}

export async function loadMediaBlob(id: string): Promise<Blob | undefined> {
  const db = await getDb();
  const record = (await db.get(STORES.mediaBlobs, id)) as StoredMediaBlob | undefined;
  return record?.blob;
}

export async function deleteMediaBlob(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORES.mediaBlobs, id);
}

export async function saveProgress(progress: StudentProgress): Promise<void> {
  const db = await getDb();
  await db.put(STORES.progress, progress);
}

export async function loadProgress(bookId: string): Promise<StudentProgress | undefined> {
  const db = await getDb();
  return db.get(STORES.progress, bookId);
}
