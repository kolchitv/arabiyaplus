import { v4 as uuid } from "uuid";
import { useRef } from "react";
import type { MatchingItem, DragDropItem, ConnectItemsItem, MemoryGameItem, FlipCardsItem } from "@/types/quiz";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RowList } from "./EditorShared";
import { useMediaStore } from "@/store/mediaStore";

export function MatchingEditor({ item, onChange }: { item: MatchingItem; onChange: (item: MatchingItem) => void }) {
  return (
    <div className="space-y-3">
      <Label>الأزواج المتطابقة (يمين ↔ يسار)</Label>
      <RowList
        rows={item.pairs}
        addLabel="إضافة زوج"
        minRows={2}
        makeNewRow={() => ({ id: uuid(), left: "", right: "" })}
        onChange={(pairs) => onChange({ ...item, pairs })}
        renderRow={(pair, update) => (
          <div className="grid grid-cols-2 gap-2">
            <Input value={pair.left} placeholder="العنصر الأول" onChange={(e) => update({ left: e.target.value })} />
            <Input value={pair.right} placeholder="يطابقه" onChange={(e) => update({ right: e.target.value })} />
          </div>
        )}
      />
    </div>
  );
}

export function DragDropEditor({ item, onChange }: { item: DragDropItem; onChange: (item: DragDropItem) => void }) {
  return (
    <div className="space-y-3">
      <Label>العناصر القابلة للسحب</Label>
      <RowList
        rows={item.draggables}
        addLabel="إضافة عنصر"
        minRows={1}
        makeNewRow={() => ({ id: uuid(), label: "" })}
        onChange={(draggables) => onChange({ ...item, draggables })}
        renderRow={(row, update) => (
          <Input value={row.label} placeholder="نص العنصر" onChange={(e) => update({ label: e.target.value })} />
        )}
      />
      <Label>مناطق الإفلات (الأهداف)</Label>
      <RowList
        rows={item.targets}
        addLabel="إضافة هدف"
        minRows={1}
        makeNewRow={() => ({ id: uuid(), label: "" })}
        onChange={(targets) => onChange({ ...item, targets })}
        renderRow={(row, update) => (
          <Input value={row.label} placeholder="نص الهدف" onChange={(e) => update({ label: e.target.value })} />
        )}
      />
      <Label>الإجابة الصحيحة (اختر الهدف الصحيح لكل عنصر)</Label>
      <div className="space-y-2">
        {item.draggables.map((d) => (
          <div key={d.id} className="flex items-center gap-2">
            <span className="w-24 truncate font-ui text-sm text-ink dark:text-white">{d.label || "—"}</span>
            <select
              className="h-9 flex-1 rounded-lg border border-ash/30 bg-white/70 dark:bg-ink-light/40 px-2 text-sm font-ui"
              value={item.correctMapping[d.id] ?? ""}
              onChange={(e) => onChange({ ...item, correctMapping: { ...item.correctMapping, [d.id]: e.target.value } })}
            >
              <option value="" disabled>
                اختر الهدف
              </option>
              {item.targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label || "—"}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConnectItemsEditor({
  item,
  onChange
}: {
  item: ConnectItemsItem;
  onChange: (item: ConnectItemsItem) => void;
}) {
  function toggleConnection(leftId: string, rightId: string) {
    const exists = item.correctConnections.some((c) => c.leftId === leftId && c.rightId === rightId);
    const correctConnections = exists
      ? item.correctConnections.filter((c) => !(c.leftId === leftId && c.rightId === rightId))
      : [...item.correctConnections, { leftId, rightId }];
    onChange({ ...item, correctConnections });
  }

  return (
    <div className="space-y-3">
      <Label>العمود الأيمن</Label>
      <RowList
        rows={item.leftNodes}
        addLabel="إضافة عنصر"
        minRows={1}
        makeNewRow={() => ({ id: uuid(), label: "" })}
        onChange={(leftNodes) => onChange({ ...item, leftNodes })}
        renderRow={(row, update) => (
          <Input value={row.label} placeholder="نص العنصر" onChange={(e) => update({ label: e.target.value })} />
        )}
      />
      <Label>العمود الأيسر</Label>
      <RowList
        rows={item.rightNodes}
        addLabel="إضافة عنصر"
        minRows={1}
        makeNewRow={() => ({ id: uuid(), label: "" })}
        onChange={(rightNodes) => onChange({ ...item, rightNodes })}
        renderRow={(row, update) => (
          <Input value={row.label} placeholder="نص العنصر" onChange={(e) => update({ label: e.target.value })} />
        )}
      />
      <Label>حدّد الروابط الصحيحة</Label>
      <div className="grid gap-1 rounded-lg border border-ash/15 p-2">
        {item.leftNodes.map((l) => (
          <div key={l.id} className="flex flex-wrap items-center gap-2 border-b border-ash/10 py-1 last:border-0">
            <span className="w-20 truncate font-ui text-xs text-ink dark:text-white">{l.label || "—"}</span>
            {item.rightNodes.map((r) => (
              <label key={r.id} className="flex items-center gap-1 font-ui text-xs text-ash">
                <input
                  type="checkbox"
                  checked={item.correctConnections.some((c) => c.leftId === l.id && c.rightId === r.id)}
                  onChange={() => toggleConnection(l.id, r.id)}
                  className="h-3.5 w-3.5 accent-amber"
                />
                {r.label || "—"}
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MemoryGameEditor({
  item,
  onChange
}: {
  item: MemoryGameItem;
  onChange: (item: MemoryGameItem) => void;
}) {
  function addPair() {
    const pairId = uuid();
    onChange({
      ...item,
      cards: [...item.cards, { id: uuid(), pairId, text: "" }, { id: uuid(), pairId, text: "" }]
    });
  }

  const pairIds = [...new Set(item.cards.map((c) => c.pairId))];

  return (
    <div className="space-y-3">
      <Label>أزواج البطاقات (كل زوج يجب أن يتطابق نصّه)</Label>
      {pairIds.map((pairId) => {
        const cards = item.cards.filter((c) => c.pairId === pairId);
        return (
          <div key={pairId} className="flex items-center gap-2">
            {cards.map((card) => (
              <Input
                key={card.id}
                value={card.text ?? ""}
                placeholder="نص البطاقة"
                onChange={(e) =>
                  onChange({ ...item, cards: item.cards.map((c) => (c.id === card.id ? { ...c, text: e.target.value } : c)) })
                }
              />
            ))}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={() => onChange({ ...item, cards: item.cards.filter((c) => c.pairId !== pairId) })}
            >
              ✕
            </Button>
          </div>
        );
      })}
      <Button size="sm" variant="outline" onClick={addPair}>
        إضافة زوج جديد
      </Button>
    </div>
  );
}

export function FlipCardsEditor({ item, onChange }: { item: FlipCardsItem; onChange: (item: FlipCardsItem) => void }) {
  return (
    <div className="space-y-3">
      <Label>البطاقات (وجه / خلف) — للمراجعة والدراسة، بدون تصحيح آلي</Label>
      <RowList
        rows={item.cards}
        addLabel="إضافة بطاقة"
        minRows={1}
        makeNewRow={() => ({ id: uuid(), front: "", back: "" })}
        onChange={(cards) => onChange({ ...item, cards })}
        renderRow={(card, update) => (
          <div className="grid grid-cols-2 gap-2">
            <Input value={card.front} placeholder="الوجه الأمامي" onChange={(e) => update({ front: e.target.value })} />
            <Input value={card.back} placeholder="الوجه الخلفي" onChange={(e) => update({ back: e.target.value })} />
          </div>
        )}
      />
    </div>
  );
}

// Kept for potential future image-based memory cards; currently unused directly
// but exported so a follow-up UI can add media pairs without new plumbing.
export function useMemoryCardImageUpload() {
  const addFile = useMediaStore((s) => s.addFile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  return { addFile, fileInputRef };
}
