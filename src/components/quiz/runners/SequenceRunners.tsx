import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { OrderingItem, WordBuilderItem, SentenceBuilderItem } from "@/types/quiz";
import { Button } from "@/components/ui/button";

export function OrderingRunner({ item, onSubmit }: { item: OrderingItem; onSubmit: (r: string[]) => void }) {
  const [order, setOrder] = useState(() => shuffle(item.items.map((i) => i.id)));
  const byId = new Map(item.items.map((i) => [i.id, i.label]));

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {order.map((id, index) => (
          <div key={id} className="flex items-center gap-2 rounded-xl border-2 border-ash/20 px-4 py-2">
            <span className="flex-1 font-ui text-sm">{byId.get(id)}</span>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => move(index, -1)}>
              <ChevronUp size={14} />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => move(index, 1)}>
              <ChevronDown size={14} />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="accent" onClick={() => onSubmit(order)}>
        تأكيد الترتيب
      </Button>
    </div>
  );
}

export function WordBuilderRunner({ item, onSubmit }: { item: WordBuilderItem; onSubmit: (r: string) => void }) {
  const [selected, setSelected] = useState<number[]>([]);
  const word = selected.map((i) => item.letters[i]).join("");

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-canvas dark:bg-ink/40 p-4 text-center font-display text-2xl tracking-widest text-ink dark:text-white">
        {word || "—"}
      </div>
      <div className="flex flex-wrap gap-2">
        {item.letters.map((letter, index) => (
          <Button
            key={index}
            size="sm"
            variant={selected.includes(index) ? "accent" : "outline"}
            onClick={() =>
              setSelected((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
            }
          >
            {letter}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => setSelected([])}>
          مسح
        </Button>
        <Button variant="accent" disabled={selected.length === 0} onClick={() => onSubmit(word)}>
          تأكيد الكلمة
        </Button>
      </div>
    </div>
  );
}

export function SentenceBuilderRunner({
  item,
  onSubmit
}: {
  item: SentenceBuilderItem;
  onSubmit: (r: string[]) => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const sentence = selected.map((i) => item.words[i]);

  return (
    <div className="space-y-4">
      <div className="min-h-12 rounded-xl bg-canvas dark:bg-ink/40 p-4 text-center font-body text-lg text-ink dark:text-white">
        {sentence.join(" ") || "—"}
      </div>
      <div className="flex flex-wrap gap-2">
        {item.words.map((wordTile, index) => (
          <Button
            key={index}
            size="sm"
            variant={selected.includes(index) ? "accent" : "outline"}
            onClick={() =>
              setSelected((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
            }
          >
            {wordTile}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => setSelected([])}>
          مسح
        </Button>
        <Button variant="accent" disabled={selected.length === 0} onClick={() => onSubmit(sentence)}>
          تأكيد الجملة
        </Button>
      </div>
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
