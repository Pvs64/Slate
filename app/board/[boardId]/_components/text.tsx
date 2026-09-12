"use client";

import { useState, useRef, useEffect } from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { cn, colorToCss, colorToBackgroundCss } from "@/lib/utils";
import { TextLayer } from "@/types/canvas";
import { useMutation } from "@/liveblocks.config";

const calculateFontSize = (width: number, height: number) => {
  const maxFontSize = 96;
  const scaleFactor = 0.5;
  const fontSizeBasedOnHeight = height * scaleFactor;
  const fontSizeBasedOnWidth = width * scaleFactor;
  return Math.min(maxFontSize, fontSizeBasedOnHeight, fontSizeBasedOnWidth);
};

interface TextProps {
  id: string;
  layer: TextLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const Text = ({
  id,
  layer,
  onPointerDown,
  selectionColor,
}: TextProps) => {
  const { x, y, width, height, fill, value } = layer;
  // If layer has no value or default placeholder, start in editing mode so user can type immediately
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

  const isGradient = Boolean(fill?.gradient);
  const gradientCss = isGradient ? colorToBackgroundCss(fill) : undefined;
  const displayValue = value && value !== "Text" ? value : "";

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
      }}
      className="cursor-move"
    >
      <div
        className="relative h-full w-full flex flex-col justify-center"
        onPointerDown={(e) => {
          if (!isEditing) {
            onPointerDown(e, id);
          }
        }}
      >
        <ContentEditable
          innerRef={(el: HTMLElement) => { contentRef.current = el; }}
          html={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={() => setIsEditing(false)}
          data-placeholder="Type..."
          disabled={!isEditing}
          onPointerDown={(event: React.PointerEvent) => {
            if (!isEditing) {
              onPointerDown(event, id);
            } else {
              event.stopPropagation();
            }
          }}
          className={cn(
            "h-full w-full flex flex-col justify-center drop-shadow-md outline-none whitespace-pre-wrap break-words p-1 leading-normal",
            "empty:before:content-[attr(data-placeholder)] empty:before:opacity-40 empty:before:pointer-events-none",
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
            color: isGradient ? "transparent" : (fill ? colorToCss(fill) : "#000"),
            backgroundImage: isGradient ? gradientCss : undefined,
            WebkitBackgroundClip: isGradient ? "text" : undefined,
            WebkitTextFillColor: isGradient ? "transparent" : undefined,
          }}
        />
      </div>
    </foreignObject>
  );
};