"use client";

import { useMemo, useState, useRef } from "react";
import { useStorage } from "@/liveblocks.config";
import { Camera } from "@/types/canvas";

interface MinimapProps {
  camera: Camera;
  setCamera: (camera: Camera) => void;
}

const WIDTH = 190;
const HEIGHT = 120;

export const Minimap = ({ camera, setCamera }: MinimapProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const liveLayers = useStorage((root) => Array.from(root.layers.values()));
  const layers = useMemo(() => liveLayers ?? [], [liveLayers]);
  const bounds = useMemo(() => {
    if (!layers.length) return { left: -400, top: -250, width: 800, height: 500 };
    const left = Math.min(...layers.map((layer) => layer.x));
    const top = Math.min(...layers.map((layer) => layer.y));
    const right = Math.max(...layers.map((layer) => layer.x + layer.width));
    const bottom = Math.max(...layers.map((layer) => layer.y + layer.height));
    return {
      left,
      top,
      width: Math.max(right - left, 400),
      height: Math.max(bottom - top, 250),
    };
  }, [layers]);

  const scale = Math.min(WIDTH / bounds.width, HEIGHT / bounds.height);
  const offsetX = (WIDTH - bounds.width * scale) / 2;
  const offsetY = (HEIGHT - bounds.height * scale) / 2;

  const viewport = useMemo(() => {
    const winW = typeof window !== "undefined" ? window.innerWidth : 1000;
    const winH = typeof window !== "undefined" ? window.innerHeight : 700;
    return {
      x: offsetX + (-camera.x / camera.zoom - bounds.left) * scale,
      y: offsetY + (-camera.y / camera.zoom - bounds.top) * scale,
      width: Math.min(WIDTH, (winW / camera.zoom) * scale),
      height: Math.min(HEIGHT, (winH / camera.zoom) * scale),
    };
  }, [bounds, camera, offsetX, offsetY, scale]);

  const panToPoint = (clientX: number, clientY: number, svgRect: DOMRect) => {
    const winW = typeof window !== "undefined" ? window.innerWidth : 1000;
    const winH = typeof window !== "undefined" ? window.innerHeight : 700;
    const pointX = (clientX - svgRect.left - offsetX) / scale + bounds.left;
    const pointY = (clientY - svgRect.top - offsetY) / scale + bounds.top;
    setCamera({
      ...camera,
      x: winW / 2 - pointX * camera.zoom,
      y: winH / 2 - pointY * camera.zoom,
    });
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    panToPoint(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    panToPoint(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isDragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // pointer was already released
      }
      setIsDragging(false);
    }
  };

  return (
    <div className="absolute bottom-16 right-4 z-20 hidden overflow-hidden rounded-xl border border-neutral-200/80 bg-white/95 p-1.5 shadow-lg backdrop-blur-md sm:block select-none">
      <svg
        ref={svgRef}
        width={WIDTH}
        height={HEIGHT}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`bg-neutral-100/90 rounded-lg ${
          isDragging ? "cursor-grabbing" : "cursor-crosshair"
        }`}
      >
        {layers.map((layer, index) => (
          <rect
            key={index}
            x={offsetX + (layer.x - bounds.left) * scale}
            y={offsetY + (layer.y - bounds.top) * scale}
            width={Math.max(2, layer.width * scale)}
            height={Math.max(2, layer.height * scale)}
            rx="1"
            className="fill-sky-500/50"
          />
        ))}
        <rect
          x={viewport.x}
          y={viewport.y}
          width={viewport.width}
          height={viewport.height}
          className="fill-rose-500/15 stroke-rose-500 hover:fill-rose-500/25 transition-colors"
          strokeWidth="1.5"
          rx="2"
        />
      </svg>
    </div>
  );
};