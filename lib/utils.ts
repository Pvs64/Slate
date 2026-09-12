import { clsx, type ClassValue } from "clsx"
import {Camera, Color , Side, Point, XYWH, Layer, PathLayer, LayerType} from "@/types/canvas"
import { twMerge } from "tailwind-merge"

const COLORS = [
  "#DC2626", // red
  "#D97706", // orange
  "#059669", // green
  "#7C3AED", // purple
  "#DB2777", // pink

  "#2563EB", // blue
  "#0D9488", // teal
  "#9333EA", // violet
  "#16A34A", // emerald
  "#EA580C", // deep orange
];


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function connectionIdToColor(connectionId: number): string{
  return COLORS[connectionId % COLORS.length] 
}

export function pointerEventToCanvasPoint(
  e: React.PointerEvent,
  camera: Camera,
){
  return{
    x: (Math.round(e.clientX) - camera.x) / camera.zoom,
    y: (Math.round(e.clientY) - camera.y) / camera.zoom,
  }
}

export const GRADIENT_PRESETS = [
  { id: "grad-sunset", name: "Sunset", css: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)", from: "#f97316", to: "#ec4899", r: 249, g: 115, b: 22 },
  { id: "grad-ocean", name: "Ocean", css: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)", from: "#06b6d4", to: "#3b82f6", r: 6, g: 182, b: 212 },
  { id: "grad-emerald", name: "Emerald", css: "linear-gradient(135deg, #10b981 0%, #065f46 100%)", from: "#10b981", to: "#065f46", r: 16, g: 185, b: 129 },
  { id: "grad-violet", name: "Neon Violet", css: "linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)", from: "#8b5cf6", to: "#d946ef", r: 139, g: 92, b: 246 },
  { id: "grad-amber", name: "Amber Fire", css: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", from: "#f59e0b", to: "#ef4444", r: 245, g: 158, b: 11 },
  { id: "grad-berry", name: "Berry", css: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)", from: "#ec4899", to: "#8b5cf6", r: 236, g: 72, b: 153 },
] as const;

export function hexToRgb(hex: string): Color {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return { r, g, b };
}

export function rgbToHex(color: Color): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

export function colorToCss(color: Color): string {
  if (color.gradient) {
    if (color.gradient.startsWith("grad-")) {
      return `url(#${color.gradient})`;
    }
    return color.gradient;
  }
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

export function colorToBackgroundCss(color: Color): string {
  if (color.gradient) {
    const preset = GRADIENT_PRESETS.find((p) => p.id === color.gradient);
    if (preset) return preset.css;
    return color.gradient;
  }
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

export function resizeBounds(
  bounds: XYWH,
  corner: Side,
  point: Point
):XYWH{
  const result = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  }

  if((corner & Side.Left) === Side.Left){
    result.x = Math.min(point.x, bounds.x + bounds.width);
    result.width = Math.abs(bounds.x + bounds.width - point.x);
  }

  if ((corner & Side.Right) === Side.Right){
    result.width = Math.min(point.x, bounds.x);
    result.width = Math.abs(point.x - bounds.x);
  }

  if ((corner & Side.Top) === Side.Top){
    result.y = Math.min(point.y, bounds.y + bounds.height);
    result.height = Math.abs(bounds.y + bounds.height - point.y);
  }

  if ((corner & Side.Bottom) === Side.Bottom){
    result.y = Math.min(point.y, bounds.y);
    result.height = Math.abs(point.y - bounds.y);
  }

  return result;
}

export function  findIntersectingLayersWithRectangle(
  layerIds: readonly string[],
  layers: ReadonlyMap<string, Layer>,
  a: Point,
  b: Point,
){
   const rect = {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),

   };

   const ids = [];

   for (const layerId of layerIds){
    const layer = layers.get(layerId);

    if (layer == null){
      continue;
    }

    const {x,y,height,width} = layer;

    if(
      rect.x + rect.width >= x &&
      rect.x <= x + width &&
      rect.y + rect.height >= y &&
      rect.y <= y + height
    ){
      ids.push(layerId);
   }

  }

  return ids;
}

export function getContrastingTextColor(color: Color) {
  const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;

  return luminance > 182 ? "black" : "white";
}

export function mergeMissingLayerIds(localIds: readonly string[], remoteIds: readonly string[]) {
  const merged = [...remoteIds];
  const existing = new Set(remoteIds);
  for (const id of localIds) {
    if (!existing.has(id)) {
      merged.push(id);
      existing.add(id);
    }
  }
  return merged;
}

export function penPointsToPathLayer(
  points: number[][],
  color: Color,
  strokeWidth: number = 3,
): PathLayer{
   if(points.length < 2){
      throw new Error("Cannot transform points with less than 2 points")
   }

   let left = Number.POSITIVE_INFINITY;
   let top = Number.POSITIVE_INFINITY;
   let right = Number.NEGATIVE_INFINITY;
   let bottom = Number.NEGATIVE_INFINITY;

   for (const point of points){
    const [x,y] = point;

    if (x < left) left = x;
    if (y < top) top = y;
    if (x > right) right = x;
    if (y > bottom) bottom = y;

   }

   return{
    type: LayerType.Path,
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    fill : color,
    points: points
     .map(([x,y,pressure])=> [x - left, y - top, pressure]),
    strokeWidth,
   }
}

export function getSvgPathFromStroke(stroke: number[][]){
  if(!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"],
  )

  d.push("Z");

  return d.join(" ");
}