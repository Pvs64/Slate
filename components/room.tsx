"use client";

import { ReactNode, useCallback, useEffect } from "react";
import { RoomProvider } from "@liveblocks/react";
import { LiveMap, LiveObject, LiveList } from "@liveblocks/client";
import { Layer } from "@/types/canvas";
import {
  LiveblocksProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface RoomProps {
  roomId: string;
  children: ReactNode;
  fallback: ReactNode;
  token?: string;
  role?: string;
}

export const Room = ({ roomId, children, fallback, token, role }: RoomProps) => {
  const claimLink = useMutation(api.shares.claimLink);

  useEffect(() => {
    const effectiveToken =
      token ||
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("token") || undefined
        : undefined);

    if (effectiveToken) {
      void claimLink({ boardId: roomId as never, token: effectiveToken }).catch(() => {
        // Ignored if link is already claimed or expired
      });
    }
  }, [token, roomId, claimLink]);

  // Automatically remove any "Powered by Liveblocks" watermark badge injected into the DOM
  useEffect(() => {
    const purgeLiveblocksBadge = () => {
      const candidates = document.querySelectorAll(
        'a[href*="liveblocks.io"], [class*="liveblocks-badge"], [class*="lb-badge"], [id*="liveblocks-badge"]'
      );
      candidates.forEach((el) => {
        const container =
          el.closest('div[style*="position: fixed"]') ||
          el.closest('div[style*="position: absolute"]') ||
          el.parentElement ||
          el;
        (container as HTMLElement).style.setProperty("display", "none", "important");
        (container as HTMLElement).remove?.();
      });

      const allElements = document.querySelectorAll("div, a, span, p");
      allElements.forEach((el) => {
        if (
          el.childNodes.length <= 2 &&
          el.textContent &&
          /powered by liveblocks/i.test(el.textContent.trim())
        ) {
          const container =
            el.closest('div[style*="position: fixed"]') ||
            el.closest('div[style*="position: absolute"]') ||
            el.parentElement ||
            el;
          (container as HTMLElement).style.setProperty("display", "none", "important");
          (container as HTMLElement).remove?.();
        }
      });
    };

    purgeLiveblocksBadge();
    const observer = new MutationObserver(purgeLiveblocksBadge);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const resolveUsers = useCallback(async ({ userIds }: { userIds: string[] }) => {
    if (!userIds || userIds.length === 0) return [];
    try {
      const searchParams = new URLSearchParams();
      userIds.forEach((id) => searchParams.append("userIds", id));
      const res = await fetch(`/api/liveblocks-users?${searchParams.toString()}`);
      if (!res.ok) return userIds.map(() => undefined);
      return await res.json();
    } catch {
      return userIds.map(() => undefined);
    }
  }, []);

  const authEndpoint = useCallback(
    async (room?: string) => {
      const effectiveToken =
        token ||
        (typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("token") || undefined
          : undefined);

      const effectiveRole =
        role ||
        (typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("role") || undefined
          : undefined);

      const response = await fetch("/api/liveblocks-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: room || roomId,
          token: effectiveToken,
          role: effectiveRole,
        }),
      });

      return await response.json();
    },
    [roomId, token, role]
  );

  return (
    <LiveblocksProvider authEndpoint={authEndpoint} resolveUsers={resolveUsers}>
      <RoomProvider
        id={roomId}
        initialPresence={{
          cursor: null,
          selection: [],
          pencilDraft: null,
          penColor: null,
        }}
        initialStorage={{
          layers: new LiveMap<string, LiveObject<Layer>>(),
          layerIds: new LiveList([]),
        }}
      >
        <ClientSideSuspense fallback={fallback}>
          {() => children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
};

