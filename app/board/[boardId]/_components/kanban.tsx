import { useMemo } from "react";
import { useMutation } from "@/liveblocks.config";
import { KanbanColumn, KanbanLayer } from "@/types/canvas";

interface KanbanProps {
  id: string;
  layer: KanbanLayer;
  onPointerDown: (event: React.PointerEvent, id: string) => void;
  selectionColor?: string;
}

const defaultColumns: KanbanColumn[] = [
  { title: "TODO", tasks: ["Add task"] },
  { title: "DOING", tasks: [] },
  { title: "DONE", tasks: [] },
];

export const Kanban = ({ id, layer, onPointerDown, selectionColor }: KanbanProps) => {
  const columns = useMemo<KanbanColumn[]>(() => {
    try {
      const parsed = JSON.parse(layer.value || "");
      return Array.isArray(parsed) && parsed.length ? parsed : defaultColumns;
    } catch {
      return defaultColumns;
    }
  }, [layer.value]);

  const updateBoard = useMutation(({ storage }, nextColumns: KanbanColumn[]) => {
    storage.get("layers").get(id)?.update({ value: JSON.stringify(nextColumns) } as never);
  }, []);

  const updateTask = (columnIndex: number, taskIndex: number, value: string) => {
    const next = columns.map((column, index) => index === columnIndex
      ? { ...column, tasks: column.tasks.map((task, itemIndex) => itemIndex === taskIndex ? value : task) }
      : column);
    updateBoard(next);
  };

  const addTask = (columnIndex: number) => {
    updateBoard(columns.map((column, index) => index === columnIndex ? { ...column, tasks: [...column.tasks, "New task"] } : column));
  };

  const addColumn = () => updateBoard([...columns, { title: "NEW", tasks: [] }]);

  return (
    <foreignObject
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      onPointerDown={(event) => onPointerDown(event, id)}
      style={{ outline: selectionColor ? `1px solid ${selectionColor}` : "none" }}
    >
      <div className="h-full w-full overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-2 text-neutral-900 shadow-md">
        <div
          onPointerDown={(event) => onPointerDown(event, id)}
          className="mb-2 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex items-center gap-1">
            <strong className="text-xs tracking-wide">SPRINT BOARD</strong>
          </div>
          <button
            className="rounded bg-neutral-900 px-2 py-1 text-[10px] text-white hover:bg-neutral-800"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={addColumn}
          >
            Add column
          </button>
        </div>
        <div className="flex h-[calc(100%-28px)] gap-2">
          {columns.map((column, columnIndex) => (
            <div key={`${column.title}-${columnIndex}`} className="min-w-[110px] flex-1 rounded bg-white p-2 shadow-sm">
              <div className="mb-2 text-[10px] font-bold tracking-widest text-neutral-500">{column.title}</div>
              <div className="space-y-2">
                {column.tasks.map((task, taskIndex) => (
                  <input
                    key={`${task}-${taskIndex}`}
                    className="w-full rounded border border-neutral-200 bg-amber-50 px-2 py-1 text-xs outline-none focus:border-sky-500 placeholder:text-neutral-400"
                    value={task}
                    placeholder="Enter task..."
                    onFocus={(e) => {
                      if (e.target.value === "Add task" || e.target.value === "New task") {
                        e.target.select();
                      }
                    }}
                    onChange={(event) => updateTask(columnIndex, taskIndex, event.target.value)}
                    onPointerDown={(event) => event.stopPropagation()}
                    aria-label={`${column.title} task`}
                  />
                ))}
              </div>
              <button className="mt-2 w-full rounded border border-dashed border-neutral-300 py-1 text-[10px] text-neutral-500 hover:bg-neutral-50" onClick={() => addTask(columnIndex)}>+ task</button>
            </div>
          ))}
        </div>
      </div>
    </foreignObject>
  );
};