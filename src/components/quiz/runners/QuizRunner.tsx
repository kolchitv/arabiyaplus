import { useState } from "react";
import { X, Lightbulb } from "lucide-react";
import type { Quiz, QuizAnswer, QuizAttemptResult } from "@/types/quiz";
import { scoreQuizItem } from "@/utils/quizScoring";
import { Button } from "@/components/ui/button";
import {
  MultipleChoiceRunner,
  TrueFalseRunner,
  ImageSelectionRunner,
  ListeningRunner,
  ReadingRunner
} from "./ChoiceRunners";
import { OrderingRunner, WordBuilderRunner, SentenceBuilderRunner } from "./SequenceRunners";
import {
  MatchingRunner,
  DragDropRunner,
  ConnectItemsRunner,
  MemoryGameRunner,
  FlipCardsRunner
} from "./PairRunners";
import {
  FillBlankRunner,
  TypingRunner,
  AudioRecordingRunner,
  PronunciationRunner
} from "./OpenResponseRunners";

interface Props {
  quiz: Quiz;
  onClose: () => void;
  onComplete: (result: QuizAttemptResult) => void;
}

/** Dispatches the current item to its kind-specific play UI. */
function ItemRunner({ item, onAnswer }: { item: Quiz["items"][number]; onAnswer: (response: unknown) => void }) {
  switch (item.kind) {
    case "multipleChoice":
      return <MultipleChoiceRunner item={item} onSubmit={onAnswer} />;
    case "trueFalse":
      return <TrueFalseRunner item={item} onSubmit={onAnswer} />;
    case "imageSelection":
      return <ImageSelectionRunner item={item} onSubmit={onAnswer} />;
    case "listening":
      return <ListeningRunner item={item} onSubmit={onAnswer} />;
    case "reading":
      return <ReadingRunner item={item} onSubmit={onAnswer} />;
    case "ordering":
      return <OrderingRunner item={item} onSubmit={onAnswer} />;
    case "wordBuilder":
      return <WordBuilderRunner item={item} onSubmit={onAnswer} />;
    case "sentenceBuilder":
      return <SentenceBuilderRunner item={item} onSubmit={onAnswer} />;
    case "matching":
      return <MatchingRunner item={item} onSubmit={onAnswer} />;
    case "dragDrop":
      return <DragDropRunner item={item} onSubmit={onAnswer} />;
    case "connectItems":
      return <ConnectItemsRunner item={item} onSubmit={onAnswer} />;
    case "memoryGame":
      return <MemoryGameRunner item={item} onSubmit={onAnswer} />;
    case "flipCards":
      return <FlipCardsRunner item={item} onSubmit={onAnswer} />;
    case "fillBlank":
      return <FillBlankRunner item={item} onSubmit={onAnswer} />;
    case "typing":
      return <TypingRunner item={item} onSubmit={onAnswer} />;
    case "audioRecording":
      return <AudioRecordingRunner item={item} onSubmit={onAnswer} />;
    case "pronunciation":
      return <PronunciationRunner item={item} onSubmit={onAnswer} />;
  }
}

function getFeedbackMessage(item: Quiz["items"][number], answer: QuizAnswer): string {
  if (answer.correct === null) return "تم إرسال إجابتك للمراجعة.";
  if ((item.kind === "multipleChoice" || item.kind === "trueFalse")) {
    return answer.correct ? item.feedbackCorrect : item.feedbackIncorrect;
  }
  return answer.correct ? "أحسنت!" : "إجابة غير صحيحة، حاول مرة أخرى.";
}

export function QuizRunner({ quiz, onClose, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [lastAnswer, setLastAnswer] = useState<QuizAnswer | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);

  const item = quiz.items[index];
  const totalPoints = quiz.items.reduce((sum, i) => sum + i.points, 0);

  function handleAnswer(response: unknown) {
    const result = scoreQuizItem(item, response);
    setLastAnswer(result);
  }

  function goNext() {
    if (!lastAnswer) return;
    const nextAnswers = [...answers, lastAnswer];
    setAnswers(nextAnswers);
    setLastAnswer(null);
    setShowHint(false);

    if (index < quiz.items.length - 1) {
      setIndex(index + 1);
    } else {
      const earnedPoints = nextAnswers.reduce((sum, a) => sum + a.pointsAwarded, 0);
      const passed = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 >= quiz.passingScorePercent : true;
      setFinished(true);
      onComplete({
        quizId: quiz.id,
        answers: nextAnswers,
        totalPoints,
        earnedPoints,
        passed,
        completedAt: new Date().toISOString()
      });
    }
  }

  if (quiz.items.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm">
        <div className="max-w-sm rounded-xl2 bg-canvas dark:bg-ink-light p-6 text-center shadow-soft">
          <p className="font-ui text-sm text-ash">هذا الاختبار لا يحتوي على أسئلة بعد.</p>
          <Button className="mt-4" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </div>
    );
  }

  if (finished) {
    const earnedPoints = answers.reduce((sum, a) => sum + a.pointsAwarded, 0);
    const percent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 100;
    const passed = percent >= quiz.passingScorePercent;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm">
        <div className="max-w-sm rounded-xl2 bg-canvas dark:bg-ink-light p-6 text-center shadow-soft">
          <h3 className="font-display text-xl font-bold text-ink dark:text-white">{quiz.title}</h3>
          <p className="mt-2 font-display text-4xl font-extrabold text-amber">{percent}%</p>
          <p className="mt-1 font-ui text-sm text-ash">
            {earnedPoints} / {totalPoints} نقطة — {passed ? "ناجح 🎉" : "حاول مرة أخرى"}
          </p>
          <Button className="mt-4 w-full" variant="accent" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl2 bg-canvas dark:bg-ink-light p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-ui text-xs text-ash">
            سؤال {index + 1} / {quiz.items.length}
          </span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        <h3 className="mb-4 font-display text-lg font-bold text-ink dark:text-white">{item.prompt}</h3>

        {!lastAnswer && <ItemRunner item={item} onAnswer={handleAnswer} />}

        {item.hint && !lastAnswer && (
          <button
            onClick={() => setShowHint((s) => !s)}
            className="mt-3 flex items-center gap-1 font-ui text-xs text-ash hover:text-amber"
          >
            <Lightbulb size={13} /> تلميح
          </button>
        )}
        {showHint && !lastAnswer && <p className="mt-1 font-ui text-xs text-ash">{item.hint}</p>}

        {lastAnswer && (
          <div className="space-y-3">
            <div
              className={`rounded-xl border-2 p-3 font-ui text-sm ${
                lastAnswer.correct === false
                  ? "border-red-400 bg-red-50 text-red-700"
                  : "border-palm bg-palm/10 text-palm"
              }`}
            >
              {getFeedbackMessage(item, lastAnswer)}
            </div>
            {item.explanation && <p className="font-ui text-xs text-ash">{item.explanation}</p>}
            <Button variant="accent" className="w-full" onClick={goNext}>
              {index < quiz.items.length - 1 ? "السؤال التالي" : "إنهاء الاختبار"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
