"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useCallback } from "react";
import { analytics } from "@/lib/analytics";

export interface PendingAction {
  id: string;
  type: "create_board" | "use_template" | "star_board" | "join_board" | "custom";
  payload?: Record<string, unknown>;
  timestamp: number;
  label?: string;
}

export const PENDING_ACTION_STORAGE_KEY = "slate_pending_action";

export const useRequireAuth = () => {
  const { isSignedIn, isLoaded } = useUser();
  const { openSignIn, openSignUp } = useClerk();

  const requireAuth = useCallback(
    (
      action?: () => void,
      options?: {
        source?: string;
        pendingAction?: Omit<PendingAction, "id" | "timestamp">;
      }
    ): boolean => {
      if (isSignedIn) {
        action?.();
        return true;
      }

      const source = options?.source || "unknown_action";

      // 1. Save intended action in sessionStorage so we can resume automatically after login
      if (typeof window !== "undefined" && options?.pendingAction) {
        const fullAction: PendingAction = {
          ...options.pendingAction,
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now(),
        };
        try {
          sessionStorage.setItem(
            PENDING_ACTION_STORAGE_KEY,
            JSON.stringify(fullAction)
          );
        } catch {
          // Ignore storage errors
        }
      }

      // 2. Track funnel metric: auth modal opened
      analytics.track("auth_modal_opened", {
        source,
        hasPendingAction: Boolean(options?.pendingAction),
        intendedType: options?.pendingAction?.type,
      });

      // 3. Open Clerk modal on top of the current screen (no full page redirect!)
      if (typeof window !== "undefined") {
        openSignIn({
          afterSignInUrl: window.location.href,
          afterSignUpUrl: window.location.href,
        });
      }

      return false;
    },
    [isSignedIn, openSignIn]
  );

  const openAuthModal = useCallback(
    (mode: "sign-in" | "sign-up" = "sign-in", source = "direct_button") => {
      analytics.track("auth_modal_opened", { source, mode });
      if (mode === "sign-up") {
        openSignUp({
          afterSignInUrl: window.location.href,
          afterSignUpUrl: window.location.href,
        });
      } else {
        openSignIn({
          afterSignInUrl: window.location.href,
          afterSignUpUrl: window.location.href,
        });
      }
    },
    [openSignIn, openSignUp]
  );

  return {
    isSignedIn: Boolean(isSignedIn),
    isLoaded,
    requireAuth,
    openAuthModal,
  };
};
