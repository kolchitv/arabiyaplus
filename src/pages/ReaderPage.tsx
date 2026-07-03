import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Coins, Bookmark, X } from "lucide-react";
import { useBookStore } from "@/store/bookStore";
import { useProgressStore } from "@/store/progressStore";
import { useMediaStore } from "@/store/mediaStore";
import { useHotspotAction } from "@/hooks/useHotspotAction";
import { NavigationBar } from "@/components/navigation/NavigationBar";
import { TableOfContents } from "@/components/navigation/TableOfContents";
import { QuizRunner } from "@/components/quiz/runners/QuizRunner";
import { Button } from "@/components/ui/button";
import type { AnimationKind } from "@/types/book";
import type { QuizAttemptResult } from "@/types/quiz";

const ANIMATION_CLASS: Record<AnimationKind, string> = {
  fade: "animate-in fade-in",
  scale: "hover:scale-110 transition-transform",
  bounce: "animate-bounce",
  slide: "hover:translate-x-1 transition-transform",
  glow: "shadow-seal",
  pulse: "animate-seal-pulse"
};

export default function ReaderPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { book, openBook } = useBookStore();
  const { progress, load, visitPage, addStars, toggleBookmark, recordQuizResult } = useProgressStore();
  const getAsset = useMediaStore((s) => s.getAsset);
  const hydrateBlobUrl = useMediaStore((s) => s.hydrateBlobUrl);

  const [pageId, setPageId] = useState<string | null>(null);
  const [tocOpen, setTocOpen] = useState(false);
  const [bgUrl, setBgUrl] = useState<string | undefined>();

  useEffect(() => {
    if (bookId && book?.id !== bookId) openBook(bookId);
  }, [bookId, book?.id, openBook]);

  useEffect(() => {
    if (bookId) load(bookId);
  }, [bookId, load]);

  useEffect(() => {
    if (book && !pageId) setPageId(book.pages[0]?.id ?? null);
  }, [book, pageId]);

  useEffect(() => {
    if (pageId) visitPage(pageId);
  }, [pageId, visitPage]);

  const { trigger, popup, closePopup, previewMedia, closePreview, activeQuizId, closeQuiz } = useHotspotAction(
    (targetId) => setPageId(targetId)
  );

  const activeQuiz = book?.quizzes.find((q) => q.id === activeQuizId);

  function handleQuizComplete(result: QuizAttemptResult) {
    recordQuizResult(result.quizId, result.earnedPoints, result.totalPoints);
    if (result.passed) addStars(3);
    else addStars(1);
  }

  const page = book?.pages.find((p) => p.id === pageId);

  useEffect(() => {
    (async () => {
      if (!page?.backgroundImageId) {
        setBgUrl(undefined);
        return;
      }
      const asset = getAsset(page.backgroundImageId);
      setBgUrl(asset?.url || (await hydrateBlobUrl(page.backgroundImageId)));
    })();
  }, [page?.backgroundImageId, getAsset, hydrateBlobUrl]);

  if (!book || !page) {
    return <div className="flex h-screen items-center justify-center font-ui text-ash">جارٍ التحميل...</div>;
  }

  const pages = book.pages.slice().sort((a, b) => a.order - b.order);
  const currentIndex = pages.findIndex((p) => p.id === page.id);

  function goTo(index: number) {
    if (index >= 0 && index < pages.length) setPageId(pages[index].id);
  }

  return (
    <div className="flex h-screen flex-col bg-canvas dark:bg-ink-dark">
      <header className="flex items-center justify-between border-b border-ash/15 bg-white/80 dark:bg-ink-light/40 px-4 py-2">
        <h1 className="font-display text-base font-bold text-ink dark:text-white">{book.info.title}</h1>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 font-ui text-sm text-ink dark:text-white">
            <Star size={16} className="text-amber" /> {progress?.stars ?? 0}
          </span>
          <span className="flex items-center gap-1 font-ui text-sm text-ink dark:text-white">
            <Coins size={16} className="text-amber" /> {progress?.coins ?? 0}
          </span>
          <Button variant="ghost" size="icon" onClick={() => toggleBookmark(page.id)}>
            <Bookmark size={16} className={progress?.bookmarks.includes(page.id) ? "fill-amber text-amber" : ""} />
          </Button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center overflow-auto p-6">
        <div
          className="relative shadow-soft"
          style={{
            width: page.width,
            height: page.height,
            maxWidth: "90vw",
            maxHeight: "75vh",
            backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
            backgroundSize: "cover",
            backgroundColor: "#fff",
            transform: "scale(var(--reader-scale, 1))"
          }}
        >
          {page.hotspots.map((hotspot) => (
            <motion.button
              key={hotspot.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                trigger(hotspot);
                if (hotspot.action) addStars(1);
              }}
              title={hotspot.name}
              className={`absolute rounded-lg border-2 border-amber/70 bg-amber/15 hover:bg-amber/25 ${
                hotspot.animation ? ANIMATION_CLASS[hotspot.animation] : ""
              }`}
              style={{
                left: `${hotspot.x * 100}%`,
                top: `${hotspot.y * 100}%`,
                width: `${hotspot.width * 100}%`,
                height: `${hotspot.height * 100}%`,
                borderRadius: hotspot.shape === "circle" ? "50%" : "0.5rem"
              }}
            >
              <span className="hotspot-seal absolute -top-2 -right-2 h-4 w-4" />
            </motion.button>
          ))}
        </div>
      </main>

      <NavigationBar
        currentIndex={currentIndex}
        totalPages={pages.length}
        onPrev={() => goTo(currentIndex - 1)}
        onNext={() => goTo(currentIndex + 1)}
        onHome={() => navigate("/")}
        onToggleToc={() => setTocOpen(true)}
      />

      {tocOpen && (
        <TableOfContents
          pages={pages}
          onSelectPage={(id) => {
            setPageId(id);
            setTocOpen(false);
          }}
          onClose={() => setTocOpen(false)}
        />
      )}

      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
          <div className="max-w-md rounded-xl2 bg-canvas dark:bg-ink-light p-6 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-ink dark:text-white">{popup.title}</h3>
              <Button variant="ghost" size="icon" onClick={closePopup}>
                <X size={16} />
              </Button>
            </div>
            <p className="font-ui text-sm text-ink dark:text-white">{popup.content}</p>
          </div>
        </div>
      )}

      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm" onClick={closePreview}>
          {previewMedia.kind === "image" ? (
            <img src={previewMedia.url} className="max-h-[80vh] max-w-[90vw] rounded-xl2 shadow-soft" />
          ) : (
            <video src={previewMedia.url} controls autoPlay className="max-h-[80vh] max-w-[90vw] rounded-xl2 shadow-soft" />
          )}
        </div>
      )}
      {activeQuiz && (
        <QuizRunner quiz={activeQuiz} onClose={closeQuiz} onComplete={handleQuizComplete} />
      )}
    </div>
  );
}
