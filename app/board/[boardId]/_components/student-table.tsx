import { useMemo } from "react";
import { useMutation } from "@/liveblocks.config";
import { StudentLayer } from "@/types/canvas";

interface StudentTableProps { id: string; layer: StudentLayer; onPointerDown: (event: React.PointerEvent, id: string) => void; selectionColor?: string; }
const defaultCells = Array.from({ length: 9 }, (_, index) => index === 0 ? "Topic" : index === 1 ? "Definition" : index === 2 ? "Example" : "");

export const StudentTable = ({ id, layer, onPointerDown, selectionColor }: StudentTableProps) => {
  const cells = useMemo(() => {
    try { const parsed = JSON.parse(layer.value || ""); return Array.isArray(parsed) && parsed.length === 9 ? parsed : defaultCells; } catch { return defaultCells; }
  }, [layer.value]);
  const updateCell = useMutation(({ storage }, index: number, value: string) => {
    const current = [...cells]; current[index] = value;
    storage.get("layers").get(id)?.update({ value: JSON.stringify(current) } as never);
  }, [cells]);

  return (
    <foreignObject x={layer.x} y={layer.y} width={layer.width} height={layer.height} onPointerDown={(event) => onPointerDown(event, id)} style={{ outline: selectionColor ? `2px solid ${selectionColor}` : "none" }}>
      <div className="h-full w-full overflow-auto rounded-lg border border-amber-200 bg-amber-50 p-2 shadow-md select-none">
        <div
          onPointerDown={(event) => onPointerDown(event, id)}
          className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-900 cursor-grab active:cursor-grabbing"
        >
          Notes Table
        </div>
        <div className="grid h-[calc(100%-24px)] grid-cols-3 grid-rows-3 gap-px bg-amber-200">
          {cells.map((cell, index) => (
            <textarea
              key={index}
              className="min-h-0 resize-none bg-white p-2 text-xs text-neutral-800 outline-none focus:bg-amber-50 select-text"
              value={cell}
              onChange={(event) => updateCell(index, event.target.value)}
              onPointerDown={(event) => event.stopPropagation()}
              aria-label={`Table cell ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </foreignObject>
  );
};