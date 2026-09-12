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
    return {
      startPoint: { x: 0, y: layer.height / 2 },
      endPoint: { x: layer.width, y: layer.height / 2 },
    };
  }, [boundLayers, layer.height, layer.width, layer.x, layer.y]);

  const pathD = useMemo(() => {
    const { x: x1, y: y1 } = startPoint;
    const { x: x2, y: y2 } = endPoint;
    const style = layer.style || "straight";

    if (style === "elbow") {
      const midX = (x1 + x2) / 2;
      return `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`;
    }

    if (style === "curved") {
      const dx = (x2 - x1) * 0.5;
      return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
    }

    // Default straight
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }, [endPoint, layer.style, startPoint]);

  const strokeColor = selectionColor || colorToCss(layer.fill);
  const showEndArrow = layer.arrow !== false;
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