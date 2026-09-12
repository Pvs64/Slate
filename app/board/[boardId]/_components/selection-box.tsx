"use client";

import { memo } from "react";
import { useSelf, useStorage } from "@/liveblocks.config";
import { LayerType, Side, XYWH } from "@/types/canvas";
import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { cn } from "@/lib/utils";

interface SelectionBoxProps {
  onResizeHandlePointerDown: (corner: Side, initialBounds: XYWH) => void;
  onRotateHandlePointerDown?: (initialBounds: XYWH) => void;
}

const HANDLE_WIDTH = 8;

export const SelectionBox = memo(
  ({ onResizeHandlePointerDown, onRotateHandlePointerDown }: SelectionBoxProps) => {
    const soleLayerId = useSelf((me) =>
      me.presence.selection.length === 1 ? me.presence.selection[0] : null
    );

    const isLocked = useStorage((root) =>
      soleLayerId ? !!root.layers.get(soleLayerId)?.isLocked : false
    );

    const rotation = useStorage((root) =>
      soleLayerId ? root.layers.get(soleLayerId)?.rotation ?? 0 : 0
    );

    const isShowingHandles = useStorage(
      (root) =>
        soleLayerId &&
        root.layers.get(soleLayerId)?.type !== LayerType.Path &&
        !root.layers.get(soleLayerId)?.isLocked
    );

    const bounds = useSelectionBounds();

    if (!bounds) {
      return null;
    }

    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    return (
      <g
        transform={
          rotation ? `rotate(${rotation} ${centerX} ${centerY})` : undefined
        }
      >
        <rect
          className={cn(
            "fill-transparent stroke-1 pointer-events-none",
            isLocked ? "stroke-amber-500 stroke-dasharray-[4_2]" : "stroke-blue-500"
          )}
          style={{
            transform: `translate(${bounds.x}px, ${bounds.y}px)`,
          }}
          x={0}
          y={0}
          width={bounds.width}
          height={bounds.height}
        />

        {isShowingHandles && (
          <>
            {/* Rotation handle stem & circle */}
            <line
              x1={centerX}
              y1={bounds.y}
              x2={centerX}
              y2={bounds.y - 20}
              className="stroke-blue-500 stroke-1"
            />
            <circle
              cx={centerX}
              cy={bounds.y - 20}
              r={4.5}
              className="fill-white stroke-blue-500 stroke-1.5 cursor-grab hover:fill-blue-100 hover:scale-125 active:cursor-grabbing transition-transform"
              onPointerDown={(e) => {
                e.stopPropagation();
                onRotateHandlePointerDown?.(bounds);
              }}
            />

            {/* Top-Left */}
            <rect
              className="fill-white stroke-blue-500 stroke-1"
              style={{
                cursor: "nwse-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${bounds.x - HANDLE_WIDTH / 2}px, ${
                  bounds.y - HANDLE_WIDTH / 2
                }px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top + Side.Left, bounds);
              }}
            />

            {/* Top */}
            <rect
              className="fill-white stroke-blue-500 stroke-1"
              style={{
                cursor: "ns-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${
                  bounds.x + bounds.width / 2 - HANDLE_WIDTH / 2
                }px, ${bounds.y - HANDLE_WIDTH / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top, bounds);
              }}
            />

            {/* Top-Right */}
            <rect
              className="fill-white stroke-blue-500 stroke-1"
              style={{
                cursor: "nesw-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${
                  bounds.x - HANDLE_WIDTH / 2 + bounds.width
                }px, ${bounds.y - HANDLE_WIDTH / 2}px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top + Side.Right, bounds);
              }}
            />

            {/* Right */}
            <rect
              className="fill-white stroke-blue-500 stroke-1"
              style={{
                cursor: "ew-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${
                  bounds.x - HANDLE_WIDTH / 2 + bounds.width
                }px, ${
                  bounds.y + bounds.height / 2 - HANDLE_WIDTH / 2
                }px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Right, bounds);
              }}
            />

            {/* Bottom-Right */}
            <rect
              className="fill-white stroke-blue-500 stroke-1"
              style={{
                cursor: "nwse-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${
                  bounds.x - HANDLE_WIDTH / 2 + bounds.width
                }px, ${
                  bounds.y - HANDLE_WIDTH / 2 + bounds.height
                }px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom + Side.Right, bounds);
              }}
            />

            {/* Bottom */}
            <rect
              className="fill-white stroke-blue-500 stroke-1"
              style={{
                cursor: "ns-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${
                  bounds.x + bounds.width / 2 - HANDLE_WIDTH / 2
                }px, ${
                  bounds.y - HANDLE_WIDTH / 2 + bounds.height
                }px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom, bounds);
              }}
            />

            {/* Bottom-Left */}
            <rect
              className="fill-white stroke-blue-500 stroke-1"
              style={{
                cursor: "nesw-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${bounds.x - HANDLE_WIDTH / 2}px, ${
                  bounds.y - HANDLE_WIDTH / 2 + bounds.height
                }px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom + Side.Left, bounds);
              }}
            />

            {/* Left */}
            <rect
              className="fill-white stroke-blue-500 stroke-1"
              style={{
                cursor: "ew-resize",
                width: `${HANDLE_WIDTH}px`,
                height: `${HANDLE_WIDTH}px`,
                transform: `translate(${bounds.x - HANDLE_WIDTH / 2}px, ${
                  bounds.y - HANDLE_WIDTH / 2 + bounds.height / 2
                }px)`,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Left, bounds);
              }}
            />
          </>
        )}
      </g>
    );
  }
);

SelectionBox.displayName = "SelectionBox";