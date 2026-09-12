"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getTemplateLayers } from "@/lib/templates";
import { useDisableScrollBounce } from "@/hooks/use-disable-scroll-bounce";
import { useDeleteLayers } from "@/hooks/use-delete-layers";
import {
  CanvasState,
  CanvasMode,
  Camera,
  Color,
  Layer,
  LayerType,
  Point,
  Side,
  XYWH,
} from "@/types/canvas";
import {
  useHistory,
  useCanUndo,
  useCanRedo,
  useMutation,
  useStorage,
  useOthersMapped,
  useSelf,
  useStatus,
} from "@/liveblocks.config";
import { LiveObject } from "@liveblocks/client";
import {
  pointerEventToCanvasPoint,
  connectionIdToColor,
  resizeBounds,
  findIntersectingLayersWithRectangle,
  penPointsToPathLayer,
  colorToCss,
  mergeMissingLayerIds,
  GRADIENT_PRESETS,
} from "@/lib/utils";

import { Info } from "./info";
import { Participants } from "./participants";
import { Toolbar } from "./toolbar";
import { CursorsPresence } from "./cursors-presence";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { Path } from "./path";
import { CommentsPanel } from "./comments-panel";
import { Loading } from "./loading";
import { ConnectionStatus } from "./connection-status";
import { Minimap } from "./minimap";
import { PdfImporter } from "./pdf-importer";
import { ContextMenu, ContextMenuPosition } from "./context-menu";
import { PresentMode, PresentFrame } from "./present-mode";
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog";
import { BoardSearchDialog } from "./board-search-dialog";
import { LayersPanel } from "./layers-panel";
import { Maximize2, Expand, RotateCcw, Check, Palette, Eye } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Hint } from "@/components/hint";

const MAX_LAYERS = 100;

interface CanvasProps {
  boardId: string;
}

