"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import { Actions } from "@/components/actions";
import Image from "next/image";
import { Hint } from "@/components/hint";
import { cn } from "@/lib/utils";
import {
  Menu,
  Star,
  Presentation,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Layers,
  Search,
} from "lucide-react";
import { SharePanel } from "./share-panel";
import { BoardExport } from "./board-export";
import { useStatus } from "@/liveblocks.config";

interface InfoProps {
  boardId: string;
  onPresent?: () => void;
  onOpenShortcuts?: () => void;
  onToggleLayers?: () => void;
  isLayersOpen?: boolean;
  onOpenSearch?: () => void;
}

type InfoComponent = React.FC<InfoProps> & {
  Skeleton: React.FC;
};

const TabSeparator = () => {
  return <div className="text-neutral-300 px-1">|</div>;
};

export const Info: InfoComponent = ({
  boardId,
  onPresent,
  onOpenShortcuts,
  onToggleLayers,
  isLayersOpen,
  onOpenSearch,
}: InfoProps) => {
  const data = useQuery(api.board.get, {
    id: boardId as Id<"boards">,
  });

  const updateBoard = useMutation(api.board.update);
  const favoriteBoard = useMutation(api.board.favorite);
  const unfavoriteBoard = useMutation(api.board.unfavorite);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const liveblocksStatus = useStatus();

  if (!data) return <Info.Skeleton />;

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    const trimmed = titleValue.trim();
    if (trimmed && trimmed !== data.title) {
      updateBoard({ id: data._id, title: trimmed });
    }
  };

  const handleToggleFavorite = () => {
    if (data.isFavorite) {
      unfavoriteBoard({ id: data._id });
    } else {
      favoriteBoard({ id: data._id, orgId: data.orgId });
    }
  };

  return (
    <div className="absolute top-2 left-2 bg-white rounded-xl px-2 h-12 flex items-center gap-1 shadow-md z-20 border border-neutral-200/80 max-w-[calc(100vw-16px)]">
      {/* Brand & Logo */}
      <Hint label="Go to boards" side="bottom" sideOffset={10}>
        <Button asChild variant="board" className="px-2">
          <Link href="/">
            <Image src="/logo.svg" alt="logo" height={28} width={28} priority />
            <span className={cn("font-bold text-lg ml-1.5 text-neutral-900")}>
              Slate
            </span>
          </Link>
        </Button>
      </Hint>

      <TabSeparator />

      {/* Inline Editable Title */}
      {isEditingTitle ? (
        <input
          autoFocus
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          onBlur={handleTitleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleTitleSubmit();
            if (e.key === "Escape") setIsEditingTitle(false);
          }}
          className="h-8 max-w-[180px] rounded border border-blue-500 bg-neutral-50 px-2 text-sm font-semibold text-neutral-900 outline-none"
        />
      ) : (
        <Hint label="Click to rename board inline" side="bottom" sideOffset={10}>
          <button
            onClick={() => {
              setTitleValue(data.title);
              setIsEditingTitle(true);
            }}
            className="text-sm font-semibold text-neutral-800 px-2 py-1 rounded hover:bg-neutral-100 max-w-[180px] truncate transition-colors"
          >
            {data.title}
          </button>
        </Hint>
      )}

      {/* Favorite Star Button */}
      <Hint
        label={data.isFavorite ? "Remove from favorites" : "Add to favorites"}
        side="bottom"
      >
        <Button
          variant="board"
          size="icon"
          onClick={handleToggleFavorite}
          className="h-8 w-8 text-neutral-400 hover:text-amber-500"
          aria-label="Toggle favorite"
        >
          <Star
            className={cn(
              "h-4 w-4 transition-colors",
              data.isFavorite
                ? "fill-amber-400 text-amber-500"
                : "text-neutral-400 hover:text-amber-500"
            )}
          />
        </Button>
      </Hint>

      {/* Save Sync Status */}
      <Hint
        label={
          liveblocksStatus === "connected"
            ? "All changes saved to cloud"
            : liveblocksStatus === "connecting"
            ? "Syncing changes..."
            : "Offline"
        }
        side="bottom"
      >
        <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 px-1 cursor-default">
          {liveblocksStatus === "connected" ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="hidden lg:inline text-neutral-500">Synced</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5 text-amber-500 animate-spin" />
              <span className="hidden lg:inline text-neutral-500">Syncing...</span>
            </>
          )}
        </div>
      </Hint>

      <TabSeparator />

      {/* Present Mode Button */}
      {onPresent && (
        <Hint label="Present Mode (Slides & Fullscreen)" side="bottom">
          <Button
            variant="board"
            onClick={onPresent}
            className="h-8 px-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <Presentation className="h-4 w-4 mr-1 text-blue-600" />
            <span>Present</span>
          </Button>
        </Hint>
      )}

      {/* Share Panel */}
      <SharePanel
        boardId={data._id}
        ownerName={data.authorName}
        boardTitle={data.title}
      />

      {/* Board Export */}
      <BoardExport boardId={data._id} />

      <TabSeparator />

      {/* Board In-canvas Search */}
      {onOpenSearch && (
        <Hint label="Search in board (Ctrl+F)" side="bottom">
          <Button
            variant="board"
            size="icon"
            onClick={onOpenSearch}
            className="h-8 w-8 text-neutral-600 hover:text-neutral-900"
            aria-label="Search in board"
          >
            <Search className="h-4 w-4" />
          </Button>
        </Hint>
      )}

      {/* Layers Panel Toggle */}
      {onToggleLayers && (
        <Hint label="Layers panel" side="bottom">
          <Button
            variant="board"
            size="icon"
            onClick={onToggleLayers}
            className={cn(
              "h-8 w-8 text-neutral-600 hover:text-neutral-900 transition-colors",
              isLayersOpen && "bg-blue-50 text-blue-600 font-bold"
            )}
            aria-label="Layers panel"
          >
            <Layers className="h-4 w-4" />
          </Button>
        </Hint>
      )}

      {/* Keyboard Shortcuts Sheet */}
      {onOpenShortcuts && (
        <Hint label="Keyboard shortcuts (?)" side="bottom">
          <Button
            variant="board"
            size="icon"
            onClick={onOpenShortcuts}
            className="h-8 w-8 text-neutral-600 hover:text-neutral-900"
            aria-label="Keyboard shortcuts"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </Hint>
      )}

      {/* Main Dropdown Menu */}
      <Actions id={data._id} title={data.title} side="bottom" sideOffset={10}>
        <Button variant="board" size="icon" aria-label="Main menu" title="Main menu" className="h-8 w-8">
          <Menu className="h-4 w-4" />
        </Button>
      </Actions>
    </div>
  );
};

Info.Skeleton = function InfoSkeleton() {
  return (
    <Skeleton className="absolute top-2 left-2 h-12 w-80 rounded-xl shadow-md" />
  );
};
