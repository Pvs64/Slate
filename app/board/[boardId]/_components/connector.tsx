"use client";

import { useMemo } from "react";
import { colorToCss } from "@/lib/utils";
import { ConnectorLayer } from "@/types/canvas";
import { useStorage } from "@/liveblocks.config";

interface ConnectorProps {
  id: string;
  layer: ConnectorLayer;
  onPointerDown: (event: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

export const Connector = ({ id, layer, onPointerDown, selectionColor }: ConnectorProps) => {
  const markerEndId = `arrow-end-${id}`;
  const markerStartId = `arrow-start-${id}`;
  const thickness = Math.max(1, Math.min(20, layer.strokeWidth || 3));
  const markerDim = Math.max(6, thickness * 2.5);

  const boundLayers = useStorage((root) => {
    const start = layer.startLayerId ? root.layers.get(layer.startLayerId) : null;
    const end = layer.endLayerId ? root.layers.get(layer.endLayerId) : null;
    return { start, end };
  });

  const { startPoint, endPoint } = useMemo(() => {
    if (boundLayers?.start && boundLayers?.end) {
      // Connect between centers of bound shapes relative to layer.x / layer.y
      const s = boundLayers.start;
      const e = boundLayers.end;
      return {
        startPoint: { x: s.x + s.width / 2 - layer.x, y: s.y + s.height / 2 - layer.y },
        endPoint: { x: e.x + e.width / 2 - layer.x, y: e.y + e.height / 2 - layer.y },
      };
    }
    if (layer.startPoint && layer.endPoint) {
      return {
        startPoint: layer.startPoint,
        endPoint: layer.endPoint,
      };
    }
    return {
      startPoint: { x: 0, y: 0 },
      endPoint: { x: Math.max(10, layer.width), y: Math.max(10, layer.height) },
    };
  }, [boundLayers, layer.height, layer.width, layer.x, layer.y, layer.startPoint, layer.endPoint]);

  const pathD = useMemo(() => {
    const { x: x1, y: y1 } = startPoint;
    const { x: x2, y: y2 } = endPoint;
    const style = layer.style || "straight";

    if (style === "elbow") {
      const dx = Math.abs(x2 - x1);
      const dy = Math.abs(y2 - y1);
      if (dy < 5) {
        const midX = (x1 + x2) / 2;
        const stepY = Math.max(25, Math.min(50, dx * 0.3));
        return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y1 + stepY} L ${x2} ${y1 + stepY}`;
      }
      if (dx < 5) {
        const midY = (y1 + y2) / 2;
        const stepX = Math.max(25, Math.min(50, dy * 0.3));
        return `M ${x1} ${y1} L ${x1 + stepX} ${midY} L ${x1 + stepX} ${y2} L ${x2} ${y2}`;
      }
      if (dx >= dy) {
        const midX = (x1 + x2) / 2;
        return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
      } else {
        const midY = (y1 + y2) / 2;
        return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
      }
    }

    if (style === "curved") {
      const dx = Math.abs(x2 - x1);
      const dy = Math.abs(y2 - y1);
      if (dy < 5) {
        const arcY = Math.max(30, dx * 0.25);
        return `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1 - arcY}, ${x2} ${y2}`;
      }
      if (dx < 5) {
        const arcX = Math.max(30, dy * 0.25);
        return `M ${x1} ${y1} Q ${x1 + arcX} ${(y1 + y2) / 2}, ${x2} ${y2}`;
      }
      if (dx >= dy) {
        const offset = (x2 - x1) * 0.5;
        return `M ${x1} ${y1} C ${x1 + offset} ${y1}, ${x2 - offset} ${y2}, ${x2} ${y2}`;
      } else {
        const offset = (y2 - y1) * 0.5;
        return `M ${x1} ${y1} C ${x1} ${y1 + offset}, ${x2} ${y2 - offset}, ${x2} ${y2}`;
      }
    }

    // Default straight
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }, [endPoint, layer.style, startPoint]);

  const strokeColor = selectionColor || colorToCss(layer.fill);
  const showEndArrow =
    layer.arrowEnd !== undefined
      ? Boolean(layer.arrowEnd)
      : layer.arrow !== false;
  const showStartArrow = Boolean(layer.arrowStart);

  return (
    <g
      onPointerDown={(event) => onPointerDown(event, id)}
      style={{ transform: `translate(${layer.x}px, ${layer.y}px)` }}
      className="cursor-pointer"
    >
      <defs>
        {showEndArrow && (
          <marker
            id={markerEndId}
            markerWidth={markerDim}
            markerHeight={markerDim}
            refX={markerDim * 0.85}
            refY={markerDim / 2}
            orient="auto"
          >
            <path
              d={`M0,0 L${markerDim},${markerDim / 2} L0,${markerDim} z`}
              fill={strokeColor}
            />
          </marker>
        )}
        {showStartArrow && (
          <marker
            id={markerStartId}
            markerWidth={markerDim}
            markerHeight={markerDim}
            refX={markerDim * 0.15}
            refY={markerDim / 2}
            orient="auto-start-reverse"
          >
            <path
              d={`M0,0 L${markerDim},${markerDim / 2} L0,${markerDim} z`}
              fill={strokeColor}
            />
          </marker>
        )}
      </defs>

      {/* Invisible wider stroke to make small lines easy to select */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(14, thickness + 10)}
      />

      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={thickness}
        strokeDasharray={layer.dashed ? "8 6" : undefined}
        markerEnd={showEndArrow ? `url(#${markerEndId})` : undefined}
        markerStart={showStartArrow ? `url(#${markerStartId})` : undefined}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
};