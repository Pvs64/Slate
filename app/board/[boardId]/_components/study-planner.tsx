import { useMemo } from "react";
import { useMutation } from "@/liveblocks.config";
import { StudyPlannerLayer } from "@/types/canvas";

interface StudyPlannerProps {
  id: string;
  layer: StudyPlannerLayer;
  onPointerDown: (event: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const StudyPlanner = ({ id, layer, onPointerDown, selectionColor }: StudyPlannerProps) => {
  const topics = useMemo<string[]>(() => {
    try {
      const parsed = JSON.parse(layer.value || "");
      return Array.isArray(parsed) && parsed.length === days.length ? parsed : days.map(() => "");
    } catch {
      return days.map(() => "");
    }
  }, [layer.value]);

  const updateTopics = useMutation(({ storage }, nextTopics: string[]) => {
    storage.get("layers").get(id)?.update({ value: JSON.stringify(nextTopics) } as never);
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
      <div className="h-full w-full overflow-auto rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-950 shadow-md">
        <div
          onPointerDown={(event) => onPointerDown(event, id)}
          className="mb-3 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
        >
          <strong className="text-sm">Weekly Study Planner</strong>
          <span className="text-[10px] uppercase tracking-widest text-emerald-700">student</span>
        </div>
        <div className="grid h-[calc(100%-30px)] grid-cols-5 gap-2">
          {days.map((day, index) => (
            <div key={day} className="rounded bg-white p-2 shadow-sm">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-emerald-700">{day}</div>
              <textarea
                className="h-[calc(100%-20px)] w-full resize-none rounded border border-emerald-100 bg-emerald-50/50 p-1 text-xs outline-none focus:border-emerald-500"
                value={topics[index]}
                placeholder="Subject or task"
                onChange={(event) => updateTopics(topics.map((topic, topicIndex) => topicIndex === index ? event.target.value : topic))}
                onPointerDown={(event) => event.stopPropagation()}
                aria-label={`${day} study topic`}
              />
            </div>
          ))}
        </div>
      </div>
    </foreignObject>
  );
};