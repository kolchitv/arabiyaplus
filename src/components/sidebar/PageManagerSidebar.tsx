import { Plus, Copy, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import type { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import { useBookStore } from "@/store/bookStore";
import { cn } from "@/utils/cn";

interface Props {
  book: Book;
  activePageId: string | null;
  onSelect: (pageId: string) => void;
}

export function PageManagerSidebar({ book, activePageId, onSelect }: Props) {
  const { addPage, deletePage, duplicatePage, movePage } = useBookStore();

  return (
    <aside className="flex h-full w-64 flex-col border-s border-ash/15 bg-white/60 dark:bg-ink-light/30">
      <div className="flex items-center justify-between border-b border-ash/15 p-3">
        <h2 className="font-display text-sm font-bold text-ink dark:text-white">الصفحات</h2>
        <Button size="icon" variant="accent" onClick={() => addPage()} title="إضافة صفحة">
          <Plus size={14} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {book.pages
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((page, index) => (
            <div
              key={page.id}
              onClick={() => onSelect(page.id)}
              className={cn(
                "group cursor-pointer rounded-xl border p-2 transition-colors",
                page.id === activePageId
                  ? "border-amber bg-amber/10"
                  : "border-ash/15 hover:border-amber/40"
              )}
            >
              <div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg bg-canvas dark:bg-ink/40 text-xs text-ash">
                {page.backgroundImageId ? "🖼" : `صفحة ${index + 1}`}
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="truncate font-ui text-xs text-ink dark:text-white">{page.title}</span>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      movePage(page.id, "up");
                    }}
                  >
                    <ChevronUp size={12} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      movePage(page.id, "down");
                    }}
                  >
                    <ChevronDown size={12} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicatePage(page.id);
                    }}
                  >
                    <Copy size={12} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePage(page.id);
                    }}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </aside>
  );
}
