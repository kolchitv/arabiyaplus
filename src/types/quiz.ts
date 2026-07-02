/**
 * Quiz domain types. Phase 1 fully implements the shared shell
 * (Quiz, QuizResult, scoring, feedback) plus the MultipleChoice and
 * TrueFalse item types end-to-end in the UI. The remaining item kinds
 * are modeled here now so later phases can add renderers without
 * touching the schema or the save/export pipeline again.
 */

export type QuizKind =
  | "multipleChoice"
  | "trueFalse"
  | "matching"
  | "dragDrop"
  | "fillBlank"
  | "ordering"
  | "connectItems"
  | "typing"
  | "audioRecording"
  | "imageSelection"
  | "memoryGame"
  | "flipCards"
  | "wordBuilder"
  | "sentenceBuilder"
  | "listening"
  | "reading"
  | "pronunciation";

export interface QuizItemBase {
  id: string;
  kind: QuizKind;
  prompt: string;
  hint?: string;
  explanation?: string;
  points: number;
}

export interface MultipleChoiceItem extends QuizItemBase {
  kind: "multipleChoice";
  choices: { id: string; text: string; mediaId?: string }[];
  correctChoiceIds: string[]; // supports single or multi-answer
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

export interface TrueFalseItem extends QuizItemBase {
  kind: "trueFalse";
  correctAnswer: boolean;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

/** Generic placeholder shape for item kinds not yet fully implemented in the UI. */
export interface GenericQuizItem extends QuizItemBase {
  kind: Exclude<QuizKind, "multipleChoice" | "trueFalse">;
  data: Record<string, unknown>;
}

export type QuizItem = MultipleChoiceItem | TrueFalseItem | GenericQuizItem;

export interface Quiz {
  id: string;
  title: string;
  items: QuizItem[];
  passingScorePercent: number;
}

export interface QuizAnswer {
  itemId: string;
  response: unknown;
  correct: boolean;
  pointsAwarded: number;
}

export interface QuizAttemptResult {
  quizId: string;
  answers: QuizAnswer[];
  totalPoints: number;
  earnedPoints: number;
  completedAt: string;
}
