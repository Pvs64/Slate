import { useMutation } from "@/liveblocks.config";
import { SystemShapeLayer } from "@/types/canvas";

interface SystemShapeProps {
  id: string;
  layer: SystemShapeLayer;
  onPointerDown: (event: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

const shapeOptions: SystemShapeLayer["shapeKind"][] = ["Client", "API Gateway", "Server", "Database", "Cache", "Queue", "Worker"];

export const SystemShape = ({ id, layer, onPointerDown, selectionColor }: SystemShapeProps) => {
  const updateShape = useMutation(({ storage }, value: string) => {
    storage.get("layers").get(id)?.update({ shapeKind: value as SystemShapeLayer["shapeKind"] } as never);
  }, []);

  return (
    <foreignObject
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      onPointerDown={(event) => onPointerDown(event, id)}
      style={{ outline: selectionColor ? `1px solid ${selectionColor}` : "none" }}
    >
      <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-sky-600 bg-sky-50 px-3 text-center text-sky-950 shadow-sm">
        <select
          className="max-w-full bg-transparent text-center text-sm font-semibold outline-none"
          value={layer.shapeKind || "Server"}
          onChange={(event) => updateShape(event.target.value)}
          onPointerDown={(event) => event.stopPropagation()}
          aria-label="System design component"
        >
          {shapeOptions.map((option) => <option key={option}>{option}</option>)}
        </select>
        <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-sky-700">system design</span>
      </div>
    </foreignObject>
  );
};