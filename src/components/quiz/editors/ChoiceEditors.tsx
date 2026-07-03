import { v4 as uuid } from "uuid";
import type {
  MultipleChoiceItem,
  TrueFalseItem,
  ImageSelectionItem,
  ListeningItem,
  ReadingItem
} from "@/types/quiz";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RowList } from "./EditorShared";
import { useMediaStore } from "@/store/mediaStore";
import { useRef } from "react";

export function MultipleChoiceEditor({
  item,
  onChange
}: {
  item: MultipleChoiceItem;
  onChange: (item: MultipleChoiceItem) => void;
}) {
  return (
    <div className="space-y-3">
      <Label>الخيارات (فعّل المربع بجانب الإجابة الصحيحة)</Label>
      <RowList
        rows={item.choices}
        addLabel="إضافة خيار"
        minRows={2}
        makeNewRow={() => ({ id: uuid(), text: "" })}
        onChange={(choices) => {
          const validIds = new Set(choices.map((c) => c.id));
          onChange({ ...item, choices, correctChoiceIds: item.correctChoiceIds.filter((id) => validIds.has(id)) });
        }}
        renderRow={(choice, update) => (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.correctChoiceIds.includes(choice.id)}
              onChange={(e) => {
                const correctChoiceIds = e.target.checked
                  ? [...item.correctChoiceIds, choice.id]
                  : item.correctChoiceIds.filter((id) => id !== choice.id);
                onChange({ ...item, correctChoiceIds });
              }}
              className="h-4 w-4 accent-amber"
            />
            <Input value={choice.text} placeholder="نص الخيار" onChange={(e) => update({ text: e.target.value })} />
          </div>
        )}
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>عند الإجابة الصحيحة</Label>
          <Input value={item.feedbackCorrect} onChange={(e) => onChange({ ...item, feedbackCorrect: e.target.value })} />
        </div>
        <div>
          <Label>عند الإجابة الخاطئة</Label>
          <Input value={item.feedbackIncorrect} onChange={(e) => onChange({ ...item, feedbackIncorrect: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

export function TrueFalseEditor({ item, onChange }: { item: TrueFalseItem; onChange: (item: TrueFalseItem) => void }) {
  return (
    <div className="space-y-3">
      <Label>الإجابة الصحيحة</Label>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={item.correctAnswer ? "accent" : "outline"}
          onClick={() => onChange({ ...item, correctAnswer: true })}
        >
          صح
        </Button>
        <Button
          size="sm"
          variant={!item.correctAnswer ? "accent" : "outline"}
          onClick={() => onChange({ ...item, correctAnswer: false })}
        >
          خطأ
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>عند الإجابة الصحيحة</Label>
          <Input value={item.feedbackCorrect} onChange={(e) => onChange({ ...item, feedbackCorrect: e.target.value })} />
        </div>
        <div>
          <Label>عند الإجابة الخاطئة</Label>
          <Input value={item.feedbackIncorrect} onChange={(e) => onChange({ ...item, feedbackIncorrect: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

export function ImageSelectionEditor({
  item,
  onChange
}: {
  item: ImageSelectionItem;
  onChange: (item: ImageSelectionItem) => void;
}) {
  const addFile = useMediaStore((s) => s.addFile);
  const getAsset = useMediaStore((s) => s.getAsset);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function addImage(file: File) {
    const asset = await addFile(file, "images");
    onChange({ ...item, images: [...item.images, { id: uuid(), mediaId: asset.id }] });
  }

  return (
    <div className="space-y-3">
      <Label>الصور (اضغط على الصورة الصحيحة لتحديدها)</Label>
      <div className="grid grid-cols-3 gap-2">
        {item.images.map((img) => {
          const asset = getAsset(img.mediaId);
          const isCorrect = item.correctImageIds.includes(img.id);
          return (
            <button
              key={img.id}
              onClick={() =>
                onChange({
                  ...item,
                  correctImageIds: isCorrect
                    ? item.correctImageIds.filter((id) => id !== img.id)
                    : [...item.correctImageIds, img.id]
                })
              }
              className={`aspect-square overflow-hidden rounded-lg border-2 ${
                isCorrect ? "border-palm" : "border-ash/20"
              }`}
            >
              {asset?.url && <img src={asset.url} className="h-full w-full object-cover" />}
            </button>
          );
        })}
      </div>
      <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
        إضافة صورة
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && addImage(e.target.files[0])}
      />
    </div>
  );
}

function ChoicesWithCorrect({
  choices,
  correctChoiceIds,
  onChoicesChange,
  onCorrectChange
}: {
  choices: { id: string; text: string }[];
  correctChoiceIds: string[];
  onChoicesChange: (choices: { id: string; text: string }[]) => void;
  onCorrectChange: (ids: string[]) => void;
}) {
  return (
    <RowList
      rows={choices}
      addLabel="إضافة خيار"
      minRows={2}
      makeNewRow={() => ({ id: uuid(), text: "" })}
      onChange={onChoicesChange}
      renderRow={(choice, update) => (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={correctChoiceIds.includes(choice.id)}
            onChange={(e) =>
              onCorrectChange(
                e.target.checked ? [...correctChoiceIds, choice.id] : correctChoiceIds.filter((id) => id !== choice.id)
              )
            }
            className="h-4 w-4 accent-amber"
          />
          <Input value={choice.text} placeholder="نص الخيار" onChange={(e) => update({ text: e.target.value })} />
        </div>
      )}
    />
  );
}

export function ListeningEditor({ item, onChange }: { item: ListeningItem; onChange: (item: ListeningItem) => void }) {
  const addFile = useMediaStore((s) => s.addFile);
  const getAsset = useMediaStore((s) => s.getAsset);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const asset = item.audioMediaId ? getAsset(item.audioMediaId) : undefined;

  return (
    <div className="space-y-3">
      <Label>الملف الصوتي</Label>
      {asset ? (
        <audio controls src={asset.url} className="w-full" />
      ) : (
        <p className="font-ui text-xs text-ash">لم يتم اختيار ملف صوتي بعد</p>
      )}
      <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
        {asset ? "استبدال الصوت" : "رفع صوت"}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const newAsset = await addFile(file, "audio");
          onChange({ ...item, audioMediaId: newAsset.id });
        }}
      />

      <Label>خيارات الإجابة</Label>
      <ChoicesWithCorrect
        choices={item.choices}
        correctChoiceIds={item.correctChoiceIds}
        onChoicesChange={(choices) => onChange({ ...item, choices })}
        onCorrectChange={(correctChoiceIds) => onChange({ ...item, correctChoiceIds })}
      />
    </div>
  );
}

export function ReadingEditor({ item, onChange }: { item: ReadingItem; onChange: (item: ReadingItem) => void }) {
  return (
    <div className="space-y-3">
      <Label>نص القراءة</Label>
      <Textarea rows={5} value={item.passage} onChange={(e) => onChange({ ...item, passage: e.target.value })} />
      <Label>خيارات الإجابة</Label>
      <ChoicesWithCorrect
        choices={item.choices}
        correctChoiceIds={item.correctChoiceIds}
        onChoicesChange={(choices) => onChange({ ...item, choices })}
        onCorrectChange={(correctChoiceIds) => onChange({ ...item, correctChoiceIds })}
      />
    </div>
  );
}
