"use client";

import { useMemo } from "react";
import {
  Layers,
  X,
  Type,
  StickyNote,
  Square,
  Circle,
  Code2,
  ArrowRight,
  Lock,
  Unlock,
  Trash2,
  ChevronUp,
  ChevronDown,
  LayoutTemplate,
  FileText,
  Boxes,
  Image as ImageIcon,
} from "lucide-react";
import { useStorage, useMutation, useSelf } from "@/liveblocks.config";
import { LayerType, Layer } from "@/types/canvas";

interface LayersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLayer: (id: string) => void;
}

export const LayersPanel = ({ isOpen, onClose, onSelectLayer }: LayersPanelProps) => {
  const layerIds = useStorage((root) => root.layerIds);
  const layersMap = useStorage((root) => root.layers);
  const selection = useSelf((me) => me.presence.selection ?? []) ?? [];

  const moveLayerOrder = useMutation(
    ({ storage }, id: string, direction: "up" | "down") => {
      const liveLayerIds = storage.get("layerIds");
      const index = liveLayerIds.indexOf(id);
      if (index === -1) return;
      const targetIndex = direction === "up" ? index + 1 : index - 1;
      if (targetIndex < 0 || targetIndex >= liveLayerIds.length) return;

      liveLayerIds.delete(index);
      liveLayerIds.insert(id, targetIndex);
    },
    []
  );

  const toggleLock = useMutation(
    ({ storage }, id: string, currentlyLocked?: boolean) => {
      const liveLayers = storage.get("layers");
      liveLayers.get(id)?.update({ isLocked: !currentlyLocked } as never);
    },
    []
  );

  const deleteLayer = useMutation(
    ({ storage, setMyPresence }, id: string) => {
      const liveLayers = storage.get("layers");
      const liveLayerIds = storage.get("layerIds");
      liveLayers.delete(id);
      const index = liveLayerIds.indexOf(id);
      if (index !== -1) liveLayerIds.delete(index);
      setMyPresence({ selection: [] });
    },
    []
  );

  const orderedLayers = useMemo(() => {
    if (!layerIds || !layersMap) return [];
    // Display in top-to-bottom visual order (highest index on top)
    return Array.from(layerIds)
      .reverse()
      .map((id) => {
        const layer = layersMap.get(id);
        return layer ? { id, layer } : null;
      })
      .filter(Boolean) as { id: string; layer: Layer }[];
  }, [layerIds, layersMap]);

  if (!isOpen) return null;

  const getLayerIcon = (layer: Layer) => {
    switch (layer.type) {
      case LayerType.Text:
        return <Type className="h-3.5 w-3.5 text-blue-500" />;
      case LayerType.Note:
      case LayerType.Callout:
        return <StickyNote className="h-3.5 w-3.5 text-amber-500" />;
      case LayerType.Reactangle:
        return <Square className="h-3.5 w-3.5 text-indigo-500" />;
      case LayerType.Ellipse:
        return <Circle className="h-3.5 w-3.5 text-emerald-500" />;
      case LayerType.Code:
        return <Code2 className="h-3.5 w-3.5 text-neutral-700" />;
      case LayerType.Connector:
      case LayerType.ArrowConnector:
        return <ArrowRight className="h-3.5 w-3.5 text-violet-500" />;
      case LayerType.Frame:
        return <LayoutTemplate className="h-3.5 w-3.5 text-purple-600" />;
      case LayerType.Pdf:
        if ("mediaType" in layer && layer.mediaType === "image") {
          return <ImageIcon className="h-3.5 w-3.5 text-sky-500" />;
        }
        return <FileText className="h-3.5 w-3.5 text-red-500" />;
      case LayerType.SystemShape:
        return <Boxes className="h-3.5 w-3.5 text-sky-500" />;
      default:
        return <Layers className="h-3.5 w-3.5 text-neutral-400" />;
    }
  };

  const getLayerLabel = (layer: Layer) => {
    if ("title" in layer && layer.title) return layer.title;
    if ("name" in layer && layer.name) return layer.name;
    if ("value" in layer && typeof layer.value === "string" && layer.value.trim()) {
      return layer.value.trim().slice(0, 24);
    }
    return LayerType[layer.type] || "Layer";
  };

  return (
    <div className="absolute top-16 right-4 z-30 w-64 rounded-2xl border border-neutral-200 bg-white/95 p-3 shadow-xl backdrop-blur-md flex flex-col max-h-[calc(100vh-160px)] select-none animate-in fade-in-50 slide-in-from-right-4 duration-150">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-2 mb-2">
        <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-900">
          <Layers className="h-4 w-4 text-blue-600" />
          <span>Layers</span>
          <span className="ml-1 text-[11px] font-normal text-neutral-400">
            ({orderedLayers.length})
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {orderedLayers.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            No layers on canvas yet
          </div>
        ) : (
          orderedLayers.map(({ id, layer }, index) => {
            const isSelected = selection.includes(id);
            return (
              <div
                key={id}
                onClick={() => onSelectLayer(id)}
                className={`group flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-blue-50 text-blue-900 font-semibold border border-blue-200"
                    : "hover:bg-neutral-100 text-neutral-700"
                }`}
              >
                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                  {getLayerIcon(layer)}
                  <span className="truncate">{getLayerLabel(layer)}</span>
                </div>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayerOrder(id, "up");
                    }}
                    disabled={index === 0}
                    className="p-1 hover:bg-neutral-200 rounded disabled:opacity-20"
                    title="Bring Forward"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayerOrder(id, "down");
                    }}
                    disabled={index === orderedLayers.length - 1}
                    className="p-1 hover:bg-neutral-200 rounded disabled:opacity-20"
                    title="Send Backward"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(id, layer.isLocked);
                    }}
                    className="p-1 hover:bg-neutral-200 rounded"
                    title={layer.isLocked ? "Unlock Layer" : "Lock Layer"}
                  >
                    {layer.isLocked ? (
                      <Lock className="h-3 w-3 text-amber-600" />
                    ) : (
                      <Unlock className="h-3 w-3 text-neutral-400" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLayer(id);
                    }}
                    className="p-1 hover:bg-rose-100 text-rose-500 rounded"
                    title="Delete Layer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
