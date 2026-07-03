import { useState } from "react";
import type { MultipleChoiceItem, TrueFalseItem, ImageSelectionItem, ListeningItem, ReadingItem } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { useMediaStore } from "@/store/mediaStore";
import { cn } from "@/utils/cn";

function ChoiceButtons({
  choices,
  selected,
  onToggle
}: {
  choices: { id: string; text: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {choices.map((choice) => (
        <button
          key={choice.id}
          onClick={() => onToggle(choice.id)}
          className={cn(
            "block w-full rounded-xl border-2 px-4 py-3 text-start font-ui text-sm transition-colors",
            selected.includes(choice.id) ? "border-amber bg-amber/15" : "border-ash/20 hover:border-amber/50"
          )}
        >
          {choice.text}
        </button>
      ))}
    </div>
  );
}

export function MultipleChoiceRunner({ item, onSubmit }: { item: MultipleChoiceItem; onSubmit: (r: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const multi = item.correctChoiceIds.length > 1;
  return (
    <div className="space-y-4">
      <ChoiceButtons
        choices={item.choices}
        selected={selected}
        onToggle={(id) =>
          setSelected((prev) =>
            multi ? (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]) : [id]
          )
        }
      />
      <Button variant="accent" disabled={selected.length === 0} onClick={() => onSubmit(selected)}>
        تأكيد الإجابة
      </Button>
    </div>
  );
}

export function TrueFalseRunner({ onSubmit }: { item: TrueFalseItem; onSubmit: (r: boolean) => void }) {
  return (
    <div className="flex gap-3">
      <Button variant="outline" className="flex-1" onClick={() => onSubmit(true)}>
        صح
      </Button>
      <Button variant="outline" className="flex-1" onClick={() => onSubmit(false)}>
        خطأ
      </Button>
    </div>
  );
}

export function ImageSelectionRunner({
  item,
  onSubmit
}: {
  item: ImageSelectionItem;
  onSubmit: (r: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const getAsset = useMediaStore((s) => s.getAsset);
  const multi = item.correctImageIds.length > 1;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {item.images.map((img) => {
          const asset = getAsset(img.mediaId);
          return (
            <button
              key={img.id}
              onClick={() =>
                setSelected((prev) =>
                  multi ? (prev.includes(img.id) ? prev.filter((v) => v !== img.id) : [...prev, img.id]) : [img.id]
                )
              }
              className={cn(
                "aspect-square overflow-hidden rounded-xl border-4",
                selected.includes(img.id) ? "border-amber" : "border-transparent"
              )}
            >
              {asset?.url && <img src={asset.url} className="h-full w-full object-cover" />}
            </button>
          );
        })}
      </div>
      <Button variant="accent" disabled={selected.length === 0} onClick={() => onSubmit(selected)}>
        تأكيد الإجابة
      </Button>
    </div>
  );
}

export function ListeningRunner({ item, onSubmit }: { item: ListeningItem; onSubmit: (r: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const getAsset = useMediaStore((s) => s.getAsset);
  const asset = getAsset(item.audioMediaId);

  return (
    <div className="space-y-4">
      {asset?.url && <audio controls src={asset.url} className="w-full" />}
      <ChoiceButtons
        choices={item.choices}
        selected={selected}
        onToggle={(id) => setSelected([id])}
      />
      <Button variant="accent" disabled={selected.length === 0} onClick={() => onSubmit(selected)}>
        تأكيد الإجابة
      </Button>
    </div>
  );
}

export function ReadingRunner({ item, onSubmit }: { item: ReadingItem; onSubmit: (r: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-canvas dark:bg-ink/40 p-4 font-body text-sm leading-relaxed text-ink dark:text-white">
        {item.passage}
      </p>
      <ChoiceButtons choices={item.choices} selected={selected} onToggle={(id) => setSelected([id])} />
      <Button variant="accent" disabled={selected.length === 0} onClick={() => onSubmit(selected)}>
        تأكيد الإجابة
      </Button>
    </div>
  );
}
