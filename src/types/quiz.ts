/**
 * Full quiz domain types — one concrete, strongly-typed interface per quiz
 * kind (not a generic data blob), so both the builder UI and the runner
 * get real autocomplete/type-checking instead of casting through
 * Record<string, unknown>.
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
  prompt: string;
  hint?: string;
  explanation?: string;
  points: number;
}

// 1. Multiple choice — supports single or multi-answer
export interface MultipleChoiceItem extends QuizItemBase {
  kind: "multipleChoice";
  choices: { id: string; text: string; mediaId?: string }[];
  correctChoiceIds: string[];
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

// 2. True / False
export interface TrueFalseItem extends QuizItemBase {
  kind: "trueFalse";
  correctAnswer: boolean;
  feedbackCorrect: string;
  feedbackIncorrect: string;
}

// 3. Matching — each pair's left/right belong together
export interface MatchingItem extends QuizItemBase {
  kind: "matching";
  pairs: { id: string; left: string; right: string }[];
}

// 4. Drag & drop — draggable chips onto labeled drop targets
export interface DragDropItem extends QuizItemBase {
  kind: "dragDrop";
  draggables: { id: string; label: string }[];
  targets: { id: string; label: string }[];
  correctMapping: Record<string, string>; // draggableId -> targetId
}

// 5. Fill in the blank — text with {{n}} placeholders
export interface FillBlankItem extends QuizItemBase {
  kind: "fillBlank";
  textWithBlanks: string; // e.g. "الشمس {{1}} في الصباح"
  blanks: { id: string; correctAnswers: string[] }[]; // id matches {{n}} token n
}

// 6. Ordering — arrange items into the correct sequence
export interface OrderingItem extends QuizItemBase {
  kind: "ordering";
  items: { id: string; label: string }[];
  correctOrder: string[]; // ids in correct order
}

// 7. Connect items — draw lines between related nodes (many-to-many allowed)
export interface ConnectItemsItem extends QuizItemBase {
  kind: "connectItems";
  leftNodes: { id: string; label: string }[];
  rightNodes: { id: string; label: string }[];
  correctConnections: { leftId: string; rightId: string }[];
}

// 8. Typing — free text answer
export interface TypingItem extends QuizItemBase {
  kind: "typing";
  correctAnswers: string[]; // accepted answers, matched case/diacritic-insensitively
}

// 9. Audio recording — student records a response; not auto-scored
export interface AudioRecordingItem extends QuizItemBase {
  kind: "audioRecording";
  instructions: string;
}

// 10. Image selection — pick the correct image(s) from a set
export interface ImageSelectionItem extends QuizItemBase {
  kind: "imageSelection";
  images: { id: string; mediaId: string; label?: string }[];
  correctImageIds: string[];
}

// 11. Memory game — flip cards to find matching pairs
export interface MemoryGameItem extends QuizItemBase {
  kind: "memoryGame";
  cards: { id: string; pairId: string; text?: string; mediaId?: string }[];
}

// 12. Flip cards — study cards (front/back), no scoring
export interface FlipCardsItem extends QuizItemBase {
  kind: "flipCards";
  cards: { id: string; front: string; back: string }[];
}

// 13. Word builder — arrange letters into the correct word
export interface WordBuilderItem extends QuizItemBase {
  kind: "wordBuilder";
  letters: string[]; // shuffled letter tiles
  correctWord: string;
}

// 14. Sentence builder — arrange words into the correct sentence
export interface SentenceBuilderItem extends QuizItemBase {
  kind: "sentenceBuilder";
  words: string[]; // shuffled word tiles
  correctSentence: string[]; // words in correct order
}

// 15. Listening quiz — play audio, then answer multiple choice
export interface ListeningItem extends QuizItemBase {
  kind: "listening";
  audioMediaId: string;
  choices: { id: string; text: string }[];
  correctChoiceIds: string[];
}

// 16. Reading quiz — read a passage, then answer multiple choice
export interface ReadingItem extends QuizItemBase {
  kind: "reading";
  passage: string;
  choices: { id: string; text: string }[];
  correctChoiceIds: string[];
}

// 17. Pronunciation quiz — student records themselves saying target text
export interface PronunciationItem extends QuizItemBase {
  kind: "pronunciation";
  targetText: string;
  modelAudioMediaId?: string;
}

export type QuizItem =
  | MultipleChoiceItem
  | TrueFalseItem
  | MatchingItem
  | DragDropItem
  | FillBlankItem
  | OrderingItem
  | ConnectItemsItem
  | TypingItem
  | AudioRecordingItem
  | ImageSelectionItem
  | MemoryGameItem
  | FlipCardsItem
  | WordBuilderItem
  | SentenceBuilderItem
  | ListeningItem
  | ReadingItem
  | PronunciationItem;

export interface Quiz {
  id: string;
  title: string;
  items: QuizItem[];
  passingScorePercent: number;
}

export interface QuizAnswer {
  itemId: string;
  response: unknown;
  correct: boolean | null; // null = not auto-scorable (e.g. audio recording)
  pointsAwarded: number;
}

export interface QuizAttemptResult {
  quizId: string;
  answers: QuizAnswer[];
  totalPoints: number;
  earnedPoints: number;
  passed: boolean;
  completedAt: string;
}

export const QUIZ_KIND_LABELS: Record<QuizKind, string> = {
  multipleChoice: "اختيار من متعدد",
  trueFalse: "صح / خطأ",
  matching: "التوصيل والمطابقة",
  dragDrop: "السحب والإفلات",
  fillBlank: "أكمل الفراغ",
  ordering: "الترتيب",
  connectItems: "ربط العناصر",
  typing: "الكتابة",
  audioRecording: "تسجيل صوتي",
  imageSelection: "اختيار صورة",
  memoryGame: "لعبة الذاكرة",
  flipCards: "بطاقات قابلة للقلب",
  wordBuilder: "بناء الكلمة",
  sentenceBuilder: "بناء الجملة",
  listening: "اختبار استماع",
  reading: "اختبار قراءة",
  pronunciation: "اختبار نطق"
};

/** Creates a new item of the given kind with sensible placeholder content. */
export function createQuizItem(kind: QuizKind, id: string): QuizItem {
  const base = { id, prompt: "", points: 10 };
  switch (kind) {
    case "multipleChoice":
      return {
        ...base,
        kind,
        choices: [
          { id: `${id}-a`, text: "" },
          { id: `${id}-b`, text: "" }
        ],
        correctChoiceIds: [],
        feedbackCorrect: "أحسنت!",
        feedbackIncorrect: "حاول مرة أخرى."
      };
    case "trueFalse":
      return { ...base, kind, correctAnswer: true, feedbackCorrect: "أحسنت!", feedbackIncorrect: "حاول مرة أخرى." };
    case "matching":
      return { ...base, kind, pairs: [{ id: `${id}-1`, left: "", right: "" }] };
    case "dragDrop":
      return {
        ...base,
        kind,
        draggables: [{ id: `${id}-d1`, label: "" }],
        targets: [{ id: `${id}-t1`, label: "" }],
        correctMapping: {}
      };
    case "fillBlank":
      return { ...base, kind, textWithBlanks: "النص هنا {{1}}", blanks: [{ id: "1", correctAnswers: [""] }] };
    case "ordering":
      return { ...base, kind, items: [{ id: `${id}-1`, label: "" }], correctOrder: [] };
    case "connectItems":
      return { ...base, kind, leftNodes: [{ id: `${id}-l1`, label: "" }], rightNodes: [{ id: `${id}-r1`, label: "" }], correctConnections: [] };
    case "typing":
      return { ...base, kind, correctAnswers: [""] };
    case "audioRecording":
      return { ...base, kind, instructions: "" };
    case "imageSelection":
      return { ...base, kind, images: [], correctImageIds: [] };
    case "memoryGame":
      return { ...base, kind, cards: [] };
    case "flipCards":
      return { ...base, kind, cards: [{ id: `${id}-1`, front: "", back: "" }] };
    case "wordBuilder":
      return { ...base, kind, letters: [], correctWord: "" };
    case "sentenceBuilder":
      return { ...base, kind, words: [], correctSentence: [] };
    case "listening":
      return { ...base, kind, audioMediaId: "", choices: [{ id: `${id}-a`, text: "" }], correctChoiceIds: [] };
    case "reading":
      return { ...base, kind, passage: "", choices: [{ id: `${id}-a`, text: "" }], correctChoiceIds: [] };
    case "pronunciation":
      return { ...base, kind, targetText: "" };
  }
}
