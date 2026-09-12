"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PresentFrame {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PresentModeProps {
  frames: PresentFrame[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onSelectIndex: (index: number) => void;
  onExit: () => void;
}

export const PresentMode = ({
  frames,
  currentIndex,
  onNext,
  onPrev,
  onSelectIndex,
  onExit,
}: PresentModeProps) => {
  const isFullscreen = typeof document !== "undefined" && !!document.fullscreenElement;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        onNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        onPrev();
      } else if (e.key === "Escape") {
        onExit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNext, onPrev, onExit]);

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center pointer-events-none select-none">
      <div className="flex items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900/95 px-4 py-2.5 text-white shadow-2xl backdrop-blur-md pointer-events-auto transition-all">
        <div className="flex items-center gap-1.5 text-blue-400 mr-2 font-semibold text-xs tracking-wider uppercase">
          <Presentation className="h-4 w-4" />
          <span>Present</span>
        </div>

        {frames.length > 0 ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              disabled={currentIndex <= 0}
              onClick={onPrev}
              className="h-8 w-8 text-neutral-300 hover:bg-neutral-800 hover:text-white disabled:opacity-30"
              title="Previous frame (Left arrow)"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 px-2 text-xs font-medium">
              <select
                value={currentIndex}
                onChange={(e) => onSelectIndex(Number(e.target.value))}
                className="bg-neutral-800 text-white rounded px-2 py-1 outline-none text-xs cursor-pointer hover:bg-neutral-700"
              >
                {frames.map((f, idx) => (
                  <option key={f.id} value={idx}>
                    {idx + 1}. {f.title || `Frame ${idx + 1}`}
                  </option>
                ))}
              </select>
              <span className="text-neutral-400">of {frames.length}</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              disabled={currentIndex >= frames.length - 1}
              onClick={onNext}
              className="h-8 w-8 text-neutral-300 hover:bg-neutral-800 hover:text-white disabled:opacity-30"
              title="Next frame (Right arrow)"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <div className="px-2 text-xs text-neutral-400">
            Full Board Presentation (Add frames for slide navigation)
          </div>
        )}

        <div className="h-4 w-px bg-neutral-700 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="h-8 w-8 text-neutral-300 hover:bg-neutral-800 hover:text-white"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onExit}
          className="h-8 w-8 text-rose-400 hover:bg-rose-950 hover:text-rose-200"
          title="Exit Present Mode (Esc)"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
