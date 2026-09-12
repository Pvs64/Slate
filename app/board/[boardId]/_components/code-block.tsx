"use client";

import { useState } from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { useMutation } from "@/liveblocks.config";
import { CodeLayer } from "@/types/canvas";
import { GripVertical } from "lucide-react";

interface CodeBlockProps {
  id: string;
  layer: CodeLayer;
  onPointerDown: (event: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const CodeBlock = ({ id, layer, onPointerDown, selectionColor }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const updateValue = useMutation(({ storage }, value: string) => {
    storage.get("layers").get(id)?.update({ value } as never);
  }, []);

  const copyCode = async () => {
    const container = document.createElement("div");
    container.innerHTML = layer.value || "";
    await navigator.clipboard.writeText(container.textContent || "");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
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
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.innerText.trim() === "// Add code" && (!layer.value || layer.value === "// Add code")) {
      e.currentTarget.innerText = "";
      updateValue("");
    }
  };

  const displayValue = layer.value && layer.value !== "// Add code" ? layer.value : "";

  return (
    <foreignObject
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      onPointerDown={(event) => onPointerDown(event, id)}
      style={{ outline: selectionColor ? `2px solid ${selectionColor}` : "none" }}
    >
      <div className={`h-full w-full overflow-hidden rounded-md border font-mono text-xs flex flex-col ${layer.dark === false ? "border-neutral-300 bg-white text-neutral-900" : "border-neutral-800 bg-neutral-950 text-neutral-100"}`}>
        <div
          onPointerDown={(event) => onPointerDown(event, id)}
          className="flex h-7 items-center justify-between border-b border-white/10 px-2 text-[10px] uppercase tracking-wide opacity-80 cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex items-center gap-1">
            <GripVertical className="h-3 w-3 opacity-60" />
            <span>{layer.language || "typescript"}</span>
          </div>
          <button
            className="rounded px-1.5 py-0.5 hover:bg-white/10"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={copyCode}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <ContentEditable
          html={displayValue}
          onChange={(event: ContentEditableEvent) => updateValue(event.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          data-placeholder="// Type or paste code here..."
          onPointerDown={(event: React.PointerEvent) => { event.stopPropagation(); }}
          className="flex-1 w-full overflow-auto bg-transparent p-2 font-mono outline-none whitespace-pre leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:opacity-40 empty:before:pointer-events-none"
          spellCheck={false}
          aria-label="Code block content"
        />
      </div>
    </foreignObject>
  );
};