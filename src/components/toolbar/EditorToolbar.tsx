import {
  MousePointer2,
  Square,
  Circle,
  Pentagon,
  Pencil,
  ZoomIn,
  ZoomOut,
  Grid3x3,
  Undo2,
  Redo2,
  Save,
  Users,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiStore, type ActiveTool } from "@/store/uiStore";
import { useBookStore } from "@/store/bookStore";
import { cn } from "@/utils/cn";

const TOOLS: { id: ActiveTool; icon: typeof MousePointer2; label: string; implemented: boolean }[] = [
  { id: "select", icon: MousePointer2, label: "تحديد", implemented: true },
  { id: "rectangle", icon: Square, label: "مستطيل", implemented: true },
  { id: "circle", icon: Circle, label: "دائرة", implemented: true },
  { id: "polygon", icon: Pentagon, label: "مضلّع (قريباً)", implemented: false },
  { id: "freedraw", icon: Pencil, label: "رسم حر (قريباً)", implemented: false }
];

interface Props {
  activePageId: string | null;
}

export function EditorToolbar({ activePageId }: Props) {
  const { activeTool, setActiveTool, zoom, setZoom, showGrid, toggleGrid, mode, setMode } = useUiStore();
  const { save, isSaving, isDirty, undo, redo, canUndo, canRedo } = useBookStore();

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-ash/15 bg-white/70 dark:bg-ink-light/40 px-4 py-2">
      <div className="flex items-center gap-1 rounded-xl bg-canvas/80 dark:bg-ink/40 p-1">
        {TOOLS.map((tool) => (
          <Button
            key={tool.id}
            size="icon"
            variant={activeTool === tool.id ? "accent" : "ghost"}
            title={tool.label}
            disabled={!tool.implemented}
            onClick={() => setActiveTool(tool.id)}
            className={cn(!tool.implemented && "opacity-40")}
          >
            <tool.icon size={16} />
          </Button>
        ))}
      </div>

      <div className="mx-2 h-6 w-px bg-ash/20" />

      <Button
        size="icon"
        variant="ghost"
        title="تراجع"
        disabled={!activePageId || !canUndo(activePageId)}
        onClick={() => activePageId && undo(activePageId)}
      >
        <Undo2 size={16} />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        title="إعادة"
        disabled={!activePageId || !canRedo(activePageId)}
        onClick={() => activePageId && redo(activePageId)}
      >
        <Redo2 size={16} />
      </Button>

      <div className="mx-2 h-6 w-px bg-ash/20" />

      <Button size="icon" variant="ghost" title="تصغير" onClick={() => setZoom(zoom - 0.1)}>
        <ZoomOut size={16} />
      </Button>
      <span className="w-12 text-center font-ui text-sm text-ash">{Math.round(zoom * 100)}%</span>
      <Button size="icon" variant="ghost" title="تكبير" onClick={() => setZoom(zoom + 0.1)}>
        <ZoomIn size={16} />
      </Button>

      <Button
        size="icon"
        variant={showGrid ? "accent" : "ghost"}
        title="الشبكة"
        onClick={toggleGrid}
      >
        <Grid3x3 size={16} />
      </Button>

      <div className="mx-2 h-6 w-px bg-ash/20" />

      <Button
        size="sm"
        variant={mode === "teacher" ? "accent" : "outline"}
        onClick={() => setMode(mode === "teacher" ? "student" : "teacher")}
      >
        {mode === "teacher" ? <Users size={14} /> : <GraduationCap size={14} />}
        {mode === "teacher" ? "وضع المعلّم" : "معاينة الطالب"}
      </Button>

      <div className="flex-1" />

      <Button size="sm" variant={isDirty ? "accent" : "outline"} onClick={() => save()} disabled={isSaving}>
        <Save size={14} />
        {isSaving ? "جارٍ الحفظ..." : isDirty ? "حفظ التغييرات" : "محفوظ"}
      </Button>
    </div>
  );
}
