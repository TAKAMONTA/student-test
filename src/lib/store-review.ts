type ReviewBridge = { postMessage: (payload: Record<string, unknown>) => void };

type WindowWithReviewBridge = {
  webkit?: {
    messageHandlers?: {
      review?: ReviewBridge;
    };
  };
};

export function requestStoreReview(): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as WindowWithReviewBridge;
  const bridge = w.webkit?.messageHandlers?.review;
  if (!bridge) return;
  bridge.postMessage({});
}
