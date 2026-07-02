import { motion } from "framer-motion";
import { BookOpen, Trash2, Pencil } from "lucide-react";
import type { Book } from "@/types/book";
import { Button } from "@/components/ui/button";

interface Props {
  book: Book;
  onOpen: () => void;
  onDelete: () => void;
}

/**
 * Dashboard card styled like a book spine standing on a shelf.
 * On hover it tilts slightly, echoing a page-turn — the app's
 * "flip a book off the shelf" moment.
 */
export function BookSpineCard({ book, onOpen, onDelete }: Props) {
  const pageCount = book.pages.length;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative flex flex-col overflow-hidden rounded-xl2 border border-ash/15 bg-white/80 dark:bg-ink-light/50 shadow-soft"
    >
      <button
        onClick={onOpen}
        className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-ink to-ink-light text-canvas transition-transform duration-300 group-hover:[transform:perspective(600px)_rotateY(-4deg)]"
      >
        <span className="font-classic text-2xl px-4 text-center leading-snug">{book.info.title}</span>
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="font-ui text-sm text-ash">
          {book.info.subject || "بدون مادة"} · {pageCount} صفحة
        </p>
        <p className="font-ui text-xs text-ash/70">
          آخر تعديل: {new Date(book.updatedAt).toLocaleDateString("ar")}
        </p>
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="accent" onClick={onOpen} className="flex-1">
            <Pencil size={14} /> فتح للتعديل
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <div className="absolute top-3 right-3 rounded-full bg-canvas/90 p-1.5 text-ink shadow-sm">
        <BookOpen size={14} />
      </div>
    </motion.div>
  );
}
