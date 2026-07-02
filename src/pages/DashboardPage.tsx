import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Upload, Moon, Sun, Settings, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookSpineCard } from "@/components/dashboard/BookSpineCard";
import { useBookStore } from "@/store/bookStore";
import { useUiStore } from "@/store/uiStore";
import { importImagesAsPages, isPdfFile } from "@/services/importService";
import { saveBook } from "@/services/db";
import { createEmptyBook } from "@/store/bookStore";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { recentBooks, refreshRecentBooks, removeBook } = useBookStore();
  const { darkMode, toggleDarkMode } = useUiStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    refreshRecentBooks();
  }, [refreshRecentBooks]);

  async function handleImportFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setImportError(null);
    const files = Array.from(fileList);

    if (files.some(isPdfFile)) {
      setImportError("استيراد PDF متاح في المرحلة القادمة — جرّب صور PNG/JPG/WEBP الآن.");
      return;
    }

    const book = createEmptyBook({ title: files[0].name.replace(/\.[^/.]+$/, "") });
    const pages = await importImagesAsPages(files, book);
    book.pages = pages.length > 0 ? pages : book.pages;
    await saveBook(book);
    await refreshRecentBooks();
    navigate(`/editor/${book.id}`);
  }

  return (
    <div className="min-h-screen bg-canvas dark:bg-ink-dark px-6 py-8 md:px-12">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl2 bg-ink p-2.5 text-amber shadow-soft">
            <BookOpen size={22} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink dark:text-white">
              ArabiaEasy
            </h1>
            <p className="font-ui text-sm text-ash">بانِي الكتب التفاعلية</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="تبديل المظهر">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="الإعدادات">
            <Settings size={18} />
          </Button>
        </div>
      </header>

      <section className="mb-10 flex flex-wrap gap-3">
        <Button size="lg" onClick={() => navigate("/book-info")}>
          <Plus size={18} /> كتاب جديد
        </Button>
        <Button size="lg" variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload size={18} /> استيراد (PDF / صور)
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleImportFiles(e.target.files)}
        />
      </section>

      {importError && (
        <div className="mb-6 rounded-xl border border-amber/40 bg-amber/10 px-4 py-3 font-ui text-sm text-ink dark:text-white">
          {importError}
        </div>
      )}

      <section>
        <h2 className="mb-4 font-display text-lg font-bold text-ink dark:text-white">
          المشاريع الأخيرة
        </h2>
        {recentBooks.length === 0 ? (
          <div className="rounded-xl2 border border-dashed border-ash/30 p-10 text-center font-ui text-ash">
            لا توجد كتب حتى الآن. ابدأ بإنشاء كتاب جديد أو استيراد ملف.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recentBooks.map((book) => (
              <BookSpineCard
                key={book.id}
                book={book}
                onOpen={() => navigate(`/editor/${book.id}`)}
                onDelete={() => removeBook(book.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
