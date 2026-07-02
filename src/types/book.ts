/**
 * Core domain types for an ArabiaEasy project.
 * A "Book" is the top-level document a teacher builds; it owns Units,
 * which own Lessons, which own Pages. Pages own Hotspots and (optionally)
 * a Quiz. Everything here is plain serializable data — no class instances —
 * so the whole book can be persisted to IndexedDB / exported as JSON.
 */

export type Language = "ar" | "en" | "fr";

export interface BookInfo {
  title: string;
  author: string;
  grade: string;
  language: Language;
  subject: string;
  unit: string;
  lesson: string;
  coverImageId?: string; // reference into MediaLibrary
  description: string;
}

export interface BookSettings {
  theme: "light" | "dark" | "system";
  fontFamily: "cairo" | "tajawal" | "plexArabic" | "amiri";
  rtl: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
}

export interface Book {
  id: string;
  info: BookInfo;
  settings: BookSettings;
  pages: BookPage[];
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  version: number; // schema version, for future migrations
}

export interface BookPage {
  id: string;
  order: number;
  unitLabel?: string; // for Table of Contents grouping
  lessonLabel?: string;
  title: string;
  backgroundImageId?: string; // reference into MediaLibrary (imported PDF/image page)
  width: number; // canvas design-space width in px
  height: number; // canvas design-space height in px
  hotspots: Hotspot[];
  quizId?: string; // reference into quiz collection, if this page has a quiz
  notes?: string; // teacher notes
}

export type HotspotShape = "rectangle" | "circle" | "polygon" | "freedraw";

export type HotspotAction =
  | { type: "playAudio"; mediaId: string }
  | { type: "playVideo"; mediaId: string }
  | { type: "showImage"; mediaId: string }
  | { type: "showPopup"; title: string; content: string }
  | { type: "navigatePage"; targetPageId: string }
  | { type: "openUrl"; url: string }
  | { type: "askQuestion"; quizId: string }
  | { type: "runAnimation"; animation: AnimationKind };

export type AnimationKind = "fade" | "scale" | "bounce" | "slide" | "glow" | "pulse";

export interface Hotspot {
  id: string;
  name: string;
  shape: HotspotShape;
  // Normalized coordinates (0..1) relative to page width/height so hotspots
  // stay correctly placed regardless of zoom or render size.
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  points?: { x: number; y: number }[]; // for polygon / freedraw shapes
  action: HotspotAction | null;
  animation?: AnimationKind;
  color?: string;
}
