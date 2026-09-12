"use client";

import { useState, useRef, useEffect } from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { colorToCss, getContrastingTextColor } from "@/lib/utils";
import { RectangleLayer } from "@/types/canvas";
import { useMutation } from "@/liveblocks.config";

interface RectangleProps {
  id: string;
  layer: RectangleLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const Rectangle = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: RectangleProps) => {
  const { x, y, width, height, fill, value } = layer;
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isEditing && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isEditing]);

  const updateValue = useMutation(
    ({ storage }, newValue: string) => {
      const liveLayers = storage.get("layers");
      liveLayers.get(id)?.update({ value: newValue } as never);
    },
    [id]
  );

  const handleTextChange = (e: ContentEditableEvent) => {
    updateValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      if (!document.execCommand("insertLineBreak")) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          const br = document.createElement("br");
          range.insertNode(br);
          range.setStartAfter(br);
          range.setEndAfter(br);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      e.preventDefault();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const textColor = fill ? getContrastingTextColor(fill) : "#fff";
  const fontSize = Math.min(28, Math.max(12, Math.floor(Math.min(width, height) / 4)));

  const borderColorCss = layer.borderColor ? colorToCss(layer.borderColor) : undefined;
  const strokeColor = borderColorCss || selectionColor || "transparent";
  const strokeWidthVal = layer.borderWidth !== undefined
    ? layer.borderWidth
    : (borderColorCss ? 2 : (selectionColor ? 2 : 0));

  return (
    <g
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      onPointerDown={(e) => {
        if (!isEditing) {
          onPointerDown(e, id);
        }
      }}
      onDoubleClick={() => setIsEditing(true)}
    >
      <rect
        className="drop-shadow-md cursor-move"
        onPointerDown={(e) => {
          if (!isEditing) {
            onPointerDown(e, id);
          }
        }}
        x={0}
        y={0}
        width={width}
        height={height}
        strokeWidth={strokeWidthVal}
        fill={fill ? colorToCss(fill) : "#000"}
        stroke={strokeColor}
      />
      <foreignObject
        x={0}
        y={0}
        width={width}
        height={height}
        className={isEditing ? "pointer-events-auto" : "pointer-events-none"}
      >
        <div className="h-full w-full flex flex-col items-center justify-center">
          <ContentEditable
            innerRef={(el: HTMLElement) => { contentRef.current = el; }}
            html={value || ""}
            disabled={!isEditing}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onBlur={() => setIsEditing(false)}
            onPointerDown={(e: React.PointerEvent) => {
              if (isEditing) {
                e.stopPropagation();
              } else {
                onPointerDown(e, id);
              }
            }}
            data-placeholder="Type..."
            className={`w-full text-center p-2 outline-none whitespace-pre-wrap break-words leading-relaxed ${
              isEditing ? "cursor-text select-text" : "cursor-move select-none"
            } empty:before:content-[attr(data-placeholder)] empty:before:opacity-40 empty:before:pointer-events-none`}
            style={{
              color: textColor,
              fontSize,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
            }}
          />
        </div>
      </foreignObject>
    </g>
  );
};