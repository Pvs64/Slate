import getStroke from "perfect-freehand";
import { getSvgPathFromStroke } from "@/lib/utils";

interface PathProps {
  x: number;
  y: number;
  points: number[][];
  fill: string;
  onPointerDown?: (e: React.PointerEvent) => void;
  stroke?: string;
  strokeWidth?: number;
}

export const Path = ({
  x,
  y,
  points,
  fill,
  onPointerDown,
  stroke,
  strokeWidth = 3,
}: PathProps) => {
  if (!points || !Array.isArray(points) || points.length === 0) {
    return null;
  }

  // Scale 1 to 10 mapped dynamically to stroke size 6 to 42
  const strokeSize = Math.max(4, Math.min(48, strokeWidth * 4 + 2));

  let d = "";
  try {
    const strokePoints = getStroke(points, {
      size: strokeSize,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    });

    if (strokePoints && strokePoints.length > 0) {
      d = getSvgPathFromStroke(strokePoints);
    }
  } catch (error) {
    console.error("Error generating path stroke:", error);
    return null;
  }

  if (!d) {
    return null;
  }

  return (
    <path
      className="drop-shadow-md"
      onPointerDown={onPointerDown}
      d={d}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      x={0}
      y={0}
      fill={fill}
      stroke={stroke}
      strokeWidth={1}
    />
  );
};