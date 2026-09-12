"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  key: string;
  description: string;
}

interface ShortcutSection {
  title: string;
  shortcuts: ShortcutItem[];
}

const SECTIONS: ShortcutSection[] = [
  {
    title: "Tools",
    shortcuts: [
      { key: "V", description: "Select / Move tool" },
      { key: "T", description: "Text tool" },
      { key: "N", description: "Sticky note" },
      { key: "R", description: "Rectangle" },
      { key: "O", description: "Circle / Ellipse" },
      { key: "A", description: "Arrow connector" },
      { key: "L", description: "Line connector" },
      { key: "P", description: "Pen tool" },
    ],
  },
  {
    title: "Edit & Arrange",
    shortcuts: [
      { key: "Ctrl + C", description: "Copy selected layers" },
      { key: "Ctrl + V", description: "Paste layers" },
      { key: "Ctrl + X", description: "Cut selected layers" },
      { key: "Ctrl + D", description: "Duplicate selection" },
      { key: "Ctrl + Z", description: "Undo" },
      { key: "Ctrl + Y / Ctrl+Shift+Z", description: "Redo" },
      { key: "Ctrl + A", description: "Select all layers" },
      { key: "Ctrl + G", description: "Group selection" },
      { key: "Ctrl + Shift + G", description: "Ungroup selection" },
      { key: "Delete / Backspace", description: "Delete selected layers" },
    ],
  },
  {
    title: "Navigation & Canvas",
    shortcuts: [
      { key: "Space + Drag", description: "Pan canvas" },
      { key: "Ctrl + Mouse Wheel", description: "Zoom in / out" },
      { key: "Arrow Keys", description: "Nudge selected layer 2px" },
      { key: "Shift + Arrow Keys", description: "Nudge selected layer 10px" },
      { key: "Shift + Click", description: "Multi-select layers" },
      { key: "Ctrl + F", description: "Search in board" },
      { key: "?", description: "Open keyboard shortcuts" },
      { key: "Esc", description: "Cancel tool / Exit present mode" },
    ],
  },
];

export const KeyboardShortcutsDialog = ({
  isOpen,
  onClose,
}: KeyboardShortcutsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white p-6 shadow-2xl rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <span>⌨️</span> Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {SECTIONS.map((section) => (
            <div key={section.title} className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                {section.title}
              </h4>
              <div className="space-y-1.5">
                {section.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-neutral-50 transition-colors"
                  >
                    <span className="text-neutral-600 font-medium">
                      {shortcut.description}
                    </span>
                    <kbd className="rounded bg-neutral-100 border border-neutral-300 px-2 py-0.5 text-[11px] font-mono font-semibold text-neutral-800 shadow-2xs">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
