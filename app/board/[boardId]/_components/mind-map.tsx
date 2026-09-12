import { useMutation } from "@/liveblocks.config";
import { StudentLayer } from "@/types/canvas";

interface MindMapProps { id: string; layer: StudentLayer; onPointerDown: (event: React.PointerEvent, id: string) => void; selectionColor?: string; }

const initialNodes = ["Operating Systems", "Processes", "Memory", "Scheduling"];

export const MindMap = ({ id, layer, onPointerDown, selectionColor }: MindMapProps) => {
  const nodes = (layer.value ? layer.value.split("|") : initialNodes).slice(0, 5);
  const updateNode = useMutation(({ storage }, index: number, value: string) => {
    const current = (storage.get("layers").get(id)?.get("value" as never) as string | undefined)?.split("|") || initialNodes;
    current[index] = value;
    storage.get("layers").get(id)?.update({ value: current.join("|") } as never);
  }, []);

  return (
    <foreignObject x={layer.x} y={layer.y} width={layer.width} height={layer.height} onPointerDown={(event) => onPointerDown(event, id)} style={{ outline: selectionColor ? `2px solid ${selectionColor}` : "none" }}>
      <div className="relative h-full w-full overflow-hidden rounded-lg border border-violet-200 bg-violet-50 p-3 text-violet-950 shadow-md select-none">
        <div
          onPointerDown={(event) => onPointerDown(event, id)}
          className="mb-2 text-center text-xs font-bold uppercase tracking-wider cursor-grab active:cursor-grabbing"
        >
          Mind Map
        </div>
        <div className="flex h-[calc(100%-24px)] items-center justify-center gap-2">
          <input
            className="w-32 rounded-full border-2 border-violet-500 bg-violet-100 px-2 py-2 text-center text-xs font-semibold outline-none select-text"
            value={nodes[0] || ""}
            placeholder="Root topic"
            onFocus={(e) => {
              if (e.target.value === "Root" || e.target.value === "Operating Systems") e.target.select();
            }}
            onChange={(event) => updateNode(0, event.target.value)}
            onPointerDown={(event) => event.stopPropagation()}
            aria-label="Mind map root"
          />
          <div className="flex flex-col gap-2">
            {nodes.slice(1).map((node, index) => (
              <input
                key={index}
                className="w-32 rounded border border-violet-200 bg-white px-2 py-1 text-xs outline-none focus:border-violet-500 select-text"
                value={node}
                placeholder="Branch topic"
                onFocus={(e) => e.target.select()}
                onChange={(event) => updateNode(index + 1, event.target.value)}
                onPointerDown={(event) => event.stopPropagation()}
                aria-label={`Mind map branch ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </foreignObject>
  );
};