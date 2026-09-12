"use client";

import { Download, FileImage, FileJson, FileType } from "lucide-react";
import { useStorage } from "@/liveblocks.config";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BoardExportProps {
  boardId: string;
}

export const BoardExport = ({ boardId }: BoardExportProps) => {
  const board = useStorage((root) => ({
    layerIds: Array.from(root.layerIds),
    layers: Object.fromEntries(root.layers),
  }));

  const exportJson = () => {
    const payload = JSON.stringify({ boardId, exportedAt: new Date().toISOString(), ...board }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `whiteboard-${boardId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportSvg = () => {
    const svg = document.querySelector<SVGSVGElement>("[data-board-canvas]");
    if (!svg) return;
    const source = new XMLSerializer().serializeToString(svg);
    download(new Blob([source], { type: "image/svg+xml" }), `whiteboard-${boardId}.svg`);
  };

  const exportPng = async () => {
    const svg = document.querySelector<SVGSVGElement>("[data-board-canvas]");
    if (!svg) return;
    const source = new XMLSerializer().serializeToString(svg);
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Unable to render board"));
    });
    const canvas = document.createElement("canvas");
    canvas.width = svg.clientWidth;
    canvas.height = svg.clientHeight;
    canvas.getContext("2d")?.drawImage(image, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) download(blob, `whiteboard-${boardId}.png`);
    }, "image/png");
  };

  const download = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <Hint label="Export board" side="bottom" sideOffset={10}>
        <DropdownMenuTrigger asChild>
          <Button variant="board" size="icon" aria-label="Export board">
            <Download className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
      </Hint>
      <DropdownMenuContent align="start" side="bottom" sideOffset={10} className="w-48 bg-white shadow-lg">
        <DropdownMenuItem onClick={exportJson} className="cursor-pointer gap-2.5 px-3 py-2 text-xs hover:bg-neutral-100">
          <FileJson className="h-4 w-4 text-amber-500" />
          <span className="font-medium">Export as JSON</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportSvg} className="cursor-pointer gap-2.5 px-3 py-2 text-xs hover:bg-neutral-100">
          <FileType className="h-4 w-4 text-emerald-500" />
          <span className="font-medium">Export as SVG</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPng} className="cursor-pointer gap-2.5 px-3 py-2 text-xs hover:bg-neutral-100">
          <FileImage className="h-4 w-4 text-sky-500" />
          <span className="font-medium">Export as PNG</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};