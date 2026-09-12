"use client";

import { Activity, Clock3 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ActivityPanelProps {
  orgId: string;
}

export const ActivityPanel = ({ orgId }: ActivityPanelProps) => {
  const boards = useQuery(api.boards.get, { orgId });
  const recentBoards = boards?.slice(0, 3) ?? [];

  return (
    <section className="flex flex-col justify-between rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm h-full">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-50 text-sky-600">
            <Activity className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-sm font-semibold text-neutral-900">Workspace activity</h2>
        </div>
        <div className="space-y-2">
          {recentBoards.map((board) => (
            <div
              key={board._id}
              className="flex min-w-0 items-center gap-2 rounded-lg bg-neutral-50/80 px-2.5 py-2 text-xs text-neutral-700 transition hover:bg-neutral-100"
            >
              <Clock3 className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
              <span className="truncate">
                <strong className="font-semibold text-neutral-900">{board.authorName}</strong>{" "}
                created or edited{" "}
                <strong className="font-semibold text-neutral-900">{board.title}</strong>
              </span>
            </div>
          ))}
          {!boards?.length && (
            <p className="py-2 text-xs text-neutral-500">Your latest board activity will appear here.</p>
          )}
        </div>
      </div>
    </section>
  );
};