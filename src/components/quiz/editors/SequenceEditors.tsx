import { v4 as uuid } from "uuid";
import type { OrderingItem, WordBuilderItem, SentenceBuilderItem } from "@/types/quiz";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/card";
import { RowList } from "./EditorShared";

export function OrderingEditor({ item, onChange }: { item: OrderingItem; onChange: (item: OrderingItem) => void }) {
  return (
    <div className="space-y-3">
      <Label>العناصر بالترتيب الصحيح (سيتم خلطها تلقائياً عند العرض للطالب)</Label>
      <RowList
        rows={item.items}
        addLabel="إضافة عنصر"
        minRows={2}
        makeNewRow={() => ({ id: uuid(), label: "" })}
        onChange={(items) => {
          const validIds = new Set(items.map((i) => i.id));
          onChange({ ...item, items, correctOrder: items.map((i) => i.id).filter((id) => validIds.has(id)) });
        }}
        renderRow={(row, update) => (
          <Input value={row.label} placeholder="نص العنصر" onChange={(e) => update({ label: e.target.value })} />
        )}
      />
      <p className="font-ui text-xs text-ash">الترتيب أعلاه من أعلى لأسفل هو الترتيب الصحيح.</p>
    </div>
  );
}

export function WordBuilderEditor({
  item,
  onChange
}: {
  item: WordBuilderItem;
  onChange: (item: WordBuilderItem) => void;
}) {
  return (
    <div className="space-y-3">
      <Label>الكلمة الصحيحة</Label>
      <Input
        value={item.correctWord}
        onChange={(e) => {
          const word = e.target.value;
          onChange({ ...item, correctWord: word, letters: shuffle(word.split("")) });
        }}
        placeholder="مثال: مدرسة"
      />
      <p className="font-ui text-xs text-ash">
        سيتم تقطيع الكلمة تلقائياً إلى حروف مبعثرة يجمّعها الطالب. الحروف الحالية: {item.letters.join(" ")}
      </p>
    </div>
  );
}

export function SentenceBuilderEditor({
  item,
  onChange
}: {
  item: SentenceBuilderItem;
  onChange: (item: SentenceBuilderItem) => void;
}) {
  return (
    <div className="space-y-3">
      <Label>الجملة الصحيحة (افصل الكلمات بمسافة)</Label>
      <Input
        value={item.correctSentence.join(" ")}
        onChange={(e) => {
          const words = e.target.value.split(" ").filter(Boolean);
          onChange({ ...item, correctSentence: words, words: shuffle(words) });
        }}
        placeholder="مثال: ذهب الولد إلى المدرسة"
      />
      <p className="font-ui text-xs text-ash">سيتم عرض الكلمات مبعثرة على الطالب. الكلمات الحالية: {item.words.join(" / ")}</p>
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
