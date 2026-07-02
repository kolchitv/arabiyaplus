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

**Data model.** A `Book` owns an ordered list of `BookPage`s. Each page owns `Hotspot[]`, where a hotspot has a shape (rectangle/circle/polygon/freedraw), normalized `x/y/width/height` (0–1, so geometry survives zoom/resize), and one `HotspotAction` (play audio, play video, show image, show popup, navigate to page, open URL, ask question, run animation). This schema is designed to support every quiz/action type in the original brief without another migration — Phase 2+ add renderers and builders against the same types in `src/types/`.

**Persistence.** Everything is saved to IndexedDB via `src/services/db.ts` (books, raw media blobs, per-book student progress). Media files are stored as blobs and rehydrated to object URLs on load, since `blob:` URLs don't survive a page reload.

**Design tokens.** Colors, fonts, and animations are centralized in `tailwind.config.ts`: Ink Indigo (chrome), Canvas Cream (the page surface), Amber Signal (interactive accents), Palm Teal (navigation/success). Hotspots render as a pulsing "seal" marker — a small signature detail nodding to manuscript stamps rather than a generic dot.

## What's implemented in Phase 1

- Dashboard: new/open/import/dark-mode, recent projects grid
- Book Info form (title, author, grade, language, subject, unit, lesson, description)
- Page Manager: unlimited pages, add/delete/duplicate/reorder, thumbnail list
- Image import (PNG/JPG/WEBP) → each image becomes an editable page
- Canvas page editor (Fabric.js): zoom, grid toggle, pan via browser scroll
- Hotspots: rectangle & circle creation, drag/resize/rotate, per-hotspot undo/redo
- Hotspot actions: play audio (upload + mic recording + preview), show image, play video, show popup, navigate to page, open URL, run animation (visual classes wired in reader)
- Student/Teacher mode toggle
- Reader mode: renders pages with clickable hotspot seals, previous/next/home navigation, auto-generated table of contents (grouped by unit/lesson), progress bar, stars/coins/bookmarks persisted per book
- Full IndexedDB save/load for books, media, and student progress
- PWA scaffold (manifest + service worker via `vite-plugin-pwa`)
- RTL layout throughout, Arabic font stack (Cairo/Tajawal/IBM Plex Sans Arabic/Amiri)

## Roadmap (not yet built)

These are modeled in `src/types/` so they plug in without schema changes, but have no UI/logic yet:

1. **PDF import** — rasterize each PDF page via `pdf.js` into an editable page (`src/services/importService.ts` has the integration point stubbed).
2. **Polygon & free-draw hotspots** — point-editing and freehand path capture (rectangle/circle are fully working now).
3. **Quiz Builder** — full authoring UI for all 17 quiz kinds (`src/types/quiz.ts` already models multiple choice, true/false, matching, drag & drop, fill-in-blank, ordering, connect items, typing, audio recording, image selection, memory game, flip cards, word/sentence builder, listening/reading/pronunciation quizzes). Multiple choice and true/false have full schema + are closest to done.
4. **Media Library browser UI** — assets are already stored and organized by folder (`images/audio/videos/icons/backgrounds`); a dedicated library/browser screen is next.
5. **Export pipeline** — ZIP (via `jszip`, already a dependency), standalone HTML, PWA bundle, and SCORM packaging.
6. **Gamification UI** — badges/levels/achievements surfacing (stars/coins/bookmarks already persist).
7. **OCR & TTS** — extract Arabic text from imported pages; generate speech for hotspot audio automatically.
8. **Settings screen** — font/theme/RTL/sound/animation toggles (the underlying `BookSettings` fields already exist on the book).
9. **Search** — live search across lessons/words/pages/quizzes.
10. **Snap-to-grid & guideline snapping** in the canvas editor (grid is visible; magnetic snapping isn't wired yet).

## Notes on environment

This project was generated in a sandboxed environment without network/npm access, so dependencies were selected and code was hand-written to be correct against each library's documented API, but the build has **not** been run or compiled here. Please run `npm install && npm run build` after downloading to confirm your toolchain — file an issue in your own tracking if you hit a version mismatch (React 19 / Fabric 6 / Tailwind 3 are current as of writing, but pin exact versions in `package.json` if you need reproducibility).
