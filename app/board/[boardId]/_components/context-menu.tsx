"use client";

import { useEffect, useRef } from "react";
import {
  Copy,
  Scissors,
  Clipboard,
  CopyPlus,
  BringToFront,
  SendToBack,
  Group,
  Ungroup,
  Lock,
  Unlock,
  Trash2,
} from "lucide-react";

export interface ContextMenuPosition {
  x: number;
  y: number;
}

interface ContextMenuProps {
  position: ContextMenuPosition | null;
  onClose: () => void;
  hasSelection: boolean;
  isLocked?: boolean;
  isGrouped?: boolean;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
}

export const ContextMenu = ({
  position,
  onClose,
  hasSelection,
  isLocked,
  isGrouped,
  onCut,
  onCopy,
  onPaste,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onGroup,
  onUngroup,
  onToggleLock,
  onDelete,
}: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (position) {
      window.addEventListener("mousedown", handleClickOutside);
    }
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [position, onClose]);

  if (!position) return null;

  // Keep menu within screen boundaries
  const menuWidth = 190;
  const menuHeight = 310;
  const left = Math.min(position.x, (typeof window !== "undefined" ? window.innerWidth : 1000) - menuWidth - 10);
  const top = Math.min(position.y, (typeof window !== "undefined" ? window.innerHeight : 800) - menuHeight - 10);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{ left: `${left}px`, top: `${top}px` }}
      className="fixed z-50 w-48 rounded-xl border border-neutral-200 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md text-xs font-medium text-neutral-700 select-none animate-in fade-in-50 zoom-in-95 duration-100"
      onContextMenu={(e) => e.preventDefault()}
    >
      <button
        disabled={!hasSelection}
        onClick={() => handleAction(onCut)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-neutral-100 disabled:opacity-35 text-left transition-colors"
      >
        <span className="flex items-center gap-2">
          <Scissors className="h-3.5 w-3.5 text-neutral-500" />
          Cut
        </span>
        <span className="text-[10px] text-neutral-400 font-mono">Ctrl+X</span>
      </button>

      <button
        disabled={!hasSelection}
        onClick={() => handleAction(onCopy)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-neutral-100 disabled:opacity-35 text-left transition-colors"
      >
        <span className="flex items-center gap-2">
          <Copy className="h-3.5 w-3.5 text-neutral-500" />
          Copy
        </span>
        <span className="text-[10px] text-neutral-400 font-mono">Ctrl+C</span>
      </button>

      <button
        onClick={() => handleAction(onPaste)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-neutral-100 text-left transition-colors"
      >
        <span className="flex items-center gap-2">
          <Clipboard className="h-3.5 w-3.5 text-neutral-500" />
          Paste
        </span>
        <span className="text-[10px] text-neutral-400 font-mono">Ctrl+V</span>
      </button>

      <button
        disabled={!hasSelection}
        onClick={() => handleAction(onDuplicate)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-neutral-100 disabled:opacity-35 text-left transition-colors"
      >
        <span className="flex items-center gap-2">
          <CopyPlus className="h-3.5 w-3.5 text-neutral-500" />
          Duplicate
        </span>
        <span className="text-[10px] text-neutral-400 font-mono">Ctrl+D</span>
      </button>

      <div className="h-px bg-neutral-200 my-1" />

      <button
        disabled={!hasSelection}
        onClick={() => handleAction(onBringToFront)}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-neutral-100 disabled:opacity-35 text-left transition-colors"
      >
        <BringToFront className="h-3.5 w-3.5 text-neutral-500" />
        Bring to Front
      </button>

      <button
        disabled={!hasSelection}
        onClick={() => handleAction(onSendToBack)}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-neutral-100 disabled:opacity-35 text-left transition-colors"
      >
        <SendToBack className="h-3.5 w-3.5 text-neutral-500" />
        Send to Back
      </button>

      <div className="h-px bg-neutral-200 my-1" />

      {isGrouped ? (
        <button
          disabled={!hasSelection}
          onClick={() => handleAction(onUngroup)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-neutral-100 disabled:opacity-35 text-left transition-colors"
        >
          <span className="flex items-center gap-2">
            <Ungroup className="h-3.5 w-3.5 text-neutral-500" />
            Ungroup
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">Ctrl+Shift+G</span>
        </button>
      ) : (
        <button
          disabled={!hasSelection}
          onClick={() => handleAction(onGroup)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-neutral-100 disabled:opacity-35 text-left transition-colors"
        >
          <span className="flex items-center gap-2">
            <Group className="h-3.5 w-3.5 text-neutral-500" />
            Group
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">Ctrl+G</span>
        </button>
      )}

      <button
        disabled={!hasSelection}
        onClick={() => handleAction(onToggleLock)}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-neutral-100 disabled:opacity-35 text-left transition-colors"
      >
        {isLocked ? (
          <>
            <Unlock className="h-3.5 w-3.5 text-amber-600" />
            <span>Unlock Selection</span>
          </>
        ) : (
          <>
            <Lock className="h-3.5 w-3.5 text-neutral-500" />
            <span>Lock Selection</span>
          </>
        )}
      </button>

      <div className="h-px bg-neutral-200 my-1" />

      <button
        disabled={!hasSelection}
        onClick={() => handleAction(onDelete)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-rose-50 text-rose-600 disabled:opacity-35 text-left transition-colors"
      >
        <span className="flex items-center gap-2">
          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
          Delete
        </span>
        <span className="text-[10px] text-rose-400 font-mono">Del</span>
      </button>
    </div>
  );
};
