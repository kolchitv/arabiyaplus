import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RowListProps<T> {
  rows: T[];
  onChange: (rows: T[]) => void;
  renderRow: (row: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  makeNewRow: () => T;
  addLabel: string;
  minRows?: number;
}

/** Generic add/edit/remove list used across most quiz-item editors. */
export function RowList<T extends { id: string }>({
  rows,
  onChange,
  renderRow,
  makeNewRow,
  addLabel,
  minRows = 0
}: RowListProps<T>) {
  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <div key={row.id} className="flex items-center gap-2">
          <div className="flex-1">
            {renderRow(
              row,
              (patch) => onChange(rows.map((r) => (r.id === row.id ? { ...r, ...patch } : r))),
              index
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            disabled={rows.length <= minRows}
            onClick={() => onChange(rows.filter((r) => r.id !== row.id))}
          >
            <Trash2 size={13} />
          </Button>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange([...rows, makeNewRow()])}>
        <Plus size={13} /> {addLabel}
      </Button>
    </div>
  );
}

export function SimpleTextRow({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return <Input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}
