import { useRef } from "react";
import type { FillBlankItem, TypingItem, AudioRecordingItem, PronunciationItem } from "@/types/quiz";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMediaStore } from "@/store/mediaStore";

export function FillBlankEditor({ item, onChange }: { item: FillBlankItem; onChange: (item: FillBlankItem) => void }) {
  return (
    <div className="space-y-3">
      <Label>النص مع الفراغات — استخدم {"{{1}}"}، {"{{2}}"} وهكذا لتحديد مواضع الفراغات</Label>
      <Textarea
        rows={3}
        value={item.textWithBlanks}
        onChange={(e) => {
          const text = e.target.value;
          const tokens = [...text.matchAll(/\{\{(\d+)\}\}/g)].map((m) => m[1]);
          const uniqueTokens = [...new Set(tokens)];
          const blanks = uniqueTokens.map((id) => item.blanks.find((b) => b.id === id) ?? { id, correctAnswers: [""] });
          onChange({ ...item, textWithBlanks: text, blanks });
        }}
      />
      {item.blanks.map((blank) => (
        <div key={blank.id}>
          <Label>الإجابات المقبولة للفراغ {blank.id} (افصل بفاصلة للإجابات البديلة)</Label>
          <Input
            value={blank.correctAnswers.join(", ")}
            onChange={(e) =>
              onChange({
                ...item,
                blanks: item.blanks.map((b) =>
                  b.id === blank.id ? { ...b, correctAnswers: e.target.value.split(",").map((s) => s.trim()) } : b
                )
              })
            }
          />
        </div>
      ))}
    </div>
  );
}

export function TypingEditor({ item, onChange }: { item: TypingItem; onChange: (item: TypingItem) => void }) {
  return (
    <div className="space-y-2">
      <Label>الإجابات المقبولة (افصل بفاصلة للإجابات البديلة)</Label>
      <Input
        value={item.correctAnswers.join(", ")}
        onChange={(e) => onChange({ ...item, correctAnswers: e.target.value.split(",").map((s) => s.trim()) })}
      />
    </div>
  );
}

export function AudioRecordingEditor({
  item,
  onChange
}: {
  item: AudioRecordingItem;
  onChange: (item: AudioRecordingItem) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>تعليمات التسجيل الظاهرة للطالب</Label>
      <Textarea
        rows={2}
        value={item.instructions}
        onChange={(e) => onChange({ ...item, instructions: e.target.value })}
        placeholder="مثال: سجّل نفسك وأنت تقرأ الجملة التالية بصوت واضح"
      />
      <p className="font-ui text-xs text-ash">هذا النوع لا يُصحَّح تلقائياً — يراجعه المعلّم يدوياً.</p>
    </div>
  );
}

export function PronunciationEditor({
  item,
  onChange
}: {
  item: PronunciationItem;
  onChange: (item: PronunciationItem) => void;
}) {
  const addFile = useMediaStore((s) => s.addFile);
  const getAsset = useMediaStore((s) => s.getAsset);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelAsset = item.modelAudioMediaId ? getAsset(item.modelAudioMediaId) : undefined;

  return (
    <div className="space-y-2">
      <Label>النص المستهدف للنطق</Label>
      <Input value={item.targetText} onChange={(e) => onChange({ ...item, targetText: e.target.value })} />

      <Label>صوت نموذجي (اختياري)</Label>
      {modelAsset && <audio controls src={modelAsset.url} className="w-full" />}
      <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
        {modelAsset ? "استبدال الصوت النموذجي" : "رفع صوت نموذجي"}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const asset = await addFile(file, "audio");
          onChange({ ...item, modelAudioMediaId: asset.id });
        }}
      />
      <p className="font-ui text-xs text-ash">هذا النوع لا يُصحَّح تلقائياً — يراجعه المعلّم يدوياً.</p>
    </div>
  );
}
