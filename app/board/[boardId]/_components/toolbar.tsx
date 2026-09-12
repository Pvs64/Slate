
"use client";

import { ToolButton } from "./tool-button";
import { CanvasState, CanvasMode, LayerType } from "@/types/canvas";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MousePointer2,
  Type,
  Square,
  Circle,
  Triangle,
  Diamond,
  Star,
  Hexagon,
  ArrowRight,
  Minus,
  CornerDownRight,
  Spline,
  StickyNote,
  MessageSquare,
  Code2,
  Database,
  Server,
  Globe,
  Cloud,
  User,
  Columns3,
  CalendarDays,
  Table2,
  Sigma,
  GitBranch,
  LayoutTemplate,
  Pencil,
  GraduationCap,
  Terminal,
} from "lucide-react";

interface ToolbarProps {
  canvasState: CanvasState;
  setCanvasState: (newState: CanvasState) => void;
  undo?: () => void;
  redo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  penStrokeWidth?: number;
  setPenStrokeWidth?: (width: number) => void;
  canWrite?: boolean;
}

export const Toolbar = ({
  canvasState,
  setCanvasState,
  penStrokeWidth = 3,
  setPenStrokeWidth,
  canWrite = true,
}: ToolbarProps) => {
  if (!canWrite) {
    return (
      <div className="absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 flex-row gap-x-2 md:top-16 md:bottom-auto md:left-2 md:translate-x-0 md:flex-col md:gap-y-2 select-none">
        <div className="flex max-w-[calc(100vw-16px)] flex-row items-center gap-x-1.5 rounded-xl border border-neutral-200/80 bg-white p-2 shadow-md md:flex-col md:gap-y-1.5">
          <ToolButton
            label="Pan & View (Read-only)"
            icon={MousePointer2}
            onClick={() => setCanvasState({ mode: CanvasMode.None })}
            isActive={true}
          />
          <div className="rounded bg-neutral-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-neutral-500 text-center">
            View only
          </div>
        </div>
      </div>
    );
  }
  const isShapeActive =
    canvasState.mode === CanvasMode.Inserting &&
    (canvasState.layerType === LayerType.Reactangle ||
      canvasState.layerType === LayerType.Ellipse ||
      canvasState.layerType === LayerType.Triangle ||
      canvasState.layerType === LayerType.Diamond ||
      canvasState.layerType === LayerType.Star ||
      canvasState.layerType === LayerType.Hexagon);

  const isConnectorActive =
    canvasState.mode === CanvasMode.Inserting &&
    (canvasState.layerType === LayerType.Connector ||
      canvasState.layerType === LayerType.ArrowConnector);

  const isNoteActive =
    canvasState.mode === CanvasMode.Inserting &&
    (canvasState.layerType === LayerType.Note ||
      canvasState.layerType === LayerType.Callout);

  const isDevActive =
    canvasState.mode === CanvasMode.Inserting &&
    (canvasState.layerType === LayerType.Code ||
      canvasState.layerType === LayerType.SystemShape);

  const isStudentActive =
    canvasState.mode === CanvasMode.Inserting &&
    (canvasState.layerType === LayerType.Kanban ||
      canvasState.layerType === LayerType.StudyPlanner ||
      canvasState.layerType === LayerType.Table ||
      canvasState.layerType === LayerType.Equation ||
      canvasState.layerType === LayerType.MindMap);

  return (
    <div className="absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 flex-row gap-x-2 md:top-16 md:bottom-auto md:left-2 md:translate-x-0 md:flex-col md:gap-y-2 select-none">
      <div className="flex max-w-[calc(100vw-16px)] flex-row items-center gap-x-1 rounded-xl border border-neutral-200/80 bg-white p-1.5 shadow-md md:flex-col md:gap-y-1">
        {/* 1. Select Tool */}
        <ToolButton
          label="Select (V)"
          icon={MousePointer2}
          onClick={() => setCanvasState({ mode: CanvasMode.None })}
          isActive={
            canvasState.mode === CanvasMode.None ||
            canvasState.mode === CanvasMode.Translating ||
            canvasState.mode === CanvasMode.SelectionNet ||
            canvasState.mode === CanvasMode.Pressing ||
            canvasState.mode === CanvasMode.Resizing ||
            canvasState.mode === CanvasMode.Rotating
          }
        />

        {/* 2. Text Tool */}
        <ToolButton
          label="Text (T)"
          icon={Type}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Text,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Text
          }
        />

        {/* 3. Shapes Group */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div>
              <ToolButton
                label="Rectangle (R)"
                icon={Square}
                isActive={isShapeActive}
                onClick={() =>
                  setCanvasState({
                    mode: CanvasMode.Inserting,
                    layerType: LayerType.Reactangle,
                  })
                }
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" sideOffset={12} className="w-52 p-1.5 shadow-xl rounded-xl bg-white">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Basic Shapes
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.Reactangle,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <Square className="h-4 w-4 text-indigo-500" />
              <span>Rectangle</span>
              <span className="ml-auto text-[10px] text-neutral-400 font-mono">R</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.Ellipse,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <Circle className="h-4 w-4 text-emerald-500" />
              <span>Circle / Ellipse</span>
              <span className="ml-auto text-[10px] text-neutral-400 font-mono">O</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.Triangle,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <Triangle className="h-4 w-4 text-amber-500" />
              <span>Triangle</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.Diamond,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <Diamond className="h-4 w-4 text-sky-500" />
              <span>Diamond (Decision)</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.Star,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Star</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.Hexagon,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <Hexagon className="h-4 w-4 text-purple-500" />
              <span>Hexagon</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 4. Connectors Group */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div>
              <ToolButton
                label="Connectors (A)"
                icon={ArrowRight}
                isActive={isConnectorActive}
                onClick={() =>
                  setCanvasState({
                    mode: CanvasMode.Inserting,
                    layerType: LayerType.ArrowConnector,
                  })
                }
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" sideOffset={12} className="w-52 p-1.5 shadow-xl rounded-xl bg-white">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Connectors
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.ArrowConnector,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <ArrowRight className="h-4 w-4 text-violet-500" />
              <span>Arrow Connector</span>
              <span className="ml-auto text-[10px] text-neutral-400 font-mono">A</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.Connector,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <Minus className="h-4 w-4 text-neutral-500" />
              <span>Straight Line</span>
              <span className="ml-auto text-[10px] text-neutral-400 font-mono">L</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.ArrowConnector,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <CornerDownRight className="h-4 w-4 text-blue-500" />
              <span>Elbow Connector</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.ArrowConnector,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <Spline className="h-4 w-4 text-pink-500" />
              <span>Curved Connector</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 5. Notes Group */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div>
              <ToolButton
                label="Notes (N)"
                icon={StickyNote}
                isActive={isNoteActive}
                onClick={() =>
                  setCanvasState({
                    mode: CanvasMode.Inserting,
                    layerType: LayerType.Note,
                  })
                }
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" sideOffset={12} className="w-48 p-1.5 shadow-xl rounded-xl bg-white">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Notes & Text
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.Note,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <StickyNote className="h-4 w-4 text-amber-500" />
              <span>Sticky Note</span>
              <span className="ml-auto text-[10px] text-neutral-400 font-mono">N</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.Text,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <Type className="h-4 w-4 text-blue-500" />
              <span>Text Box</span>
              <span className="ml-auto text-[10px] text-neutral-400 font-mono">T</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.Callout,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <MessageSquare className="h-4 w-4 text-emerald-500" />
              <span>Callout Note</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 6. Developer Group */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div>
              <ToolButton
                label="Developer Tools"
                icon={Terminal}
                isActive={isDevActive}
                onClick={() =>
                  setCanvasState({
                    mode: CanvasMode.Inserting,
                    layerType: LayerType.Code,
                  })
                }
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" sideOffset={12} className="w-56 p-1.5 shadow-xl rounded-xl bg-white">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Architecture & Dev
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.Code,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <Code2 className="h-4 w-4 text-neutral-800" />
              <span>Code Block</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.Table,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <Database className="h-4 w-4 text-amber-600" />
              <span>Database Table (ER)</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.SystemShape,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <Server className="h-4 w-4 text-blue-600" />
              <span>Server / Microservice</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.SystemShape,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <Globe className="h-4 w-4 text-violet-600" />
              <span>API Gateway</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.SystemShape,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <Cloud className="h-4 w-4 text-sky-500" />
              <span>Cloud / Load Balancer</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.SystemShape,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <User className="h-4 w-4 text-emerald-600" />
              <span>Client / User</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 7. Student Group */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div>
              <ToolButton
                label="Student Tools"
                icon={GraduationCap}
                isActive={isStudentActive}
                onClick={() =>
                  setCanvasState({
                    mode: CanvasMode.Inserting,
                    layerType: LayerType.MindMap,
                  })
                }
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" sideOffset={12} className="w-52 p-1.5 shadow-xl rounded-xl bg-white">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Study & Planning
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.Kanban,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <Columns3 className="h-4 w-4 text-sky-600" />
              <span>Sprint Kanban / Checklist</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.StudyPlanner,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <CalendarDays className="h-4 w-4 text-emerald-600" />
              <span>Study Planner</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.Table,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <Table2 className="h-4 w-4 text-amber-600" />
              <span>Notes Table</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.Equation,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <Sigma className="h-4 w-4 text-cyan-600" />
              <span>LaTeX Equation</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setCanvasState({
                  mode: CanvasMode.Inserting,
                  layerType: LayerType.MindMap,
                })
              }
              className="flex items-center gap-2 text-xs font-medium cursor-pointer"
            >
              <GitBranch className="h-4 w-4 text-violet-600" />
              <span>Mind Map</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 8. Frames Tool */}
        <ToolButton
          label="Frame (F)"
          icon={LayoutTemplate}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Frame,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Frame
          }
        />

        {/* 9. Pen Tool */}
        <ToolButton
          label="Pen (P)"
          icon={Pencil}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Pencil,
            })
          }
          isActive={canvasState.mode === CanvasMode.Pencil}
        />

        {/* Dynamic Pen Width Slider */}
        {canvasState.mode === CanvasMode.Pencil && setPenStrokeWidth && (
          <div className="flex flex-col items-center gap-1 py-1 border-t border-neutral-200 mt-0.5">
            <span className="text-[10px] font-bold text-blue-600">
              {penStrokeWidth}px
            </span>
            <input
              type="range"
              min="1"
              max="10"
              value={penStrokeWidth}
              onChange={(e) => setPenStrokeWidth(Number(e.target.value))}
              className="w-8 h-1 accent-blue-600 cursor-pointer"
              title={`Pen width: ${penStrokeWidth}`}
              aria-label="Pen stroke width (1-10)"
            />
          </div>
        )}
      </div>
    </div>
  );
};

Toolbar.Skeleton = function ToolbarSkeleton() {
  return (
    <div className="absolute bottom-3 left-1/2 h-12 w-[calc(100vw-16px)] -translate-x-1/2 rounded-xl bg-white shadow-md md:top-16 md:bottom-auto md:left-2 md:h-[400px] md:w-[52px] md:translate-x-0" />
  );
};