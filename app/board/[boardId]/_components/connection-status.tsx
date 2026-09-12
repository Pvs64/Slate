"use client";

import { useStatus } from "@/liveblocks.config";

export const ConnectionStatus = () => {
  const status = useStatus();
  const isConnected = status === "connected";
  const isReconnecting = status === "connecting" || status === "reconnecting";

  return (
    <div className="absolute right-4 top-16 z-10 flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs shadow-sm">
      <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500" : isReconnecting ? "bg-amber-400" : "bg-rose-500"}`} />
      {isConnected ? "Saved" : isReconnecting ? "Reconnecting..." : "Offline"}
    </div>
  );
};