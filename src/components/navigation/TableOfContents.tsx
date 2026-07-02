import type { BookPage } from "@/types/book";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  pages: BookPage[];
  onSelectPage: (pageId: string) => void;
  onClose: () => void;
}

/** Groups pages by unit → lesson for the auto-generated table of contents. */
export function TableOfContents({ pages, onSelectPage, onClose }: Props) {
  const groups = new Map<string, Map<string, BookPage[]>>();
  for (const page of pages) {
    const unit = page.unitLabel || "بدون وحدة";
    const lesson = page.lessonLabel || "بدون درس";
    if (!groups.has(unit)) groups.set(unit, new Map());
    const lessonMap = groups.get(unit)!;
    if (!lessonMap.has(lesson)) lessonMap.set(lesson, []);
    lessonMap.get(lesson)!.push(page);
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink/40 backdrop-blur-sm">
      <div className="h-full w-80 overflow-y-auto bg-canvas dark:bg-ink-dark p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink dark:text-white">فهرس المحتويات</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        {[...groups.entries()].map(([unit, lessons]) => (
          <div key={unit} className="mb-4">
            <h3 className="mb-2 font-ui text-sm font-semibold text-palm">{unit}</h3>
            {[...lessons.entries()].map(([lesson, lessonPages]) => (
              <div key={lesson} className="mb-2 ps-3">
                <p className="mb-1 font-ui text-xs text-ash">{lesson}</p>
                {lessonPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => onSelectPage(page.id)}
                    className="block w-full rounded-lg px-2 py-1.5 text-start font-ui text-sm text-ink dark:text-white hover:bg-amber/10"
                  >
                    {page.title}
                  </button>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
