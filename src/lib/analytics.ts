import posthog from "posthog-js";
import { isIosAppUserAgent } from "@/lib/ios-app";

let initialized = false;

export function isOptedOut(): boolean {
  if (typeof navigator === "undefined") return true;
  const nav = navigator as Navigator & { msDoNotTrack?: string };
  const dnt = nav.doNotTrack ?? nav.msDoNotTrack;
  return dnt === "1";
}

export function initAnalytics(): void {
  if (initialized) return;
  if (typeof window === "undefined") return;
  if (isOptedOut()) return;

  const host = process.env["NEXT_PUBLIC_POSTHOG_HOST"];
  const key = process.env["NEXT_PUBLIC_POSTHOG_KEY"];
  if (!host || !key) {
    console.warn("[analytics] PostHog not configured");
    return;
  }

  posthog.init(key, {
    api_host: host,
    autocapture: true,
    capture_pageview: true,
    disable_session_recording: true,
    persistence: "localStorage+cookie",
    loaded: (ph) => {
      ph.register({
        is_ios_app: isIosAppUserAgent(navigator.userAgent),
      });
    },
  });
  initialized = true;
}

export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  if (typeof window === "undefined" || isOptedOut()) return;
  posthog.identify(userId, properties);
}

export function capture(event: string, properties?: Record<string, unknown>): void {
  if (typeof window === "undefined" || isOptedOut()) return;
  posthog.capture(event, properties);
}

export function setUserProperties(properties: Record<string, unknown>): void {
  if (typeof window === "undefined" || isOptedOut()) return;
  posthog.people.set(properties);
}
