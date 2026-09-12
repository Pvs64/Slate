"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Type, StickyNote, Code2, FileText, LayoutTemplate, Layers } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useStorage } from "@/liveblocks.config";
import { LayerType } from "@/types/canvas";

interface BoardSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToLayer: (layerId: string) => void;
}

export const BoardSearchDialog = ({
  isOpen,
  onClose,
  onJumpToLayer,
}: BoardSearchDialogProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const liveLayers = useStorage((root) => {
    const entries: { id: string; type: LayerType; text: string }[] = [];
    root.layers.forEach((layer, id) => {
      let text = "";
      if ("value" in layer && typeof layer.value === "string") text = layer.value;
      else if ("title" in layer && typeof layer.title === "string") text = layer.title;
      else if ("name" in layer && typeof layer.name === "string") text = layer.name;
      entries.push({ id, type: layer.type, text });
    });
    return entries;
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  const results = useMemo(() => {
    if (!query.trim() || !liveLayers) return [];
    const q = query.toLowerCase();
    return liveLayers.filter((item) => item.text.toLowerCase().includes(q));
  }, [liveLayers, query]);

  const getIcon = (type: LayerType) => {
    switch (type) {
      case LayerType.Text:
        return <Type className="h-4 w-4 text-blue-500 shrink-0" />;
      case LayerType.Note:
      case LayerType.Callout:
        return <StickyNote className="h-4 w-4 text-amber-500 shrink-0" />;
      case LayerType.Code:
        return <Code2 className="h-4 w-4 text-emerald-500 shrink-0" />;
      case LayerType.Pdf:
        return <FileText className="h-4 w-4 text-rose-500 shrink-0" />;
      case LayerType.Frame:
        return <LayoutTemplate className="h-4 w-4 text-violet-500 shrink-0" />;
      default:
        return <Layers className="h-4 w-4 text-neutral-400 shrink-0" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-white shadow-2xl rounded-2xl border border-neutral-200">
        <DialogTitle className="sr-only">Search board content</DialogTitle>
        <div className="flex items-center border-b border-neutral-200 pl-3 pr-10 py-2.5">
          <Search className="h-4 w-4 text-neutral-400 mr-2 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search board content (text, notes, code, frames)..."
            className="w-full bg-transparent text-sm outline-none text-neutral-900 placeholder:text-neutral-400"
          />
        </div>

        <div className="max-h-72 overflow-y-auto p-2">
          {query.trim() && results.length === 0 && (
            <div className="py-8 text-center text-xs text-neutral-400">
              No matching elements found
            </div>
          )}

          {!query.trim() && (
            <div className="py-6 text-center text-xs text-neutral-400">
              Type keywords to jump directly to any element on this board
            </div>
          )}

          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => {
                onJumpToLayer(result.id);
                handleClose();
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-neutral-100 text-left transition-colors cursor-pointer"
            >
              {getIcon(result.type)}
              <div className="truncate flex-1">
                <p className="text-xs font-medium text-neutral-800 truncate">
                  {result.text.slice(0, 100) || "Untitled element"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
