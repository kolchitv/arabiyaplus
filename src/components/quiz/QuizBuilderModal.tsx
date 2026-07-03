import { v4 as uuid } from "uuid";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/card";
import { useBookStore } from "@/store/bookStore";
import { createQuizItem, type QuizKind } from "@/types/quiz";
import { QuizItemList } from "./QuizItemList";

interface Props {
  quizId: string | null;
  onClose: () => void;
}

export function QuizBuilderModal({ quizId, onClose }: Props) {
  const getQuiz = useBookStore((s) => s.getQuiz);
  const updateQuizMeta = useBookStore((s) => s.updateQuizMeta);
  const addQuizItem = useBookStore((s) => s.addQuizItem);
  const updateQuizItem = useBookStore((s) => s.updateQuizItem);
  const deleteQuizItem = useBookStore((s) => s.deleteQuizItem);
  const reorderQuizItems = useBookStore((s) => s.reorderQuizItems);

  const quiz = quizId ? getQuiz(quizId) : undefined;

  return (
    <Dialog open={!!quizId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        {quiz && (
          <>
            <DialogHeader>
              <DialogTitle>منشئ الاختبارات</DialogTitle>
            </DialogHeader>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <Label>عنوان الاختبار</Label>
                <Input
                  value={quiz.title}
                  onChange={(e) => updateQuizMeta(quiz.id, { title: e.target.value })}
                />
              </div>
              <div>
                <Label>نسبة النجاح المطلوبة (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={quiz.passingScorePercent}
                  onChange={(e) => updateQuizMeta(quiz.id, { passingScorePercent: Number(e.target.value) || 0 })}
                />
              </div>
            </div>

            <QuizItemList
              quiz={quiz}
              onAddItem={(kind: QuizKind) => addQuizItem(quiz.id, createQuizItem(kind, uuid()))}
              onUpdateItem={(itemId, item) => updateQuizItem(quiz.id, itemId, item)}
              onDeleteItem={(itemId) => deleteQuizItem(quiz.id, itemId)}
              onReorder={(orderedIds) => reorderQuizItems(quiz.id, orderedIds)}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
