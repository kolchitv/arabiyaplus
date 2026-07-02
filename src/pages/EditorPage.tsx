import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, Eye } from "lucide-react";
import { useBookStore } from "@/store/bookStore";
import { useUiStore } from "@/store/uiStore";
import { EditorToolbar } from "@/components/toolbar/EditorToolbar";
import { PageManagerSidebar } from "@/components/sidebar/PageManagerSidebar";
import { PageCanvas } from "@/components/editor/PageCanvas";
import { HotspotPropertiesPanel } from "@/components/properties/HotspotPropertiesPanel";
import { Button } from "@/components/ui/button";

export default function EditorPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { book, activePageId, setActivePage, openBook } = useBookStore();
  const selectedHotspotId = useUiStore((s) => s.selectedHotspotId);

  useEffect(() => {
    if (bookId && book?.id !== bookId) {
      openBook(bookId);
    }
  }, [bookId, book?.id, openBook]);

  if (!book) {
    return (
      <div className="flex h-screen items-center justify-center font-ui text-ash">
        جارٍ تحميل الكتاب...
      </div>
    );
  }

  const activePage = book.pages.find((p) => p.id === activePageId) ?? book.pages[0];

  return (
    <div className="flex h-screen flex-col bg-canvas dark:bg-ink-dark">
      <div className="flex items-center justify-between border-b border-ash/15 bg-white/80 dark:bg-ink-light/40 px-4 py-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowRight size={16} /> الرئيسية
          </Button>
          <h1 className="font-display text-base font-bold text-ink dark:text-white">
            {book.info.title}
          </h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(`/read/${book.id}`)}>
          <Eye size={14} /> معاينة القراءة
        </Button>
      </div>

      <EditorToolbar activePageId={activePage?.id ?? null} />

      <div className="flex flex-1 overflow-hidden" dir="rtl">
        <PageManagerSidebar book={book} activePageId={activePage?.id ?? null} onSelect={setActivePage} />

        <main className="flex flex-1 items-start justify-center overflow-auto p-8">
          {activePage ? (
            <PageCanvas page={activePage} />
          ) : (
            <p className="font-ui text-ash">لا توجد صفحات. أضف صفحة من الشريط الجانبي.</p>
          )}
        </main>

        {activePage && selectedHotspotId && (
          <HotspotPropertiesPanel
            page={activePage}
            hotspotId={selectedHotspotId}
            allPages={book.pages}
          />
        )}
      </div>
    </div>
  );
}
