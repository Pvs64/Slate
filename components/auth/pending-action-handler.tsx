"use client";

import { useEffect, useRef } from "react";
import { useUser, useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { analytics } from "@/lib/analytics";
import { PENDING_ACTION_STORAGE_KEY, PendingAction } from "@/hooks/use-require-auth";

export const PendingActionHandler = () => {
  const { isSignedIn, user } = useUser();
  const { organization } = useOrganization();
  const router = useRouter();
  const createBoard = useMutation(api.board.create);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (!isSignedIn || !user || isProcessingRef.current) return;

    try {
      const raw = sessionStorage.getItem(PENDING_ACTION_STORAGE_KEY);
      if (!raw) return;

      const action: PendingAction = JSON.parse(raw);
      // Only process actions less than 15 minutes old
      if (Date.now() - action.timestamp > 15 * 60 * 1000) {
        sessionStorage.removeItem(PENDING_ACTION_STORAGE_KEY);
        return;
      }

      isProcessingRef.current = true;
      analytics.track("action_resumed", {
        type: action.type,
        actionId: action.id,
      }, user.id);

      const targetOrgId = organization?.id || user.id;

      if (action.type === "use_template" || action.type === "create_board") {
        const title =
          (action.payload?.title as string) ||
          (action.type === "use_template"
            ? `${(action.payload?.templateName as string) || "Template"} Board`
            : "Untitled Board");
        const template = (action.payload?.template as string) || undefined;

        toast.info(`Resuming: Creating "${title}"...`);

        createBoard({
          title,
          orgId: targetOrgId,
          template,
        })
          .then((boardId) => {
            sessionStorage.removeItem(PENDING_ACTION_STORAGE_KEY);
            analytics.track("action_completed", {
              type: action.type,
              boardId,
            }, user.id);
            toast.success(`Board created! Opening your canvas...`);
            router.push(`/board/${boardId}`);
          })
          .catch((err) => {
            console.error("Failed to resume pending action:", err);
            isProcessingRef.current = false;
          });
      } else {
        sessionStorage.removeItem(PENDING_ACTION_STORAGE_KEY);
      }
    } catch {
      // Ignore parse/storage errors
    }
  }, [isSignedIn, user, organization, createBoard, router]);

  return null;
};
