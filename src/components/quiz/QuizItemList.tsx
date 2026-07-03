import { v4 as uuid } from "uuid";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import type { Quiz, QuizKind } from "@/types/quiz";
import { QUIZ_KIND_LABELS, createQuizItem } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { QuizItemEditorRouter } from "./QuizItemEditorRouter";

interface Props {
  quiz: Quiz;
  onAddItem: (kind: QuizKind) => void;
  onUpdateItem: (itemId: string, item: Quiz["items"][number]) => void;
  onDeleteItem: (itemId: string) => void;
  onReorder: (orderedIds: string[]) => void;
}

const KIND_ORDER: QuizKind[] = [
  "multipleChoice",
  "trueFalse",
  "matching",
  "dragDrop",
  "fillBlank",
  "ordering",
  "connectItems",
  "typing",
  "audioRecording",
  "imageSelection",
  "memoryGame",
  "flipCards",
  "wordBuilder",
  "sentenceBuilder",
  "listening",
  "reading",
  "pronunciation"
];

export function QuizItemList({ quiz, onAddItem, onUpdateItem, onDeleteItem, onReorder }: Props) {
  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= quiz.items.length) return;
    const ids = quiz.items.map((i) => i.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    onReorder(ids);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="h-9 rounded-lg border border-ash/30 bg-white/70 dark:bg-ink-light/40 px-2 font-ui text-sm"
          defaultValue=""
          onChange={(e) => {
            if (!e.target.value) return;
            onAddItem(e.target.value as QuizKind);
            e.target.value = "";
          }}
        >
          <option value="" disabled>
            + إضافة سؤال جديد...
          </option>
          {KIND_ORDER.map((kind) => (
            <option key={kind} value={kind}>
              {QUIZ_KIND_LABELS[kind]}
            </option>
          ))}
        </select>
        <span className="font-ui text-xs text-ash">{quiz.items.length} سؤال</span>
      </div>

      {quiz.items.length === 0 && (
        <div className="rounded-xl2 border border-dashed border-ash/30 p-6 text-center font-ui text-sm text-ash">
          لا توجد أسئلة بعد. اختر نوع السؤال من القائمة أعلاه لإضافة أول سؤال.
        </div>
      )}

      {quiz.items.map((item, index) => (
        <div key={item.id} className="relative">
          <div className="absolute -right-2 top-4 flex flex-col gap-1">
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => move(index, -1)} disabled={index === 0}>
              <ChevronUp size={12} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 text-red-500"
              onClick={() => onDeleteItem(item.id)}
            >
              <Trash2 size={12} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => move(index, 1)}
              disabled={index === quiz.items.length - 1}
            >
              <ChevronDown size={12} />
            </Button>
          </div>
          <div className="ps-10">
            <QuizItemEditorRouter item={item} onChange={(updated) => onUpdateItem(item.id, updated)} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function newQuizItemId() {
  return uuid();
}

export { createQuizItem };
