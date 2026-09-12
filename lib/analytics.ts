/**
 * Slate Client & Server Analytics Engine
 * Tracks the industry-standard funnel:
 * guest_view -> auth_modal_opened -> signup_completed -> action_completed
 */

export type AnalyticsEventType =
  | "guest_view"
  | "auth_modal_opened"
  | "auth_modal_closed"
  | "signup_started"
  | "signup_completed"
  | "action_resumed"
  | "action_completed"
  | "template_previewed"
  | "template_selected"
  | "sandbox_interacted"
  | "share_invite_sent";

export interface AnalyticsEvent {
  event: AnalyticsEventType;
  timestamp: number;
  properties?: Record<string, unknown>;
  userId?: string | null;
}

const STORAGE_KEY = "slate_analytics_history";

class Analytics {
  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  public track(
    event: AnalyticsEventType,
    properties?: Record<string, unknown>,
    userId?: string | null
  ): void {
    const payload: AnalyticsEvent = {
      event,
      timestamp: Date.now(),
      properties: properties || {},
      userId: userId || null,
    };

    if (this.isBrowser()) {
      // 1. Log in dev environment
      if (process.env.NODE_ENV !== "production") {
        console.log(`[Analytics] ${event}`, payload.properties);
      }

      // 2. Dispatch custom DOM event for any embedded observers
      try {
        window.dispatchEvent(
          new CustomEvent("slate:analytics", { detail: payload })
        );
      } catch {
        // Ignore if window is unavailable
      }

      // 3. Persist recent event history in sessionStorage for debugging/funnel analysis
      try {
        const existingRaw = sessionStorage.getItem(STORAGE_KEY);
        const existing: AnalyticsEvent[] = existingRaw ? JSON.parse(existingRaw) : [];
        existing.push(payload);
        // keep last 50 events
        if (existing.length > 50) existing.shift();
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      } catch {
        // Ignore storage errors
      }
    }
  }

  public getHistory(): AnalyticsEvent[] {
    if (!this.isBrowser()) return [];
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export const analytics = new Analytics();
