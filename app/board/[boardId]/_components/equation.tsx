"use client";

import { useMutation } from "@/liveblocks.config";
import { StudentLayer } from "@/types/canvas";
import { GripVertical } from "lucide-react";

interface EquationProps {
  id: string;
  layer: StudentLayer;
  onPointerDown: (event: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const Equation = ({ id, layer, onPointerDown, selectionColor }: EquationProps) => {
  const updateValue = useMutation(
    ({ storage }, value: string) => storage.get("layers").get(id)?.update({ value } as never),
    [id]
  );

  return (
    <foreignObject
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      onPointerDown={(event) => onPointerDown(event, id)}
      style={{ outline: selectionColor ? `2px solid ${selectionColor}` : "none" }}
    >
      <div className="flex h-full w-full flex-col justify-between rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-cyan-950 shadow-md select-none">
        <div
          onPointerDown={(event) => onPointerDown(event, id)}
          className="flex items-center gap-1 mb-2 text-[10px] font-bold uppercase tracking-wider text-cyan-700 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-3 w-3 opacity-60" />
          <span>LaTeX Equation</span>
        </div>
        <textarea
          className="min-h-16 w-full resize-none rounded border border-cyan-200 bg-white p-2 font-mono text-sm outline-none focus:border-cyan-500 placeholder:text-neutral-400 select-text"
          value={layer.value ?? ""}
          placeholder={"\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}"}
          onChange={(event) => updateValue(event.target.value)}
          onPointerDown={(event) => event.stopPropagation()}
          aria-label="LaTeX equation"
        />
        <div className="mt-1 text-[10px] text-cyan-700">Enter LaTeX syntax to keep formulas portable.</div>
      </div>
    </foreignObject>
  );
};