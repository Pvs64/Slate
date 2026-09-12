"use client";

import { Bell, Check } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";

interface NotificationsPanelProps {
  orgId: string;
}

export const NotificationsPanel = ({ orgId }: NotificationsPanelProps) => {
  const notifications = useQuery(api.notifications.list, { orgId });
  const { mutate: markRead } = useApiMutation(api.notifications.markRead);
  const unread = notifications?.filter((notification) => !notification.read).length ?? 0;

  return (
    <section className="flex flex-col justify-between rounded-xl border border-neutral-200/80 bg-white p-4 shadow-sm h-full">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-600">
              <Bell className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-sm font-semibold text-neutral-900">Notifications</h2>
          </div>
          {unread > 0 && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
              {unread} new
            </span>
          )}
        </div>
        <div className="space-y-2">
          {notifications?.map((notification) => (
            <div
              key={notification._id}
              className={`flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-xs transition ${
                notification.read
                  ? "bg-neutral-50/80 text-neutral-500"
                  : "bg-blue-50/60 text-neutral-900 font-medium border border-blue-100"
              }`}
            >
              <span className="min-w-0 truncate">{notification.message}</span>
              {!notification.read && (
                <button
                  className="shrink-0 rounded-md border border-neutral-200 bg-white p-1 hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900"
                  onClick={() => markRead({ id: notification._id })}
                  aria-label="Mark notification read"
                >
                  <Check className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          {!notifications?.length && (
            <p className="py-2 text-xs text-neutral-500">You are all caught up.</p>
          )}
        </div>
      </div>
    </section>
  );
};