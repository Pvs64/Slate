"use client";

import { useState } from "react";
import { LayoutTemplate } from "lucide-react";
import { FrameLayer } from "@/types/canvas";
import { colorToCss } from "@/lib/utils";
import { useMutation } from "@/liveblocks.config";

interface FrameComponentProps {
  id: string;
  layer: FrameLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const FrameComponent = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: FrameComponentProps) => {
  const { x, y, width, height, title, fill } = layer;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(title || "Frame");

  const updateTitle = useMutation(
    ({ storage }, newTitle: string) => {
      const liveLayers = storage.get("layers");
      liveLayers.get(id)?.update({ title: newTitle } as never);
    },
    [id]
  );

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleText.trim()) {
      updateTitle(titleText.trim());
    } else {
      setTitleText(title || "Frame");
    }
  };

  return (
    <g
      style={{ transform: `translate(${x}px, ${y}px)` }}
      onPointerDown={(e) => onPointerDown(e, id)}
    >
      {/* Frame Header Label */}
      <foreignObject
        x={0}
        y={-28}
        width={Math.max(160, width)}
        height={28}
        className="overflow-visible select-none"
      >
        <div className="flex items-center">
          {isEditingTitle ? (
            <input
              autoFocus
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSubmit();
                if (e.key === "Escape") {
                  setTitleText(title || "Frame");
                  setIsEditingTitle(false);
                }
              }}
              className="rounded-t-md border border-b-0 border-violet-500 bg-white px-2 py-0.5 text-xs font-bold text-violet-900 outline-none shadow-xs"
            />
          ) : (
            <div
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-t-md text-xs font-semibold shadow-xs cursor-pointer transition-colors ${
                selectionColor
                  ? "bg-violet-600 text-white"
                  : "bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
              }`}
              title="Double-click to rename frame"
            >
              <LayoutTemplate className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[180px]">{title || "Frame"}</span>
            </div>
          )}
        </div>
      </foreignObject>

      {/* Frame Background & Border */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={6}
        fill={fill ? colorToCss(fill) : "rgba(248, 249, 250, 0.4)"}
        stroke={selectionColor || "rgba(139, 92, 246, 0.5)"}
        strokeWidth={selectionColor ? 2 : 1.5}
        strokeDasharray="6 4"
        className="cursor-move"
      />
    </g>
  );
};
