import type { QuizItem } from "@/types/quiz";
import { QUIZ_KIND_LABELS } from "@/types/quiz";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/card";
import {
  MultipleChoiceEditor,
  TrueFalseEditor,
  ImageSelectionEditor,
  ListeningEditor,
  ReadingEditor
} from "@/components/quiz/editors/ChoiceEditors";
import {
  OrderingEditor,
  WordBuilderEditor,
  SentenceBuilderEditor
} from "@/components/quiz/editors/SequenceEditors";
import {
  MatchingEditor,
  DragDropEditor,
  ConnectItemsEditor,
  MemoryGameEditor,
  FlipCardsEditor
} from "@/components/quiz/editors/PairEditors";
import {
  FillBlankEditor,
  TypingEditor,
  AudioRecordingEditor,
  PronunciationEditor
} from "@/components/quiz/editors/OpenResponseEditors";

interface Props {
  item: QuizItem;
  onChange: (item: QuizItem) => void;
}

/** Renders the kind-specific body for a quiz item, cast per-branch so each
 *  editor gets its own concrete item type instead of the full union. */
function KindSpecificEditor({ item, onChange }: Props) {
  switch (item.kind) {
    case "multipleChoice":
      return <MultipleChoiceEditor item={item} onChange={onChange} />;
    case "trueFalse":
      return <TrueFalseEditor item={item} onChange={onChange} />;
    case "imageSelection":
      return <ImageSelectionEditor item={item} onChange={onChange} />;
    case "listening":
      return <ListeningEditor item={item} onChange={onChange} />;
    case "reading":
      return <ReadingEditor item={item} onChange={onChange} />;
    case "ordering":
      return <OrderingEditor item={item} onChange={onChange} />;
    case "wordBuilder":
      return <WordBuilderEditor item={item} onChange={onChange} />;
    case "sentenceBuilder":
      return <SentenceBuilderEditor item={item} onChange={onChange} />;
    case "matching":
      return <MatchingEditor item={item} onChange={onChange} />;
    case "dragDrop":
      return <DragDropEditor item={item} onChange={onChange} />;
    case "connectItems":
      return <ConnectItemsEditor item={item} onChange={onChange} />;
    case "memoryGame":
      return <MemoryGameEditor item={item} onChange={onChange} />;
    case "flipCards":
      return <FlipCardsEditor item={item} onChange={onChange} />;
    case "fillBlank":
      return <FillBlankEditor item={item} onChange={onChange} />;
    case "typing":
      return <TypingEditor item={item} onChange={onChange} />;
    case "audioRecording":
      return <AudioRecordingEditor item={item} onChange={onChange} />;
    case "pronunciation":
      return <PronunciationEditor item={item} onChange={onChange} />;
  }
}

export function QuizItemEditorRouter({ item, onChange }: Props) {
  return (
    <div className="space-y-4 rounded-xl2 border border-ash/15 bg-white/60 dark:bg-ink-light/30 p-4">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-palm/10 px-3 py-1 font-ui text-xs font-semibold text-palm">
          {QUIZ_KIND_LABELS[item.kind]}
        </span>
        <div className="flex items-center gap-2">
          <Label className="mb-0">النقاط</Label>
          <Input
            type="number"
            className="w-20"
            value={item.points}
            onChange={(e) => onChange({ ...item, points: Number(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div>
        <Label>السؤال / التعليمات</Label>
        <Textarea rows={2} value={item.prompt} onChange={(e) => onChange({ ...item, prompt: e.target.value })} />
      </div>

      <KindSpecificEditor item={item} onChange={onChange} />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>تلميح (اختياري)</Label>
          <Input value={item.hint ?? ""} onChange={(e) => onChange({ ...item, hint: e.target.value })} />
        </div>
        <div>
          <Label>توضيح إضافي (اختياري)</Label>
          <Input value={item.explanation ?? ""} onChange={(e) => onChange({ ...item, explanation: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
