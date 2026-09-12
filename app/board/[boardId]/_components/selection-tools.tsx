"use client";

import { memo } from "react";
import { Camera, Color, LayerType } from "@/types/canvas";
import { Button } from "@/components/ui/button";
import { useMutation, useSelf, useStorage } from "@/liveblocks.config";
import { useSelectionBounds } from "@/hooks/use-selection-bounds";
import { ColorPicker } from "./color-picker";
import { useDeleteLayers } from "@/hooks/use-delete-layers";
import { Hint } from "@/components/hint";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { colorToBackgroundCss, colorToCss } from "@/lib/utils";
import { nanoid } from "nanoid";
import { LiveObject } from "@liveblocks/client";
import {
  BringToFront,
  SendToBack,
  Trash2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Lock,
  Unlock,
  CopyPlus,
  Group,
  Ungroup,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
} from "lucide-react";

interface SelectionToolsProps {
  camera: Camera;
  setLastUsedColor: (color: Color) => void;
}

const FONT_FAMILIES = [
  "Inter",
  "Roboto",
  "Arial",
  "Poppins",
  "Montserrat",
  "Playfair Display",
  "JetBrains Mono",
  "Fira Code",
  "Comic Neue",
  "Kalam",
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 64, 96];

export const SelectionTools = memo(
  ({ camera, setLastUsedColor }: SelectionToolsProps) => {
    const selection = useSelf(
      (me) => me.presence.selection ?? []
    ) as string[];

    /* =======================
       MOVE TO BACK / FRONT
       ======================= */
    const moveToBack = useMutation(
      ({ storage }) => {
        if (selection.length === 0) return;
        const layerIds = storage.get("layerIds");
        const ids = layerIds.toImmutable();

        const selected = ids.filter((id) => selection.includes(id));
        const remaining = ids.filter((id) => !selection.includes(id));

        const newOrder = [...selected, ...remaining];

        while (layerIds.length > 0) {
          layerIds.delete(0);
        }

        newOrder.forEach((id) => {
          layerIds.push(id);
        });
      },
      [selection]
    );

    const moveToFront = useMutation(
      ({ storage }) => {
        if (selection.length === 0) return;
        const layerIds = storage.get("layerIds");
        const ids = layerIds.toImmutable();

        const selected = ids.filter((id) => selection.includes(id));
        const remaining = ids.filter((id) => !selection.includes(id));

        const newOrder = [...remaining, ...selected];

        while (layerIds.length > 0) {
          layerIds.delete(0);
        }

        newOrder.forEach((id) => {
          layerIds.push(id);
        });
      },
      [selection]
    );

    /* =======================
       FILL & BORDER
       ======================= */
    const setFill = useMutation(
      ({ storage }, fill: Color) => {
        const layers = storage.get("layers");
        setLastUsedColor(fill);

        selection.forEach((id) => {
          layers.get(id)?.set("fill", fill);
        });
      },
      [selection, setLastUsedColor]
    );

    const setBorderColor = useMutation(
      ({ storage }, borderColor: Color) => {
        const layers = storage.get("layers");
        selection.forEach((id) => {
          const layer = layers.get(id);
          if (layer) {
            const currentWidth = layer.get("borderWidth");
            const finalWidth = currentWidth == null || currentWidth === 0 ? 2 : currentWidth;
            layer.update({ borderColor, borderWidth: finalWidth } as never);
          }
        });
      },
      [selection]
    );

    const setBorderWidth = useMutation(
      ({ storage }, borderWidth: number) => {
        const layers = storage.get("layers");
        selection.forEach((id) => {
          const layer = layers.get(id);
          if (layer) {
            const currentColor = layer.get("borderColor") || { r: 0, g: 0, b: 0 };
            layer.update({ borderWidth, borderColor: currentColor } as never);
          }
        });
      },
      [selection]
    );

    const setOpacity = useMutation(
      ({ storage }, opacity: number) => {
        const layers = storage.get("layers");
        selection.forEach((id) => {
          const layer = layers.get(id);
          if (layer) {
            layer.update({ opacity } as never);
          }
        });
      },
      [selection]
    );

    /* =======================
       LOCK / UNLOCK
       ======================= */
    const toggleLock = useMutation(
      ({ storage }) => {
        const layers = storage.get("layers");
        const anyUnlocked = selection.some((id) => !layers.get(id)?.get("isLocked"));
        selection.forEach((id) => {
          const layer = layers.get(id);
          if (layer) {
            layer.update({ isLocked: anyUnlocked } as never);
          }
        });
      },
      [selection]
    );

    /* =======================
       DUPLICATE
       ======================= */
    const duplicateSelection = useMutation(
      ({ storage, setMyPresence }) => {
        if (selection.length === 0) return;
        const layers = storage.get("layers");
        const layerIds = storage.get("layerIds");
        const newIds: string[] = [];

        selection.forEach((id) => {
          const layer = layers.get(id);
          if (layer) {
            const newId = nanoid();
            const raw = layer.toImmutable();
            layers.set(
              newId,
              new LiveObject({
                ...raw,
                x: raw.x + 24,
                y: raw.y + 24,
              })
            );
            layerIds.push(newId);
            newIds.push(newId);
          }
        });

        setMyPresence({ selection: newIds }, { addToHistory: true });
      },
      [selection]
    );

    /* =======================
       GROUP / UNGROUP
       ======================= */
    const groupSelection = useMutation(
      ({ storage }) => {
        if (selection.length <= 1) return;
        const groupId = nanoid();
        const layers = storage.get("layers");
        selection.forEach((id) => {
          const layer = layers.get(id);
          if (layer) {
            layer.update({ groupId } as never);
          }
        });
      },
      [selection]
    );

    const ungroupSelection = useMutation(
      ({ storage }) => {
        const layers = storage.get("layers");
        selection.forEach((id) => {
          const layer = layers.get(id);
          if (layer) {
            layer.update({ groupId: undefined } as never);
          }
        });
      },
      [selection]
    );

    /* =======================
       ALIGNMENT
       ======================= */
    const alignSelection = useMutation(
      (
        { storage },
        direction: "left" | "center" | "right" | "top" | "middle" | "bottom"
      ) => {
        if (selection.length <= 1) return;
        const layers = storage.get("layers");
        const selected = selection.map((id) => layers.get(id)).filter(Boolean);
        if (!selected.length) return;

        const minX = Math.min(...selected.map((l) => l!.get("x")));
        const maxX = Math.max(
          ...selected.map((l) => l!.get("x") + (l!.get("width") || 0))
        );
        const minY = Math.min(...selected.map((l) => l!.get("y")));
        const maxY = Math.max(
          ...selected.map((l) => l!.get("y") + (l!.get("height") || 0))
        );

        selected.forEach((l) => {
          if (!l) return;
          const w = l.get("width") || 0;
          const h = l.get("height") || 0;
          if (direction === "left") l.update({ x: minX });
          else if (direction === "center")
            l.update({ x: minX + (maxX - minX) / 2 - w / 2 });
          else if (direction === "right") l.update({ x: maxX - w });
          else if (direction === "top") l.update({ y: minY });
          else if (direction === "middle")
            l.update({ y: minY + (maxY - minY) / 2 - h / 2 });
          else if (direction === "bottom") l.update({ y: maxY - h });
        });
      },
      [selection]
    );

    /* =======================
       DISTRIBUTION
       ======================= */
    const distributeSelection = useMutation(
      ({ storage }, axis: "horizontal" | "vertical") => {
        if (selection.length <= 2) return;
        const layers = storage.get("layers");
        const selected = selection
          .map((id) => layers.get(id))
          .filter(Boolean) as (NonNullable<ReturnType<typeof layers.get>>)[];
        if (selected.length <= 2) return;

        if (axis === "horizontal") {
          selected.sort((a, b) => a.get("x") - b.get("x"));
          const firstX = selected[0].get("x");
          const last = selected[selected.length - 1];
          const totalWidth = last.get("x") + (last.get("width") || 0) - firstX;
          const shapesWidth = selected.reduce(
            (sum, l) => sum + (l.get("width") || 0),
            0
          );
          const gap = (totalWidth - shapesWidth) / (selected.length - 1);
          let currentX = firstX;
          selected.forEach((l) => {
            l.update({ x: currentX });
            currentX += (l.get("width") || 0) + gap;
          });
        } else {
          selected.sort((a, b) => a.get("y") - b.get("y"));
          const firstY = selected[0].get("y");
          const last = selected[selected.length - 1];
          const totalHeight =
            last.get("y") + (last.get("height") || 0) - firstY;
          const shapesHeight = selected.reduce(
            (sum, l) => sum + (l.get("height") || 0),
            0
          );
          const gap = (totalHeight - shapesHeight) / (selected.length - 1);
          let currentY = firstY;
          selected.forEach((l) => {
            l.update({ y: currentY });
            currentY += (l.get("height") || 0) + gap;
          });
        }
      },
      [selection]
    );

    /* =======================
       NUDGE SELECTION
       ======================= */
    const nudge = useMutation(
      ({ storage }, dx: number, dy: number) => {
        const layers = storage.get("layers");
        selection.forEach((id) => {
          const layer = layers.get(id);
          if (layer && !layer.get("isLocked")) {
            layer.update({
              x: layer.get("x") + dx,
              y: layer.get("y") + dy,
            });
          }
        });
      },
      [selection]
    );

    const deleteLayers = useDeleteLayers();
    const selectionBounds = useSelectionBounds();

    const selectedLayer = useStorage((root) =>
      selection.length === 1 ? root.layers.get(selection[0]) : undefined
    );

    const isAnyLocked = useStorage((root) =>
      selection.some((id) => root.layers.get(id)?.isLocked)
    );

    const isAnyGrouped = useStorage((root) =>
      selection.some((id) => !!root.layers.get(id)?.groupId)
    );

    const updateTextStyle = useMutation(
      ({ storage }, property: string, value: string | number) => {
        const layer =
          selection.length === 1
            ? storage.get("layers").get(selection[0])
            : undefined;
        if (
          layer &&
          (layer.get("type") === LayerType.Text ||
            layer.get("type") === LayerType.Note)
        ) {
          layer.update({ [property]: value } as never);
        }
      },
      [selection]
    );

    const updateConnectorProperty = useMutation(
      ({ storage }, property: string, value: unknown) => {
        const layers = storage.get("layers");
        selection.forEach((id) => {
          const layer = layers.get(id);
          if (
            layer &&
            (layer.get("type") === LayerType.Connector ||
              layer.get("type") === LayerType.ArrowConnector)
          ) {
            layer.update({ [property]: value } as never);
          }
        });
      },
      [selection]
    );

    const updatePathWidth = useMutation(
      ({ storage }, strokeWidth: number) => {
        const layers = storage.get("layers");
        selection.forEach((id) => {
          const layer = layers.get(id);
          if (layer && layer.get("type") === LayerType.Path) {
            layer.update({ strokeWidth } as never);
          }
        });
      },
      [selection]
    );

    const formatSelection = (command: string, value?: string) => {
      if (
        !selectedLayer ||
        (selectedLayer.type !== LayerType.Text &&
          selectedLayer.type !== LayerType.Note)
      )
        return;
      document.execCommand(command, false, value);
    };

    if (!selectionBounds) return null;

    const x =
      (selectionBounds.width / 2 + selectionBounds.x) * camera.zoom + camera.x;
    const y = selectionBounds.y * camera.zoom + camera.y;

    const isConnector =
      selectedLayer &&
      (selectedLayer.type === LayerType.Connector ||
        selectedLayer.type === LayerType.ArrowConnector);

    const isTextOrNote =
      selectedLayer &&
      (selectedLayer.type === LayerType.Text ||
        selectedLayer.type === LayerType.Note);

    return (
      <div
        className="absolute z-30 flex max-w-[calc(100vw-16px)] select-none items-center gap-1.5 overflow-x-auto rounded-xl border border-neutral-200/80 bg-white/95 p-2 shadow-lg backdrop-blur-md no-scrollbar"
        style={{
          transform: `translate(
            calc(${x}px - 50%),
            calc(${y - 16}px - 100%)
          )`,
        }}
      >
        {/* Fill Color Picker Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-xs"
              aria-label="Fill color"
            >
              <span
                className="h-4 w-4 rounded-full border border-neutral-300 shadow-xs"
                style={{
                  background: selectedLayer?.fill
                    ? colorToBackgroundCss(selectedLayer.fill)
                    : "#3b82f6",
                }}
              />
              <span className="hidden sm:inline">Fill</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <ColorPicker onChange={setFill} currentColor={selectedLayer?.fill} />
          </PopoverContent>
        </Popover>

        {/* Border Color & Width Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 shadow-xs"
              aria-label="Border style"
            >
              <span
                className="h-4 w-4 rounded-md border-2 shadow-xs"
                style={{
                  borderColor: selectedLayer?.borderColor
                    ? colorToCss(selectedLayer.borderColor)
                    : "#94a3b8",
                }}
              />
              <span className="hidden sm:inline">Border</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3 flex flex-col gap-3" align="start">
            <div>
              <div className="text-xs font-medium text-neutral-600 mb-1">Border Color</div>
              <ColorPicker
                onChange={setBorderColor}
                currentColor={selectedLayer?.borderColor}
              />
            </div>
            <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
              <span className="text-xs text-neutral-600 font-medium">Border Width:</span>
              <select
                className="h-7 rounded border border-neutral-200 bg-white px-2 text-xs font-medium"
                value={selectedLayer?.borderWidth ?? 1}
                onChange={(e) => setBorderWidth(Number(e.target.value))}
              >
                <option value={0}>None (0px)</option>
                <option value={1}>1px</option>
                <option value={2}>2px</option>
                <option value={4}>4px</option>
                <option value={6}>6px</option>
                <option value={8}>8px</option>
              </select>
            </div>
          </PopoverContent>
        </Popover>

        {/* Opacity Select */}
        <select
          className="h-7 rounded-lg border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-700 shadow-xs hover:bg-neutral-50"
          value={
            selectedLayer?.opacity != null
              ? Math.round(selectedLayer.opacity * 100)
              : 100
          }
          onChange={(e) => setOpacity(Number(e.target.value) / 100)}
          aria-label="Opacity"
        >
          <option value={100}>100%</option>
          <option value={75}>75%</option>
          <option value={50}>50%</option>
          <option value={25}>25%</option>
        </select>

        <div className="h-5 w-px bg-neutral-200" />

        {/* Directional Nudge Buttons */}
        <div className="flex items-center gap-0.5">
          <Hint label="Move left (10px)" side="bottom">
            <Button
              onClick={() => nudge(-10, 0)}
              variant="board"
              size="icon"
              className="h-7 w-7"
              aria-label="Move left"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
          </Hint>
          <div className="flex flex-col gap-0.5">
            <Hint label="Move up (10px)" side="top">
              <Button
                onClick={() => nudge(0, -10)}
                variant="board"
                size="icon"
                className="h-3.5 w-7 p-0"
                aria-label="Move up"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
            </Hint>
            <Hint label="Move down (10px)" side="bottom">
              <Button
                onClick={() => nudge(0, 10)}
                variant="board"
                size="icon"
                className="h-3.5 w-7 p-0"
                aria-label="Move down"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </Hint>
          </div>
          <Hint label="Move right (10px)" side="bottom">
            <Button
              onClick={() => nudge(10, 0)}
              variant="board"
              size="icon"
              className="h-7 w-7"
              aria-label="Move right"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Hint>
        </div>

        {/* Text styling tools */}
        {isTextOrNote && (
          <>
            <div className="h-5 w-px bg-neutral-200" />
            <div className="flex items-center gap-1">
              <select
                className="h-7 rounded-lg border border-neutral-200 bg-white px-1.5 text-xs font-medium text-neutral-700 shadow-xs"
                value={selectedLayer.fontFamily || "Inter"}
                onChange={(event) => {
                  updateTextStyle("fontFamily", event.target.value);
                  formatSelection("fontName", event.target.value);
                }}
                aria-label="Font family"
              >
                {FONT_FAMILIES.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>

              <select
                className="h-7 w-14 rounded-lg border border-neutral-200 bg-white px-1 text-xs font-medium text-neutral-700 shadow-xs"
                value={selectedLayer.fontSize || 20}
                onChange={(event) =>
                  updateTextStyle("fontSize", Number(event.target.value))
                }
                aria-label="Font size"
              >
                {FONT_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              <Hint label="Bold">
                <Button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => formatSelection("bold")}
                  variant="board"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Bold"
                >
                  <Bold className="h-3.5 w-3.5" />
                </Button>
              </Hint>
              <Hint label="Italic">
                <Button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => formatSelection("italic")}
                  variant="board"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Italic"
                >
                  <Italic className="h-3.5 w-3.5" />
                </Button>
              </Hint>
              <Hint label="Underline">
                <Button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => formatSelection("underline")}
                  variant="board"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Underline"
                >
                  <Underline className="h-3.5 w-3.5" />
                </Button>
              </Hint>
              <Hint label="Align left">
                <Button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    updateTextStyle("textAlign", "left");
                    formatSelection("justifyLeft");
                  }}
                  variant="board"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Align left"
                >
                  <AlignLeft className="h-3.5 w-3.5" />
                </Button>
              </Hint>
              <Hint label="Align center">
                <Button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    updateTextStyle("textAlign", "center");
                    formatSelection("justifyCenter");
                  }}
                  variant="board"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Align center"
                >
                  <AlignCenter className="h-3.5 w-3.5" />
                </Button>
              </Hint>
              <Hint label="Align right">
                <Button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    updateTextStyle("textAlign", "right");
                    formatSelection("justifyRight");
                  }}
                  variant="board"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Align right"
                >
                  <AlignRight className="h-3.5 w-3.5" />
                </Button>
              </Hint>
            </div>
          </>
        )}

        {/* Connector / Arrow controls */}
        {isConnector && (
          <>
            <div className="h-5 w-px bg-neutral-200" />
            <div className="flex items-center gap-1.5">
              <select
                className="h-7 rounded-lg border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-700 shadow-xs"
                value={"style" in selectedLayer && selectedLayer.style ? selectedLayer.style : "straight"}
                onChange={(e) => updateConnectorProperty("style", e.target.value)}
                aria-label="Connector line style"
              >
                <option value="straight">Straight</option>
                <option value="elbow">Elbow</option>
                <option value="curved">Curved</option>
              </select>

              <select
                className="h-7 rounded-lg border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-700 shadow-xs"
                value={selectedLayer.strokeWidth || 3}
                onChange={(e) =>
                  updateConnectorProperty("strokeWidth", Number(e.target.value))
                }
                aria-label="Connector thickness"
              >
                {[1, 2, 3, 4, 6, 8, 10].map((t) => (
                  <option key={t} value={t}>
                    {t}px
                  </option>
                ))}
              </select>

              <Hint label="Start Arrow">
                <Button
                  onClick={() =>
                    updateConnectorProperty(
                      "arrowStart",
                      !("arrowStart" in selectedLayer && selectedLayer.arrowStart)
                    )
                  }
                  variant={
                    "arrowStart" in selectedLayer && selectedLayer.arrowStart
                      ? "boardActive"
                      : "board"
                  }
                  size="icon"
                  className="h-7 w-7 text-xs font-bold"
                  aria-label="Toggle start arrow"
                >
                  ◀
                </Button>
              </Hint>

              <Hint label="End Arrow">
                <Button
                  onClick={() =>
                    updateConnectorProperty(
                      "arrowEnd",
                      !("arrowEnd" in selectedLayer && selectedLayer.arrowEnd)
                    )
                  }
                  variant={
                    "arrowEnd" in selectedLayer && selectedLayer.arrowEnd
                      ? "boardActive"
                      : "board"
                  }
                  size="icon"
                  className="h-7 w-7 text-xs font-bold"
                  aria-label="Toggle end arrow"
                >
                  ▶
                </Button>
              </Hint>
            </div>
          </>
        )}

        {/* Freehand Pen width */}
        {selectedLayer && selectedLayer.type === LayerType.Path && (
          <>
            <div className="h-5 w-px bg-neutral-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-neutral-600 font-medium">Width:</span>
              <select
                className="h-7 rounded-lg border border-neutral-200 bg-white px-2 text-xs font-medium"
                value={selectedLayer.strokeWidth || 3}
                onChange={(e) => updatePathWidth(Number(e.target.value))}
                aria-label="Pen stroke width"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((w) => (
                  <option key={w} value={w}>
                    {w}px
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Multi-selection Grouping & Alignment tools */}
        {selection.length > 1 && (
          <>
            <div className="h-5 w-px bg-neutral-200" />
            <div className="flex items-center gap-1">
              <Hint label="Group (Ctrl+G)">
                <Button
                  onClick={groupSelection}
                  variant="board"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Group selection"
                >
                  <Group className="h-3.5 w-3.5" />
                </Button>
              </Hint>

              {isAnyGrouped && (
                <Hint label="Ungroup (Ctrl+Shift+G)">
                  <Button
                    onClick={ungroupSelection}
                    variant="board"
                    size="icon"
                    className="h-7 w-7"
                    aria-label="Ungroup selection"
                  >
                    <Ungroup className="h-3.5 w-3.5" />
                  </Button>
                </Hint>
              )}

              {/* Alignments */}
              <Hint label="Align left">
                <Button
                  onClick={() => alignSelection("left")}
                  variant="board"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Align left"
                >
                  <AlignStartHorizontal className="h-3.5 w-3.5" />
                </Button>
              </Hint>
              <Hint label="Align center">
                <Button
                  onClick={() => alignSelection("center")}
                  variant="board"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Align center"
                >
                  <AlignCenterHorizontal className="h-3.5 w-3.5" />
                </Button>
              </Hint>
              <Hint label="Align right">
                <Button
                  onClick={() => alignSelection("right")}
                  variant="board"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Align right"
                >
                  <AlignEndHorizontal className="h-3.5 w-3.5" />
                </Button>
              </Hint>
              <Hint label="Align top">
                <Button
                  onClick={() => alignSelection("top")}
                  variant="board"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Align top"
                >
                  <AlignStartVertical className="h-3.5 w-3.5" />
                </Button>
              </Hint>
              <Hint label="Align middle">
                <Button
                  onClick={() => alignSelection("middle")}
                  variant="board"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Align middle"
                >
                  <AlignCenterVertical className="h-3.5 w-3.5" />
                </Button>
              </Hint>
              <Hint label="Align bottom">
                <Button
                  onClick={() => alignSelection("bottom")}
                  variant="board"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Align bottom"
                >
                  <AlignEndVertical className="h-3.5 w-3.5" />
                </Button>
              </Hint>

              {selection.length > 2 && (
                <>
                  <Hint label="Distribute horizontally">
                    <Button
                      onClick={() => distributeSelection("horizontal")}
                      variant="board"
                      size="icon"
                      className="h-7 w-7"
                      aria-label="Distribute horizontally"
                    >
                      <AlignHorizontalDistributeCenter className="h-3.5 w-3.5" />
                    </Button>
                  </Hint>
                  <Hint label="Distribute vertically">
                    <Button
                      onClick={() => distributeSelection("vertical")}
                      variant="board"
                      size="icon"
                      className="h-7 w-7"
                      aria-label="Distribute vertically"
                    >
                      <AlignVerticalDistributeCenter className="h-3.5 w-3.5" />
                    </Button>
                  </Hint>
                </>
              )}
            </div>
          </>
        )}

        <div className="h-5 w-px bg-neutral-200" />

        {/* Lock, Duplicate, Layer order & delete */}
        <div className="flex items-center gap-1">
          <Hint label={isAnyLocked ? "Unlock layer" : "Lock layer"}>
            <Button
              onClick={toggleLock}
              variant={isAnyLocked ? "boardActive" : "board"}
              size="icon"
              className="h-7 w-7"
              aria-label={isAnyLocked ? "Unlock" : "Lock"}
            >
              {isAnyLocked ? (
                <Lock className="h-3.5 w-3.5 text-amber-600" />
              ) : (
                <Unlock className="h-3.5 w-3.5" />
              )}
            </Button>
          </Hint>

          <Hint label="Duplicate (Ctrl+D)">
            <Button
              onClick={duplicateSelection}
              variant="board"
              size="icon"
              className="h-7 w-7"
              aria-label="Duplicate"
            >
              <CopyPlus className="h-3.5 w-3.5" />
            </Button>
          </Hint>

          <Hint label="Bring to front">
            <Button
              onClick={moveToFront}
              variant="board"
              size="icon"
              className="h-7 w-7"
              aria-label="Bring to front"
            >
              <BringToFront className="h-3.5 w-3.5" />
            </Button>
          </Hint>

          <Hint label="Send to back">
            <Button
              onClick={moveToBack}
              variant="board"
              size="icon"
              className="h-7 w-7"
              aria-label="Send to back"
            >
              <SendToBack className="h-3.5 w-3.5" />
            </Button>
          </Hint>

          <Hint label="Delete">
            <Button
              onClick={deleteLayers}
              variant="board"
              size="icon"
              className="h-7 w-7"
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-600" />
            </Button>
          </Hint>
        </div>
      </div>
    );
  }
);

SelectionTools.displayName = "SelectionTools";
