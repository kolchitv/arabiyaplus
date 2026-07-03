import { useMemo, useState } from "react";
import { RotateCcw, Check } from "lucide-react";
import type { MatchingItem, DragDropItem, ConnectItemsItem, MemoryGameItem, FlipCardsItem } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function MatchingRunner({ item, onSubmit }: { item: MatchingItem; onSubmit: (r: Record<string, string>) => void }) {
  const shuffledRights = useMemo(() => shuffle(item.pairs.map((p) => ({ id: p.id, text: p.right }))), [item]);
  const [activeLeft, setActiveLeft] = useState<string | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  function chooseRight(rightId: string) {
    if (!activeLeft) return;
    setMapping((prev) => ({ ...prev, [activeLeft]: rightId }));
    setActiveLeft(null);
  }

  const allAssigned = item.pairs.every((p) => mapping[p.id]);

  return (
    <div className="space-y-4">
      <p className="font-ui text-xs text-ash">اختر عنصراً من اليمين، ثم اختر ما يطابقه من اليسار.</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {item.pairs.map((pair) => {
            const matchedText = mapping[pair.id]
              ? shuffledRights.find((r) => r.id === mapping[pair.id])?.text
              : undefined;
            return (
              <button
                key={pair.id}
                onClick={() => setActiveLeft(pair.id)}
                className={cn(
                  "block w-full rounded-xl border-2 px-3 py-2 text-start font-ui text-sm",
                  activeLeft === pair.id ? "border-amber bg-amber/10" : "border-ash/20"
                )}
              >
                <div>{pair.left}</div>
                {matchedText && <div className="mt-1 text-xs text-palm">↔ {matchedText}</div>}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {shuffledRights.map((right) => (
            <button
              key={right.id}
              onClick={() => chooseRight(right.id)}
              disabled={!activeLeft}
              className="block w-full rounded-xl border-2 border-ash/20 px-3 py-2 text-start font-ui text-sm disabled:opacity-50"
            >
              {right.text}
            </button>
          ))}
        </div>
      </div>
      <Button variant="accent" disabled={!allAssigned} onClick={() => onSubmit(mapping)}>
        تأكيد المطابقة
      </Button>
    </div>
  );
}

export function DragDropRunner({ item, onSubmit }: { item: DragDropItem; onSubmit: (r: Record<string, string>) => void }) {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const placedIds = new Set(Object.keys(mapping));

  return (
    <div className="space-y-4">
      <p className="font-ui text-xs text-ash">اسحب كل عنصر إلى الهدف المناسب (أو اضغط عليه ثم اضغط الهدف).</p>
      <div className="flex flex-wrap gap-2">
        {item.draggables
          .filter((d) => !placedIds.has(d.id))
          .map((d) => (
            <div
              key={d.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", d.id)}
              className="cursor-grab rounded-lg border-2 border-amber bg-amber/15 px-3 py-1.5 font-ui text-sm active:cursor-grabbing"
            >
              {d.label}
            </div>
          ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {item.targets.map((target) => {
          const droppedId = Object.entries(mapping).find(([, t]) => t === target.id)?.[0];
          const droppedLabel = item.draggables.find((d) => d.id === droppedId)?.label;
          return (
            <div
              key={target.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const draggableId = e.dataTransfer.getData("text/plain");
                if (draggableId) setMapping((prev) => ({ ...prev, [draggableId]: target.id }));
              }}
              className="flex min-h-16 flex-col items-center justify-center rounded-xl border-2 border-dashed border-ash/30 p-2 text-center"
            >
              <span className="font-ui text-xs text-ash">{target.label}</span>
              {droppedLabel && <span className="mt-1 rounded bg-palm/15 px-2 py-0.5 font-ui text-xs text-palm">{droppedLabel}</span>}
            </div>
          );
        })}
      </div>
      <Button variant="accent" disabled={placedIds.size < item.draggables.length} onClick={() => onSubmit(mapping)}>
        تأكيد
      </Button>
    </div>
  );
}

export function ConnectItemsRunner({
  item,
  onSubmit
}: {
  item: ConnectItemsItem;
  onSubmit: (r: { leftId: string; rightId: string }[]) => void;
}) {
  const [activeLeft, setActiveLeft] = useState<string | null>(null);
  const [connections, setConnections] = useState<{ leftId: string; rightId: string }[]>([]);

  function connect(rightId: string) {
    if (!activeLeft) return;
    setConnections((prev) => [...prev.filter((c) => c.leftId !== activeLeft), { leftId: activeLeft, rightId }]);
    setActiveLeft(null);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          {item.leftNodes.map((node) => {
            const linked = connections.find((c) => c.leftId === node.id);
            const linkedLabel = linked ? item.rightNodes.find((r) => r.id === linked.rightId)?.label : undefined;
            return (
              <button
                key={node.id}
                onClick={() => setActiveLeft(node.id)}
                className={cn(
                  "block w-full rounded-xl border-2 px-3 py-2 text-start font-ui text-sm",
                  activeLeft === node.id ? "border-amber bg-amber/10" : "border-ash/20"
                )}
              >
                <div>{node.label}</div>
                {linkedLabel && <div className="mt-1 text-xs text-palm">↔ {linkedLabel}</div>}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {item.rightNodes.map((node) => (
            <button
              key={node.id}
              onClick={() => connect(node.id)}
              disabled={!activeLeft}
              className="block w-full rounded-xl border-2 border-ash/20 px-3 py-2 text-start font-ui text-sm disabled:opacity-50"
            >
              {node.label}
            </button>
          ))}
        </div>
      </div>
      <Button variant="accent" disabled={connections.length === 0} onClick={() => onSubmit(connections)}>
        تأكيد الروابط
      </Button>
    </div>
  );
}

export function MemoryGameRunner({ item, onSubmit }: { item: MemoryGameItem; onSubmit: (r: null) => void }) {
  const cards = useMemo(() => shuffle(item.cards), [item]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  function flip(cardId: string) {
    if (busy || flipped.includes(cardId) || matched.includes(cardId)) return;
    const next = [...flipped, cardId];
    setFlipped(next);
    if (next.length === 2) {
      setBusy(true);
      const [a, b] = next;
      const cardA = cards.find((c) => c.id === a);
      const cardB = cards.find((c) => c.id === b);
      setTimeout(() => {
        if (cardA && cardB && cardA.pairId === cardB.pairId) {
          setMatched((prev) => [...prev, a, b]);
        }
        setFlipped([]);
        setBusy(false);
      }, 700);
    }
  }

  const solved = matched.length === cards.length && cards.length > 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => {
          const isVisible = flipped.includes(card.id) || matched.includes(card.id);
          return (
            <button
              key={card.id}
              onClick={() => flip(card.id)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg border-2 font-ui text-sm",
                isVisible ? "border-palm bg-palm/10" : "border-ash/20 bg-ink/5"
              )}
            >
              {isVisible ? card.text : "؟"}
            </button>
          );
        })}
      </div>
      <Button variant="accent" disabled={!solved} onClick={() => onSubmit(null)}>
        <Check size={14} /> تم إيجاد كل الأزواج
      </Button>
    </div>
  );
}

export function FlipCardsRunner({ item, onSubmit }: { item: FlipCardsItem; onSubmit: (r: null) => void }) {
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const card = item.cards[index];

  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowBack((s) => !s)}
        className="flex h-40 w-full items-center justify-center rounded-xl2 border-2 border-ash/20 bg-canvas dark:bg-ink/40 p-4 text-center font-display text-lg text-ink dark:text-white"
      >
        {showBack ? card.back : card.front}
      </button>
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => {
            setShowBack(false);
            setIndex((i) => Math.max(0, i - 1));
          }}
          disabled={index === 0}
        >
          السابقة
        </Button>
        <span className="font-ui text-xs text-ash">
          {index + 1} / {item.cards.length}
        </span>
        {index < item.cards.length - 1 ? (
          <Button
            variant="ghost"
            onClick={() => {
              setShowBack(false);
              setIndex((i) => i + 1);
            }}
          >
            التالية
          </Button>
        ) : (
          <Button variant="accent" onClick={() => onSubmit(null)}>
            <RotateCcw size={14} /> إنهاء المراجعة
          </Button>
        )}
      </div>
    </div>
  );
}
