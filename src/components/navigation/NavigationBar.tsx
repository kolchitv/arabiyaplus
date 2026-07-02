import { ChevronRight, ChevronLeft, Home, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  currentIndex: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onHome: () => void;
  onToggleToc: () => void;
}

export function NavigationBar({ currentIndex, totalPages, onPrev, onNext, onHome, onToggleToc }: Props) {
  const progressPercent = totalPages > 0 ? ((currentIndex + 1) / totalPages) * 100 : 0;

  return (
    <div className="border-t border-ash/15 bg-white/90 dark:bg-ink-light/60 px-4 py-3">
      <div className="mx-auto mb-2 h-1.5 max-w-3xl overflow-hidden rounded-full bg-ash/15">
        <div
          className="h-full rounded-full bg-amber transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onHome} title="الرئيسية">
          <Home size={18} />
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleToc} title="فهرس المحتويات">
          <List size={18} />
        </Button>
        <div className="flex items-center gap-2">
          {/* RTL reading order: "next" moves right-to-left, so the chevron
              pointing right visually advances the book. */}
          <Button variant="outline" size="icon" onClick={onNext} disabled={currentIndex >= totalPages - 1}>
            <ChevronRight size={18} />
          </Button>
          <span className="min-w-16 text-center font-ui text-sm text-ash">
            {currentIndex + 1} / {totalPages}
          </span>
          <Button variant="outline" size="icon" onClick={onPrev} disabled={currentIndex <= 0}>
            <ChevronLeft size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
