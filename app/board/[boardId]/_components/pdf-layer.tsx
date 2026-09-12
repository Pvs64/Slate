"use client";

import { useState } from "react";
import { GripVertical, FileText } from "lucide-react";
import { PdfLayer } from "@/types/canvas";

interface PdfLayerProps {
  id: string;
  layer: PdfLayer;
  onPointerDown: (event: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const PdfPreview = ({ id, layer, onPointerDown, selectionColor }: PdfLayerProps) => {
  const [isInteractive, setIsInteractive] = useState(false);

  return (
    <foreignObject
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      onPointerDown={(event) => onPointerDown(event, id)}
      style={{ outline: selectionColor ? `2px solid ${selectionColor}` : "none" }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-md border border-neutral-300 bg-white shadow-md flex flex-col select-none">
        {/* Draggable header bar */}
        <div
          onPointerDown={(event) => onPointerDown(event, id)}
          className="flex h-8 items-center justify-between border-b bg-neutral-100 px-2 cursor-grab active:cursor-grabbing text-xs font-medium text-neutral-700 hover:bg-neutral-200 transition-colors"
          title="Drag here to move PDF"
        >
          <div className="flex items-center gap-1.5 truncate">
            <GripVertical className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
            <FileText className="h-3.5 w-3.5 text-red-500 shrink-0" />
            <span className="truncate max-w-[180px] font-semibold">{layer.name || "PDF Document"}</span>
          </div>

          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setIsInteractive(!isInteractive);
            }}
            className={`rounded px-2 py-0.5 text-[10px] font-medium border transition-colors ${
              isInteractive
                ? "bg-blue-600 text-white border-blue-700 shadow-sm"
                : "bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50"
            }`}
          >
            {isInteractive ? "Done (Move)" : "Scroll / Read"}
          </button>
        </div>

        {/* PDF iframe content */}
        <div className="relative flex-1 w-full h-[calc(100%-32px)]">
          <iframe
            className="h-full w-full border-none pointer-events-auto"
            src={layer.src}
            title={layer.name || "PDF document"}
          />

          {/* Move overlay: active when not in interactive mode so clicking/dragging moves the layer */}
          {!isInteractive && (
            <div
              onPointerDown={(event) => onPointerDown(event, id)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsInteractive(true);
              }}
              className="absolute inset-0 bg-transparent cursor-grab active:cursor-grabbing"
              title="Click or drag to select and move. Double-click to scroll inside PDF."
            />
          )}
        </div>
      </div>
    </foreignObject>
  );
};