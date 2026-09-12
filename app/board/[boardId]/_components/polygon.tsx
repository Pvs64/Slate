"use client";

import { useState, useRef, useEffect } from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { colorToCss, getContrastingTextColor } from "@/lib/utils";
import { LayerType, PolygonLayer } from "@/types/canvas";
import { useMutation } from "@/liveblocks.config";

interface PolygonProps {
  id: string;
  layer: PolygonLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

function getPoints(type: LayerType, width: number, height: number) {
  if (type === LayerType.Triangle) {
    return `${width / 2},0 ${width},${height} 0,${height}`;
  }

  if (type === LayerType.Diamond) {
    return `${width / 2},0 ${width},${height / 2} ${width / 2},${height} 0,${height / 2}`;
  }

  if (type === LayerType.Hexagon) {
    const rx = width / 2;
    const ry = height / 2;
    return Array.from({ length: 6 }, (_, index) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 6;
      return `${rx + Math.cos(angle) * rx},${ry + Math.sin(angle) * ry}`;
    }).join(" ");
  }

  return Array.from({ length: 10 }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    const radius = index % 2 === 0 ? 0.5 : 0.22;
    return `${width / 2 + Math.cos(angle) * width * radius},${height / 2 + Math.sin(angle) * height * radius}`;
  }).join(" ");
}

export const Polygon = ({ id, layer, onPointerDown, selectionColor }: PolygonProps) => {
  const { x, y, width, height, fill, value, type } = layer;
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
  const fontSize = Math.min(22, Math.max(11, Math.floor(Math.min(width, height) / 4.5)));

  // Inner inset to keep text within diamond/triangle boundaries
  const insetX = type === LayerType.Diamond ? width * 0.2 : width * 0.15;
  const insetY = type === LayerType.Triangle ? height * 0.3 : height * 0.2;
  const innerWidth = width - insetX * 2;
  const innerHeight = height - insetY * 1.5;

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
      <polygon
        className="drop-shadow-md cursor-move"
        onPointerDown={(event) => {
          if (!isEditing) {
            onPointerDown(event, id);
          }
        }}
        points={getPoints(type, width, height)}
        fill={fill ? colorToCss(fill) : "#000"}
        stroke={strokeColor}
        strokeWidth={strokeWidthVal}
      />
      <foreignObject
        x={insetX}
        y={insetY}
        width={innerWidth}
        height={innerHeight}
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
            className={`w-full text-center p-1 outline-none whitespace-pre-wrap break-words leading-relaxed ${
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