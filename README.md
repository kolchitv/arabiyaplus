# ArabiaEasy — Interactive Book Builder

A visual editor for teachers to build interactive Arabic educational books without writing code. React 19 + TypeScript + Vite + Tailwind + Fabric.js + Zustand + IndexedDB, RTL-first.

This is **Phase 1** of a multi-phase build. It's a real, working application — not a mockup — but it does not yet cover every feature in the original brief. See **Roadmap** below for exactly what's implemented vs. planned.

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

```bash
npm run build      # production build to dist/
npm run preview    # preview the production build locally
```

No environment variables or backend are required — everything runs client-side and persists to the browser's IndexedDB.

## Architecture

```
src/
  components/
    editor/        Fabric.js canvas + hotspot drawing/editing
    reader/        (reserved for Phase 2 reader-specific components)
    quiz/           (reserved — Quiz Builder UI lands in Phase 2)
    audio/          Upload / record / preview / replace / delete audio
    navigation/     Prev/Next/Home, progress bar, table of contents
    toolbar/        Editor toolbar (tools, zoom, undo/redo, save)
    sidebar/        Page manager (add/delete/duplicate/reorder pages)
    properties/     Hotspot properties panel (action config)
    dashboard/      Home dashboard cards
    ui/             Hand-written button/input/card/dialog primitives
                    (equivalent to shadcn/ui — written by hand since this
                    sandbox has no network access to run the shadcn CLI;
                    they follow the same API shape, so swapping in real
                    shadcn components later is a drop-in change)
  pages/            Route-level screens (Dashboard, BookInfo, Editor, Reader)
  store/            Zustand stores: book, ui, media, progress
  services/         IndexedDB persistence, image import
  types/            Shared domain types (Book, Page, Hotspot, Quiz, Media, Progress)
  hooks/            Cross-cutting hooks (hotspot action execution)
```

**Data model.** A `Book` owns an ordered list of `BookPage`s and a flat `quizzes: Quiz[]` collection. Each page owns `Hotspot[]`, where a hotspot has a shape (rectangle/circle/polygon/freedraw), normalized `x/y/width/height` (0–1, so geometry survives zoom/resize), and one `HotspotAction` (play audio, play video, show image, show popup, navigate to page, open URL, ask question, run animation). An `askQuestion` action stores a `quizId` pointing into `book.quizzes`. This schema is designed to support every quiz/action type in the original brief without another migration.

**Quiz architecture** (`src/types/quiz.ts`, `src/components/quiz/`): every one of the 17 kinds has its own concrete TypeScript interface (not a generic blob), grouped by interaction pattern across four editor files and four runner files — choice-based, sequence-based, pair/relationship-based, and open-response. `src/utils/quizScoring.ts` has one scoring function per kind, normalized to a common `QuizAnswer` shape. `QuizRunner` is the shared shell that walks a student through items, shows feedback, and produces a `QuizAttemptResult`; `QuizBuilderModal` is the shared teacher-facing shell for authoring. Kinds that aren't auto-scorable (audio recording, pronunciation, flip cards) submit a `correct: null` answer so the UI shows "submitted for review" instead of right/wrong — a teacher review screen for those is on the roadmap.

**PDF import** (`src/services/pdfImport.ts`): uses `pdf.js` to rasterize each PDF page onto a canvas at 2x scale, stores the result as a PNG media asset, and creates one `BookPage` per PDF page at the PDF's native aspect ratio. `src/services/importService.ts` routes a mixed file selection (PDFs and images together) through the right importer and returns one flat, correctly-ordered page list.

**Persistence.** Everything is saved to IndexedDB via `src/services/db.ts` (books, raw media blobs, per-book student progress). Media files are stored as blobs and rehydrated to object URLs on load, since `blob:` URLs don't survive a page reload.

**Design tokens.** Colors, fonts, and animations are centralized in `tailwind.config.ts`: Ink Indigo (chrome), Canvas Cream (the page surface), Amber Signal (interactive accents), Palm Teal (navigation/success). Hotspots render as a pulsing "seal" marker — a small signature detail nodding to manuscript stamps rather than a generic dot.

## What's implemented (Phase 1 + this update)

- Dashboard: new/open/import/dark-mode, recent projects grid
- Book Info form (title, author, grade, language, subject, unit, lesson, description)
- Page Manager: unlimited pages, add/delete/duplicate/reorder, thumbnail list, **import PDF or images directly into an open book**
- **PDF import**: every PDF page is rasterized (via `pdf.js`) into its own editable page at native aspect ratio
- Image import (PNG/JPG/WEBP) → each image becomes an editable page
- Canvas page editor (Fabric.js): zoom, grid toggle, pan via browser scroll
- Hotspots: rectangle & circle creation, drag/resize/rotate, per-hotspot undo/redo
- Hotspot actions: play audio (upload + mic recording + preview), show image, play video, show popup, navigate to page, open URL, run animation, **ask question (full Quiz Builder integration)**
- **Full Quiz Builder** — all 17 quiz kinds from the spec, each with a real authoring UI and a real student-facing play-through:
  multiple choice, true/false, matching, drag & drop, fill-in-the-blank, ordering, connect items, typing,
  audio recording, image selection, memory game, flip cards, word builder, sentence builder, listening,
  reading, and pronunciation. Auto-scored kinds compute right/wrong against the teacher's answer key
  (`src/utils/quizScoring.ts`); audio/pronunciation/flip-cards are marked "submitted" for manual teacher review.
  A quiz is created/edited from a hotspot's "ask question" action and stored on the book (`book.quizzes`).
- Student/Teacher mode toggle
- Reader mode: renders pages with clickable hotspot seals, previous/next/home navigation, auto-generated table of contents (grouped by unit/lesson), progress bar, stars/coins/bookmarks persisted per book, and now a full quiz-taking flow with a pass/fail summary screen
- Full IndexedDB save/load for books, media, student progress, and quiz results
- PWA scaffold (manifest + service worker via `vite-plugin-pwa`)
- RTL layout throughout, Arabic font stack (Cairo/Tajawal/IBM Plex Sans Arabic/Amiri)

## Roadmap (not yet built)

1. **Polygon & free-draw hotspots** — point-editing and freehand path capture (rectangle/circle are fully working now).
2. **Media Library browser UI** — assets are already stored and organized by folder (`images/audio/videos/icons/backgrounds`); a dedicated library/browser screen is next.
3. **Export pipeline** — ZIP (via `jszip`, already a dependency), standalone HTML, PWA bundle, and SCORM packaging.
4. **Gamification UI** — badges/levels/achievements surfacing (stars/coins/bookmarks/quiz results already persist).
5. **OCR & TTS** — extract Arabic text from imported pages; generate speech for hotspot audio automatically.
6. **Settings screen** — font/theme/RTL/sound/animation toggles (the underlying `BookSettings` fields already exist on the book).
7. **Search** — live search across lessons/words/pages/quizzes.
8. **Snap-to-grid & guideline snapping** in the canvas editor (grid is visible; magnetic snapping isn't wired yet).
9. **Teacher review UI** for audio-recording/pronunciation quiz submissions (currently stored as a response but with no review screen).

## Notes on environment

This project was generated in a sandboxed environment without network/npm access, so dependencies were selected and code was hand-written to be correct against each library's documented API, but the build has **not** been run or compiled here. Please run `npm install && npm run build` after downloading to confirm your toolchain — file an issue in your own tracking if you hit a version mismatch (React 19 / Fabric 6 / Tailwind 3 are current as of writing, but pin exact versions in `package.json` if you need reproducibility).