export const Canvas = ({ boardId }: CanvasProps) => {
  const access = useQuery(api.shares.getAccess, { boardId: boardId as never });
  const canWrite = access ? access.canWrite : true;
  const canComment = access ? access.canComment : true;

  const layerIds = useStorage((root) => root.layerIds);
  const liveLayersMap = useStorage((root) => root.layers);
  const offlineSnapshot = useStorage((root) => ({
    layerIds: Array.from(root.layerIds),
    layers: Object.fromEntries(root.layers),
  }));
  const status = useStatus();

  const pencilDraft = useSelf((me) => me.presence.pencilDraft);

  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });

  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });
  const [canvasTheme, setCanvasTheme] = useState<"none" | "grid" | "dots" | "lines">("grid");
  const [canvasBg, setCanvasBg] = useState<string>("#ffffff");
  const [gridColor, setGridColor] = useState<string>("#cbd5e1");

  const getCanvasPatternStyle = useCallback(() => {
    if (canvasTheme === "none") return {};
    if (canvasTheme === "grid") {
      return {
        backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      };
    }
    if (canvasTheme === "dots") {
      return {
        backgroundImage: `radial-gradient(${gridColor} 1.25px, transparent 1.25px)`,
        backgroundSize: "18px 18px",
      };
    }
    if (canvasTheme === "lines") {
      return {
        backgroundImage: `linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
        backgroundSize: "100% 28px",
      };
    }
    return {};
  }, [canvasTheme, gridColor]);

  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
  });
  const [penStrokeWidth, setPenStrokeWidth] = useState(3);

  /* Modal & Panel states */
  const [contextMenuPos, setContextMenuPos] = useState<ContextMenuPosition | null>(null);
  const [isPresenting, setIsPresenting] = useState(false);
  const [presentIndex, setPresentIndex] = useState(0);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLayersOpen, setIsLayersOpen] = useState(false);

  useDisableScrollBounce();
  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const mergeOfflineSnapshot = useMutation(
    ({ storage, setMyPresence }, snapshot: { layerIds: string[]; layers: Record<string, Layer> }) => {
      const liveLayers = storage.get("layers");
      const liveLayerIds = storage.get("layerIds");
      const mergedIds = mergeMissingLayerIds(snapshot.layerIds, liveLayerIds.toImmutable());
      snapshot.layerIds.forEach((id) => {
        const layer = snapshot.layers[id];
        if (layer && !liveLayers.get(id)) liveLayers.set(id, new LiveObject(layer));
      });
      while (liveLayerIds.length) liveLayerIds.delete(0);
      mergedIds.forEach((id) => liveLayerIds.push(id));
      setMyPresence({ selection: [] }, { addToHistory: false });
    },
    []
  );

  useEffect(() => {
    if (status === "connected" || typeof window === "undefined" || !offlineSnapshot?.layerIds.length) return;
    window.localStorage.setItem(`whiteboard-offline-${boardId}`, JSON.stringify(offlineSnapshot));
  }, [boardId, offlineSnapshot, status]);

  const board = useQuery(api.board.get, { id: boardId as Id<"boards"> });
  const templateAppliedRef = useRef(false);

  const applyTemplate = useMutation(({ storage }, templateKey: string) => {
    const templateDef = getTemplateLayers(templateKey);
    if (!templateDef) return;

    const liveLayers = storage.get("layers");
    const liveLayerIds = storage.get("layerIds");

    if (liveLayerIds.length > 0) return;

    templateDef.layerIds.forEach((id) => {
      const layer = templateDef.layers[id];
      if (layer) {
        liveLayers.set(id, new LiveObject(layer));
        liveLayerIds.push(id);
      }
    });
  }, []);

  useEffect(() => {
    if (
      status !== "connected" ||
      !board?.template ||
      templateAppliedRef.current ||
      layerIds == null ||
      layerIds.length > 0
    ) {
      return;
    }
    templateAppliedRef.current = true;
    applyTemplate(board.template);
  }, [applyTemplate, board?.template, layerIds, status]);

  useEffect(() => {
    if (status !== "connected" || typeof window === "undefined") return;
    const raw = window.localStorage.getItem(`whiteboard-offline-${boardId}`);
    if (!raw) return;
    try {
      mergeOfflineSnapshot(JSON.parse(raw));
      window.localStorage.removeItem(`whiteboard-offline-${boardId}`);
    } catch {
      window.localStorage.removeItem(`whiteboard-offline-${boardId}`);
    }
  }, [boardId, mergeOfflineSnapshot, status]);

  /* =======================
     FRAMES & PRESENTATION
     ======================= */
  const frames: PresentFrame[] = useMemo(() => {
    if (!liveLayersMap) return [];
    const list: PresentFrame[] = [];
    liveLayersMap.forEach((layer, id) => {
      if (layer.type === LayerType.Frame) {
        list.push({
          id,
          title: "title" in layer && layer.title ? layer.title : "Frame",
          x: layer.x,
          y: layer.y,
          width: layer.width,
          height: layer.height,
        });
      }
    });
    return list;
  }, [liveLayersMap]);

  const focusOnFrame = useCallback((frame: PresentFrame) => {
    const winW = typeof window !== "undefined" ? window.innerWidth : 1200;
    const winH = typeof window !== "undefined" ? window.innerHeight : 800;
    const zoom = Math.min(
      (winW - 140) / Math.max(frame.width, 100),
      (winH - 140) / Math.max(frame.height, 100),
      1.8
    );
    setCamera({
      zoom,
      x: winW / 2 - (frame.x + frame.width / 2) * zoom,
      y: winH / 2 - (frame.y + frame.height / 2) * zoom,
    });
  }, []);

  const handleNextFrame = useCallback(() => {
    if (frames.length === 0) return;
    const next = (presentIndex + 1) % frames.length;
    setPresentIndex(next);
    focusOnFrame(frames[next]);
  }, [frames, presentIndex, focusOnFrame]);

  const handlePrevFrame = useCallback(() => {
    if (frames.length === 0) return;
    const prev = (presentIndex - 1 + frames.length) % frames.length;
    setPresentIndex(prev);
    focusOnFrame(frames[prev]);
  }, [frames, presentIndex, focusOnFrame]);

  const handleSelectFrameIndex = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < frames.length) {
        setPresentIndex(idx);
        focusOnFrame(frames[idx]);
      }
    },
    [frames, focusOnFrame]
  );

  /* =======================
     INSERT LAYER
     ======================= */
  const insertLayer = useMutation(
    ({ storage, setMyPresence }, layerType: LayerType, position: Point) => {
      const liveLayers = storage.get("layers");
      if (liveLayers.size >= MAX_LAYERS) {
        return;
      }

      const liveLayerIds = storage.get("layerIds");
      const layerId = nanoid();

      let newLayerData: Record<string, unknown> = {
        type: layerType,
        x: position.x,
        y: position.y,
        height: 100,
        width: 100,
        fill: lastUsedColor,
        arrow: layerType === LayerType.ArrowConnector,
      };

      if (layerType === LayerType.Frame) {
        const existingCount = Array.from(liveLayers.values()).filter(
          (l) => l.get("type") === LayerType.Frame
        ).length;
        newLayerData = {
          type: LayerType.Frame,
          x: position.x,
          y: position.y,
          width: 520,
          height: 340,
          title: `Frame ${existingCount + 1}`,
        };
      } else if (layerType === LayerType.Hexagon) {
        newLayerData = {
          type: LayerType.Hexagon,
          x: position.x,
          y: position.y,
          width: 120,
          height: 100,
          fill: lastUsedColor,
        };
      } else if (layerType === LayerType.Callout) {
        newLayerData = {
          type: LayerType.Callout,
          x: position.x,
          y: position.y,
          width: 160,
          height: 100,
          fill: lastUsedColor,
          value: "",
        };
      }

      const layer = new LiveObject<Layer>(newLayerData as Layer);

      liveLayerIds.push(layerId);
      liveLayers.set(layerId, layer);

      setMyPresence({ selection: [layerId] }, { addToHistory: true });
      setCanvasState({ mode: CanvasMode.None });
    },
    [lastUsedColor]
  );

  /* =======================
     LAYER TRANSLATION & RESIZING
     ======================= */
  const translateSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) {
        return;
      }

      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      const liveLayers = storage.get("layers");

      for (const id of self.presence.selection) {
        const layer = liveLayers.get(id);

        if (layer && !layer.get("isLocked")) {
          layer.update({
            x: layer.get("x") + offset.x,
            y: layer.get("y") + offset.y,
          });
        }
      }

      setCanvasState({
        mode: CanvasMode.Translating,
        current: point,
      });
    },
    [canvasState]
  );

  const unselectLayer = useMutation(({ setMyPresence, self }) => {
    if (self.presence.selection.length === 0) {
      return;
    }
    setMyPresence({ selection: [] }, { addToHistory: true });
  }, []);

  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current: Point, origin: Point) => {
      const liveLayers = storage.get("layers");
      if (!liveLayers) return;
      const layers = liveLayers.toImmutable();
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        current,
        origin,
      });

      const ids = findIntersectingLayersWithRectangle(
        layerIds ?? [],
        layers,
        origin,
        current
      );

      setMyPresence({ selection: ids });
    },
    [layerIds]
  );

  const startMultiSelection = useCallback(
    (current: Point, origin: Point) => {
      if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
        setCanvasState({
          mode: CanvasMode.SelectionNet,
          current,
          origin,
        });
      }
    },
    []
  );

  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft } = self.presence;

      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft == null
      ) {
        return;
      }

      setMyPresence({
        cursor: point,
        pencilDraft:
          pencilDraft.length === 1 &&
          pencilDraft[0][0] === point.x &&
          pencilDraft[0][1] === point.y
            ? pencilDraft
            : [...pencilDraft, [point.x, point.y, e.pressure]],
      });
    },
    [canvasState.mode]
  );

  const insertPath = useMutation(({ storage, self, setMyPresence }) => {
    const liveLayers = storage.get("layers");
    const { pencilDraft } = self.presence;

    if (
      pencilDraft == null ||
      pencilDraft.length < 2 ||
      liveLayers.size >= MAX_LAYERS
    ) {
      setMyPresence({ pencilDraft: null });
      return;
    }

    const id = nanoid();
    liveLayers.set(
      id,
      new LiveObject(
        penPointsToPathLayer(pencilDraft, lastUsedColor, penStrokeWidth)
      )
    );

    const liveLayerIds = storage.get("layerIds");
    liveLayerIds.push(id);

    setMyPresence({ pencilDraft: null });
    setCanvasState({ mode: CanvasMode.Pencil });
  }, [lastUsedColor, penStrokeWidth]);

  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]],
        penColor: lastUsedColor,
      });
    },
    [lastUsedColor]
  );

  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }

      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point
      );

      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(self.presence.selection[0]);

      if (layer && !layer.get("isLocked")) {
        layer.update(bounds);
      }
    },
    [canvasState]
  );

  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause();
      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    [history]
  );

  /* =======================
     ROTATION HANDLING
     ======================= */
  const onRotateHandlePointerDown = useCallback(
    (initialBounds: XYWH) => {
      history.pause();
      setCanvasState({
        mode: CanvasMode.Rotating,
        initialAngle: 0,
        center: {
          x: initialBounds.x + initialBounds.width / 2,
          y: initialBounds.y + initialBounds.height / 2,
        },
      });
    },
    [history]
  );

  const rotateSelectedLayer = useMutation(
    ({ storage, self }, point: Point, snap: boolean) => {
      if (canvasState.mode !== CanvasMode.Rotating) return;
      const center = canvasState.center;
      let deg =
        (Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI +
        90;
      if (snap) {
        deg = Math.round(deg / 15) * 15;
      }
      const normalized = Math.round(((deg % 360) + 360) % 360);
      const liveLayers = storage.get("layers");
      self.presence.selection.forEach((id) => {
        const layer = liveLayers.get(id);
        if (layer && !layer.get("isLocked")) {
          layer.update({ rotation: normalized } as never);
        }
      });
    },
    [canvasState]
  );

  /* =======================
     CAMERA & ZOOM
     ======================= */
  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((current) => {
      if (e.ctrlKey) {
        const zoom = Math.min(
          2.5,
          Math.max(0.25, current.zoom - e.deltaY * 0.001)
        );
        return { ...current, zoom };
      }

      return {
        ...current,
        x: current.x - e.deltaX,
        y: current.y - e.deltaY,
      };
    });
  }, []);

  const adjustZoom = useCallback((amount: number) => {
    setCamera((current) => ({
      ...current,
      zoom: Math.min(2.5, Math.max(0.25, current.zoom + amount)),
    }));
  }, []);

  const fitToScreen = useCallback(() => {
    if (!liveLayersMap || liveLayersMap.size === 0) {
      setCamera({ x: 0, y: 0, zoom: 1 });
      return;
    }
    const allLayers = Array.from(liveLayersMap.values());
    const left = Math.min(...allLayers.map((l) => l.x));
    const top = Math.min(...allLayers.map((l) => l.y));
    const right = Math.max(
      ...allLayers.map((l) => l.x + ("width" in l ? l.width : 100))
    );
    const bottom = Math.max(
      ...allLayers.map((l) => l.y + ("height" in l ? l.height : 100))
    );
    const width = Math.max(right - left, 200);
    const height = Math.max(bottom - top, 200);
    const winW = typeof window !== "undefined" ? window.innerWidth : 1200;
    const winH = typeof window !== "undefined" ? window.innerHeight : 800;
    const zoom = Math.min(
      Math.max((winW - 160) / width, 0.2),
      Math.max((winH - 160) / height, 0.2),
      2
    );
    setCamera({
      zoom,
      x: winW / 2 - (left + width / 2) * zoom,
      y: winH / 2 - (top + height / 2) * zoom,
    });
  }, [liveLayersMap]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  /* =======================
     POINTER EVENTS
     ======================= */
  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault();
      if (layerIds == null || status !== "connected") return;

      const current = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Pressing) {
        startMultiSelection(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayer(current);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current);
      } else if (canvasState.mode === CanvasMode.Rotating) {
        rotateSelectedLayer(current, e.shiftKey);
      } else if (canvasState.mode === CanvasMode.Pencil) {
        continueDrawing(current, e);
      }

      setMyPresence({ cursor: current });
    },
    [
      continueDrawing,
      camera,
      canvasState,
      resizeSelectedLayer,
      rotateSelectedLayer,
      translateSelectedLayer,
      startMultiSelection,
      updateSelectionNet,
      layerIds,
      status,
    ]
  );

  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      setContextMenuPos(null);
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Inserting) {
        return;
      }

      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure);
        return;
      }

      setCanvasState({ origin: point, mode: CanvasMode.Pressing });
    },
    [camera, canvasState.mode, startDrawing]
  );

  const onPointerUp = useMutation(
    ({}, e) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        unselectLayer();
        setCanvasState({
          mode: CanvasMode.None,
        });
      } else if (canvasState.mode === CanvasMode.Pencil) {
        insertPath();
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else {
        setCanvasState({
          mode: CanvasMode.None,
        });
      }

      history.resume();
    },
    [camera, canvasState, history, insertLayer, insertPath, unselectLayer]
  );

  const selections = useOthersMapped((other) => other.presence.selection);

  /* =======================
     LAYER POINTER DOWN & GROUPING
     ======================= */
  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence, storage }, e: React.PointerEvent, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      ) {
        return;
      }

      history.pause();
      e.stopPropagation();

      const point = pointerEventToCanvasPoint(e, camera);
      const layers = storage.get("layers");
      const targetLayer = layers.get(layerId);
      const groupId = targetLayer?.get("groupId");

      let toSelect = [layerId];
      if (groupId) {
        const allIds = storage.get("layerIds").toImmutable();
        const groupMembers = allIds.filter(
          (id) => layers.get(id)?.get("groupId") === groupId
        );
        if (groupMembers.length > 0) {
          toSelect = groupMembers;
        }
      }

      if (e.shiftKey) {
        // Shift-click multi-select toggle
        const currentSelection = self.presence.selection ?? [];
        const newSelection = currentSelection.includes(layerId)
          ? currentSelection.filter((id) => !toSelect.includes(id))
          : Array.from(new Set([...currentSelection, ...toSelect]));
        setMyPresence({ selection: newSelection }, { addToHistory: true });
      } else {
        if (!self.presence.selection.includes(layerId)) {
          setMyPresence({ selection: toSelect }, { addToHistory: true });
        }
      }

      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [setCanvasState, camera, history, canvasState.mode]
  );

  const layerIdsToColorSelection = useMemo(() => {
    const map: Record<string, string> = {};
    for (const user of selections) {
      const [connectionId, selection] = user;
      for (const layerId of selection) {
        map[layerId] = connectionIdToColor(connectionId);
      }
    }
    return map;
  }, [selections]);

  const deleteLayers = useDeleteLayers();
  const selection = useSelf((me) => me.presence.selection ?? []) ?? [];
  const liveSelectedLayers = useStorage((root) =>
    selection.map((id) => root.layers.get(id)).filter(Boolean)
  );
  const selectedLayers = useMemo(
    () => liveSelectedLayers ?? [],
    [liveSelectedLayers]
  );

  const isAnyLocked = useMemo(() => {
    return selectedLayers.some(
      (layer) => layer && "isLocked" in layer && layer.isLocked
    );
  }, [selectedLayers]);

  const isAnyGrouped = useMemo(() => {
    return selectedLayers.some(
      (layer) => layer && "groupId" in layer && !!layer.groupId
    );
  }, [selectedLayers]);

  /* =======================
     MUTATIONS FOR CONTEXT MENU & SHORTCUTS
     ======================= */
  const pasteLayers = useMutation(
    ({ storage, setMyPresence }, layers: Layer[]) => {
      const liveLayers = storage.get("layers");
      const liveLayerIds = storage.get("layerIds");
      const pastedIds = layers.map((layer) => {
        const id = nanoid();
        liveLayers.set(
          id,
          new LiveObject({ ...layer, x: layer.x + 24, y: layer.y + 24 })
        );
        liveLayerIds.push(id);
        return id;
      });
      setMyPresence({ selection: pastedIds }, { addToHistory: true });
    },
    []
  );

  const nudgeSelectedLayers = useMutation(
    ({ storage, self }, dx: number, dy: number) => {
      const liveLayers = storage.get("layers");
      for (const id of self.presence.selection) {
        const layer = liveLayers.get(id);
        if (layer && !layer.get("isLocked")) {
          layer.update({
            x: layer.get("x") + dx,
            y: layer.get("y") + dy,
          });
        }
      }
    },
    []
  );

  const selectAllLayers = useMutation(({ storage, setMyPresence }) => {
    setMyPresence(
      { selection: Array.from(storage.get("layerIds").toImmutable()) },
      { addToHistory: true }
    );
  }, []);

  const moveToBack = useMutation(({ storage, self }) => {
    const sel = self.presence.selection ?? [];
    if (sel.length === 0) return;
    const liveLayerIds = storage.get("layerIds");
    const ids = liveLayerIds.toImmutable();
    const selected = ids.filter((id) => sel.includes(id));
    const remaining = ids.filter((id) => !sel.includes(id));
    const newOrder = [...selected, ...remaining];
    while (liveLayerIds.length > 0) liveLayerIds.delete(0);
    newOrder.forEach((id) => liveLayerIds.push(id));
  }, []);

  const moveToFront = useMutation(({ storage, self }) => {
    const sel = self.presence.selection ?? [];
    if (sel.length === 0) return;
    const liveLayerIds = storage.get("layerIds");
    const ids = liveLayerIds.toImmutable();
    const selected = ids.filter((id) => sel.includes(id));
    const remaining = ids.filter((id) => !sel.includes(id));
    const newOrder = [...remaining, ...selected];
    while (liveLayerIds.length > 0) liveLayerIds.delete(0);
    newOrder.forEach((id) => liveLayerIds.push(id));
  }, []);

  const toggleLock = useMutation(({ storage, self }) => {
    const sel = self.presence.selection ?? [];
    const layers = storage.get("layers");
    const anyUnlocked = sel.some((id) => !layers.get(id)?.get("isLocked"));
    sel.forEach((id) => {
      const layer = layers.get(id);
      if (layer) {
        layer.update({ isLocked: anyUnlocked } as never);
      }
    });
  }, []);

  const groupSelection = useMutation(({ storage, self }) => {
    const sel = self.presence.selection ?? [];
    if (sel.length <= 1) return;
    const groupId = nanoid();
    const layers = storage.get("layers");
    sel.forEach((id) => {
      const layer = layers.get(id);
      if (layer) {
        layer.update({ groupId } as never);
      }
    });
  }, []);

  const ungroupSelection = useMutation(({ storage, self }) => {
    const sel = self.presence.selection ?? [];
    const layers = storage.get("layers");
    sel.forEach((id) => {
      const layer = layers.get(id);
      if (layer) {
        layer.update({ groupId: undefined } as never);
      }
    });
  }, []);

  const jumpToLayer = useMutation(
    ({ setMyPresence }, layerId: string) => {
      const layer = liveLayersMap?.get(layerId);
      if (layer) {
        const winW = typeof window !== "undefined" ? window.innerWidth : 1200;
        const winH = typeof window !== "undefined" ? window.innerHeight : 800;
        const w = "width" in layer ? layer.width : 100;
        const h = "height" in layer ? layer.height : 100;
        setCamera({
          zoom: 1,
          x: winW / 2 - (layer.x + w / 2),
          y: winH / 2 - (layer.y + h / 2),
        });
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
      }
    },
    [liveLayersMap]
  );

  /* =======================
     KEYBOARD SHORTCUTS
     ======================= */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;

      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isTyping) return;

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsShortcutsOpen(true);
        return;
      }

      switch (e.key.toLowerCase()) {
        case "f": {
          if (e.ctrlKey) {
            e.preventDefault();
            setIsSearchOpen(true);
          }
          break;
        }
        case "g": {
          if (e.ctrlKey) {
            e.preventDefault();
            if (e.shiftKey) {
              ungroupSelection();
            } else {
              groupSelection();
            }
          }
          break;
        }
        case "v": {
          if (e.ctrlKey) {
            e.preventDefault();
            void navigator.clipboard.readText().then((text) => {
              try {
                const layers = JSON.parse(text) as Layer[];
                if (Array.isArray(layers) && layers.length) pasteLayers(layers);
              } catch {
                // Ignore non-layer clipboard payload
              }
            });
          } else {
            setCanvasState({ mode: CanvasMode.None });
          }
          break;
        }
        case "t":
          setCanvasState({
            mode: CanvasMode.Inserting,
            layerType: LayerType.Text,
          });
          break;
        case "n":
          setCanvasState({
            mode: CanvasMode.Inserting,
            layerType: LayerType.Note,
          });
          break;
        case "r":
          setCanvasState({
            mode: CanvasMode.Inserting,
            layerType: LayerType.Reactangle,
          });
          break;
        case "o":
          setCanvasState({
            mode: CanvasMode.Inserting,
            layerType: LayerType.Ellipse,
          });
          break;
        case "p":
          setCanvasState({ mode: CanvasMode.Pencil });
          break;
        case "l":
          if (e.ctrlKey) {
            e.preventDefault();
            setIsLayersOpen((prev) => !prev);
          } else {
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Connector,
            });
          }
          break;
        case "backspace":
        case "delete": {
          e.preventDefault();
          deleteLayers();
          break;
        }
        case "c": {
          if (!e.ctrlKey || !selectedLayers.length) return;
          e.preventDefault();
          void navigator.clipboard.writeText(JSON.stringify(selectedLayers));
          break;
        }
        case "x": {
          if (!e.ctrlKey || !selectedLayers.length) return;
          e.preventDefault();
          void navigator.clipboard.writeText(JSON.stringify(selectedLayers));
          deleteLayers();
          break;
        }
        case "d": {
          if (!e.ctrlKey || !selectedLayers.length) return;
          e.preventDefault();
          pasteLayers(selectedLayers as Layer[]);
          break;
        }
        case "a": {
          if (!e.ctrlKey) {
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.ArrowConnector,
            });
            break;
          }
          e.preventDefault();
          selectAllLayers();
          break;
        }
        case "y": {
          if (!e.ctrlKey) return;
          e.preventDefault();
          history.redo();
          break;
        }
        case "escape":
          setCanvasState({ mode: CanvasMode.None });
          setContextMenuPos(null);
          break;
        case "arrowup":
          e.preventDefault();
          nudgeSelectedLayers(0, e.shiftKey ? -10 : -2);
          break;
        case "arrowdown":
          e.preventDefault();
          nudgeSelectedLayers(0, e.shiftKey ? 10 : 2);
          break;
        case "arrowleft":
          e.preventDefault();
          nudgeSelectedLayers(e.shiftKey ? -10 : -2, 0);
          break;
        case "arrowright":
          e.preventDefault();
          nudgeSelectedLayers(e.shiftKey ? 10 : 2, 0);
          break;
        case "z": {
          if (!e.ctrlKey) return;
          e.preventDefault();
          if (e.shiftKey) {
            history.redo();
          } else {
            history.undo();
          }
          break;
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [
    deleteLayers,
    groupSelection,
    history,
    nudgeSelectedLayers,
    pasteLayers,
    selectAllLayers,
    selectedLayers,
    ungroupSelection,
  ]);

  if (layerIds == null) {
    return <Loading />;
  }

  return (
    <main
      className="h-full w-full relative touch-none select-none overflow-hidden isolate"
      style={{
        background: canvasBg,
      }}
    >
      {/* Canvas Background Pattern - positioned at -z-10 strictly behind all shapes, notes, and text */}
      {canvasTheme !== "none" && (
        <div
          className="absolute inset-0 pointer-events-none -z-10"
          style={getCanvasPatternStyle()}
        />
      )}
      <Info
        boardId={boardId}
        onPresent={() => {
          setIsPresenting(true);
          setPresentIndex(0);
          if (frames.length > 0) focusOnFrame(frames[0]);
        }}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onToggleLayers={() => setIsLayersOpen((prev) => !prev)}
        isLayersOpen={isLayersOpen}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <ConnectionStatus />
      <PdfImporter camera={camera} />
      <Participants />

      {!canWrite && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/95 px-3.5 py-1 text-xs font-medium text-amber-800 shadow-sm backdrop-blur-md">
          <Eye className="h-3.5 w-3.5 text-amber-600" />
          <span>
            {access?.role === "commenter"
              ? "Commenting mode: Canvas is view-only, comments enabled."
              : "Viewing mode: Canvas and comments are view-only."}
          </span>
        </div>
      )}

      <Toolbar
        canvasState={canvasState}
        setCanvasState={setCanvasState}
        penStrokeWidth={penStrokeWidth}
        setPenStrokeWidth={setPenStrokeWidth}
        canWrite={canWrite}
      />

      {canWrite && <SelectionTools camera={camera} setLastUsedColor={setLastUsedColor} />}

      <svg
        data-board-canvas="true"
        className="h-[100vh] w-[100vw] relative z-0"
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenuPos({ x: e.clientX, y: e.clientY });
        }}
      >
        <defs>
          {GRADIENT_PRESETS.map((grad) => (
            <linearGradient
              id={grad.id}
              key={grad.id}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={grad.from} />
              <stop offset="100%" stopColor={grad.to} />
            </linearGradient>
          ))}
        </defs>
        <g
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
          }}
        >
          {layerIds?.map((layerId) => (
            <LayerPreview
              key={layerId}
              id={layerId}
              onLayerPointerDown={onLayerPointerDown}
              selectionColor={layerIdsToColorSelection[layerId]}
            />
          ))}

          <SelectionBox
            onResizeHandlePointerDown={onResizeHandlePointerDown}
            onRotateHandlePointerDown={onRotateHandlePointerDown}
          />

          {canvasState.mode === CanvasMode.SelectionNet &&
            canvasState.current != null && (
              <rect
                className="stroke-1 fill-blue-500/10 stroke-blue-500"
                x={Math.min(canvasState.origin.x, canvasState.current.x)}
                y={Math.min(canvasState.origin.y, canvasState.current.y)}
                width={Math.abs(canvasState.origin.x - canvasState.current.x)}
                height={Math.abs(canvasState.origin.y - canvasState.current.y)}
                rx={2}
              />
            )}

          <CursorsPresence />

          {pencilDraft != null && pencilDraft.length > 0 && (
            <Path
              points={pencilDraft}
              fill={colorToCss(lastUsedColor)}
              x={0}
              y={0}
              strokeWidth={penStrokeWidth}
            />
          )}
        </g>
      </svg>

      {/* Zoom Bar & Fit to Screen */}
      <div className="absolute bottom-16 right-4 z-20 flex items-center gap-1 rounded-xl border border-neutral-200/80 bg-white/95 p-1 shadow-md backdrop-blur-md md:bottom-4">
        <Hint label="Zoom out" side="top">
          <button
            className="h-8 w-8 rounded-lg text-lg font-medium hover:bg-neutral-100 flex items-center justify-center transition-colors text-neutral-700"
            onClick={() => adjustZoom(-0.1)}
            aria-label="Zoom out"
          >
            -
          </button>
        </Hint>
        <Hint label="Reset to 100%" side="top">
          <button
            className="min-w-14 rounded-lg px-2 py-1 text-xs font-semibold hover:bg-neutral-100 transition-colors text-neutral-800"
            onClick={() => setCamera((current) => ({ ...current, zoom: 1 }))}
            aria-label="Reset zoom"
          >
            {Math.round(camera.zoom * 100)}%
          </button>
        </Hint>
        <Hint label="Zoom in" side="top">
          <button
            className="h-8 w-8 rounded-lg text-lg font-medium hover:bg-neutral-100 flex items-center justify-center transition-colors text-neutral-700"
            onClick={() => adjustZoom(0.1)}
            aria-label="Zoom in"
          >
            +
          </button>
        </Hint>
        <div className="h-4 w-px bg-neutral-200" />
        <Hint label="Fit to screen" side="top">
          <button
            className="h-8 w-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors text-neutral-700"
            onClick={fitToScreen}
            aria-label="Fit to screen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </Hint>
        <Hint label="Toggle fullscreen" side="top">
          <button
            className="h-8 w-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors text-neutral-700"
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
          >
            <Expand className="h-3.5 w-3.5" />
          </button>
        </Hint>
      </div>

      <CommentsPanel
        boardId={boardId}
        canComment={canComment}
        undo={history.undo}
        redo={history.redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <Minimap camera={camera} setCamera={setCamera} />

      {/* Canvas background themes & custom background color/gradient */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-neutral-200/80 bg-white/95 p-1 shadow-md backdrop-blur-md">
        {(["grid", "dots", "lines", "none"] as const).map((theme) => (
          <button
            key={theme}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
              canvasTheme === theme
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
            onClick={() => setCanvasTheme(theme)}
          >
            {theme}
          </button>
        ))}

        <div className="h-4 w-px bg-neutral-200 mx-0.5" />

        {/* Background Color & Grid Color Picker Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Change canvas background and grid color"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-neutral-300 shadow-2xs shrink-0 flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: canvasBg }}
              >
                {canvasTheme !== "none" && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: gridColor }} />
                )}
              </span>
              <span>Canvas Fill</span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 p-3.5 bg-white/98 backdrop-blur-md border border-neutral-200 shadow-2xl rounded-2xl space-y-3 z-50"
            side="top"
            align="center"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <span className="text-xs font-semibold text-neutral-800">
                Canvas & Grid Colors
              </span>
              <button
                onClick={() => {
                  setCanvasBg("#ffffff");
                  setGridColor("#cbd5e1");
                }}
                className="text-[11px] text-neutral-500 hover:text-neutral-900 flex items-center gap-1 font-medium transition-colors cursor-pointer"
                title="Reset to default white with subtle gray grid"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Canvas Background Fill (Solid & Gradient Options) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Canvas Background
                </span>
                <span className="text-[10px] font-mono text-neutral-400 truncate max-w-[150px]">
                  {canvasBg}
                </span>
              </div>

              {/* Solid Presets */}
              <div className="space-y-1">
                <span className="text-[9px] font-medium text-neutral-500">
                  Solid Colors
                </span>
                <div className="grid grid-cols-7 gap-1.5">
                  {[
                    { label: "White", value: "#ffffff" },
                    { label: "Warm Paper", value: "#faf8f5" },
                    { label: "Soft Cream", value: "#fef9c3" },
                    { label: "Pastel Sky", value: "#f0f9ff" },
                    { label: "Pastel Mint", value: "#f0fdf4" },
                    { label: "Lavender", value: "#faf5ff" },
                    { label: "Dark Slate", value: "#0f172a" },
                  ].map((color) => (
                    <button
                      key={color.value}
                      onClick={() => {
                        setCanvasBg(color.value);
                        if (color.value === "#0f172a" && (gridColor === "#cbd5e1" || gridColor === "#e2e8f0")) {
                          setGridColor("rgba(255, 255, 255, 0.2)");
                        } else if (color.value !== "#0f172a" && gridColor === "rgba(255, 255, 255, 0.2)") {
                          setGridColor("#cbd5e1");
                        }
                      }}
                      className="w-8 h-8 rounded-lg border border-neutral-200/90 shadow-2xs hover:scale-105 transition-transform flex items-center justify-center relative cursor-pointer"
                      style={{ background: color.value }}
                      title={color.label}
                    >
                      {canvasBg.toLowerCase() === color.value.toLowerCase() && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            color.value === "#0f172a" ? "text-white" : "text-neutral-800"
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Gradient Presets */}
              <div className="space-y-1">
                <span className="text-[9px] font-medium text-neutral-500">
                  Gradient Presets
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    {
                      name: "Sunset",
                      css: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 50%, #fecdd3 100%)",
                    },
                    {
                      name: "Ocean",
                      css: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)",
                    },
                    {
                      name: "Aurora",
                      css: "linear-gradient(135deg, #dcfce7 0%, #e0e7ff 50%, #f3e8ff 100%)",
                    },
                    {
                      name: "Peach",
                      css: "linear-gradient(135deg, #ffe4e6 0%, #fed7aa 100%)",
                    },
                    {
                      name: "Lavender",
                      css: "linear-gradient(135deg, #ede9fe 0%, #fae8ff 100%)",
                    },
                    {
                      name: "Midnight",
                      css: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
                    },
                  ].map((grad) => (
                    <button
                      key={grad.name}
                      onClick={() => {
                        setCanvasBg(grad.css);
                        if (grad.name === "Midnight") {
                          setGridColor("rgba(255, 255, 255, 0.2)");
                        } else if (gridColor === "rgba(255, 255, 255, 0.2)") {
                          setGridColor("#cbd5e1");
                        }
                      }}
                      className="h-7 rounded-md border border-neutral-200/90 text-[10px] font-medium shadow-2xs hover:scale-102 transition-transform flex items-center justify-center relative px-1.5 text-neutral-800 cursor-pointer overflow-hidden"
                      style={{ background: grad.css }}
                      title={grad.name}
                    >
                      <span className="truncate drop-shadow-xs">{grad.name}</span>
                      {canvasBg === grad.css && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-neutral-900" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Canvas Fill Input */}
              <div className="pt-1 flex items-center gap-2">
                <label className="text-[11px] font-medium text-neutral-600 shrink-0">
                  Custom Fill:
                </label>
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="color"
                    value={canvasBg.startsWith("#") ? canvasBg : "#ffffff"}
                    onChange={(e) => setCanvasBg(e.target.value)}
                    className="w-6 h-6 rounded border border-neutral-200 cursor-pointer p-0 overflow-hidden bg-transparent shrink-0"
                    title="Pick custom color"
                  />
                  <input
                    type="text"
                    value={canvasBg}
                    onChange={(e) => setCanvasBg(e.target.value)}
                    placeholder="#ffffff or linear-gradient(...)"
                    className="flex-1 min-w-0 text-xs border border-neutral-200 rounded-md px-2 py-0.5 font-mono text-neutral-800 outline-none focus:border-neutral-400"
                  />
                </div>
              </div>
            </div>

            {/* Grid Line & Dot Color Section */}
            {canvasTheme !== "none" && (
              <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Grid & Dots Color
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {gridColor}
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {[
                    { label: "Subtle Gray", value: "#cbd5e1" },
                    { label: "Medium Slate", value: "#94a3b8" },
                    { label: "Dark Slate", value: "#475569" },
                    { label: "Charcoal", value: "#1e293b" },
                    { label: "Sky Blue", value: "#38bdf8" },
                    { label: "Violet", value: "#818cf8" },
                    { label: "White Tint", value: "rgba(255, 255, 255, 0.25)" },
                  ].map((color) => (
                    <button
                      key={color.label}
                      onClick={() => setGridColor(color.value)}
                      className="w-8 h-8 rounded-lg border border-neutral-200/90 shadow-2xs hover:scale-105 transition-transform flex items-center justify-center relative cursor-pointer"
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    >
                      {gridColor === color.value && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            color.value === "#1e293b" || color.value === "#475569"
                              ? "text-white"
                              : "text-neutral-800"
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Grid Color Input */}
                <div className="pt-1.5 flex items-center gap-2">
                  <label className="text-[11px] font-medium text-neutral-600 shrink-0">
                    Custom Grid:
                  </label>
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="color"
                      value={gridColor.startsWith("#") ? gridColor : "#cbd5e1"}
                      onChange={(e) => setGridColor(e.target.value)}
                      className="w-6 h-6 rounded border border-neutral-200 cursor-pointer p-0 overflow-hidden bg-transparent shrink-0"
                      title="Pick custom grid/dot color"
                    />
                    <input
                      type="text"
                      value={gridColor}
                      onChange={(e) => setGridColor(e.target.value)}
                      placeholder="#cbd5e1 or rgba(...)"
                      className="flex-1 min-w-0 text-xs border border-neutral-200 rounded-md px-2 py-0.5 font-mono text-neutral-800 outline-none focus:border-neutral-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Right-click Context Menu */}
      <ContextMenu
        position={contextMenuPos}
        onClose={() => setContextMenuPos(null)}
        hasSelection={selection.length > 0}
        isLocked={isAnyLocked}
        isGrouped={isAnyGrouped}
        onCut={() => {
          if (!selectedLayers.length) return;
          void navigator.clipboard.writeText(JSON.stringify(selectedLayers));
          deleteLayers();
        }}
        onCopy={() => {
          if (!selectedLayers.length) return;
          void navigator.clipboard.writeText(JSON.stringify(selectedLayers));
        }}
        onPaste={() => {
          void navigator.clipboard.readText().then((text) => {
            try {
              const layers = JSON.parse(text) as Layer[];
              if (Array.isArray(layers) && layers.length) pasteLayers(layers);
            } catch {
              // Ignore non-layer clipboard content
            }
          });
        }}
        onDuplicate={() => {
          if (selectedLayers.length) pasteLayers(selectedLayers as Layer[]);
        }}
        onBringToFront={moveToFront}
        onSendToBack={moveToBack}
        onGroup={groupSelection}
        onUngroup={ungroupSelection}
        onToggleLock={toggleLock}
        onDelete={deleteLayers}
      />

      {/* Presentation Mode */}
      {isPresenting && (
        <PresentMode
          frames={frames}
          currentIndex={presentIndex}
          onNext={handleNextFrame}
          onPrev={handlePrevFrame}
          onSelectIndex={handleSelectFrameIndex}
          onExit={() => setIsPresenting(false)}
        />
      )}

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Search Dialog */}
      <BoardSearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onJumpToLayer={jumpToLayer}
      />

      {/* Layers Panel */}
      <LayersPanel
        isOpen={isLayersOpen}
        onClose={() => setIsLayersOpen(false)}
        onSelectLayer={jumpToLayer}
      />
    </main>
  );
};