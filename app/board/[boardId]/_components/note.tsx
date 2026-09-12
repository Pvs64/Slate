"use client";

import { useState, useRef, useEffect } from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { cn, colorToCss, getContrastingTextColor } from "@/lib/utils";
import { NoteLayer } from "@/types/canvas";
import { useMutation } from "@/liveblocks.config";

const calculateFontSize = (width: number, height: number) => {
  const maxFontSize = 96;
  const scaleFactor = 0.15;
  const fontSizeBasedOnHeight = height * scaleFactor;
  const fontSizeBasedOnWidth = width * scaleFactor;
  return Math.min(maxFontSize, fontSizeBasedOnHeight, fontSizeBasedOnWidth);
};

interface NoteProps {
  id: string;
  layer: NoteLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const Note = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: NoteProps) => {
  const { x, y, width, height, fill, value } = layer;
  const [isEditing, setIsEditing] = useState(!value || value === "Text");
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

  const handleChange = (e: ContentEditableEvent) => {
    updateValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.stopPropagation();
      // Insert line break for next line
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

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.innerText.trim() === "Text" && (!layer.value || layer.value === "Text")) {
      e.currentTarget.innerText = "";
      updateValue("");
    }
  };

  const displayValue = value && value !== "Text" ? value : "";
  const textColor = fill ? getContrastingTextColor(fill) : "#000";

  return (
    <foreignObject
      x={x}
      y={y}
      width={width}
      height={height}
      onPointerDown={(e) => onPointerDown(e, id)}
      onDoubleClick={() => setIsEditing(true)}
      style={{
        outline: selectionColor ? `2px solid ${selectionColor}` : "none",
        border: layer.borderColor && layer.borderWidth ? `${layer.borderWidth}px solid ${colorToCss(layer.borderColor)}` : undefined,
        backgroundColor: fill ? colorToCss(fill) : "#000",
      }}
      className="shadow-md drop-shadow-xl cursor-move rounded-sm"
    >
      <div
        className="h-full w-full"
        onPointerDown={(event: React.PointerEvent) => {
          if (!isEditing) {
            onPointerDown(event, id);
          } else {
            event.stopPropagation();
          }
        }}
      >
        <ContentEditable
          innerRef={(el: HTMLElement) => {
            contentRef.current = el;
          }}
          html={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={() => setIsEditing(false)}
          data-placeholder="Note..."
          disabled={!isEditing}
          onPointerDown={(event: React.PointerEvent) => {
            if (!isEditing) {
              onPointerDown(event, id);
            } else {
              event.stopPropagation();
            }
          }}
          className={cn(
            "h-full w-full flex flex-col justify-start outline-none whitespace-pre-wrap break-words p-3 leading-snug",
            "empty:before:content-[attr(data-placeholder)] empty:before:opacity-50 empty:before:pointer-events-none",
            isEditing ? "cursor-text select-text" : "cursor-move select-none"
          )}
          style={{
            fontFamily: layer.fontFamily || "Inter, sans-serif",
            fontSize: layer.fontSize || calculateFontSize(width, height),
            fontWeight: layer.fontWeight || 400,
            fontStyle: layer.fontStyle || "normal",
            textDecoration: layer.textDecoration || "none",
            textAlign: layer.textAlign || "left",
            backgroundColor: layer.highlight ? colorToCss(layer.highlight) : "transparent",
            color: textColor,
          }}
        />
      </div>
    </foreignObject>
  );
};