import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("requestStoreReview", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns silently when window is undefined (SSR)", async () => {
    vi.stubGlobal("window", undefined);
    const { requestStoreReview } = await import("@/lib/store-review");
    expect(() => requestStoreReview()).not.toThrow();
  });

  it("returns silently when the iOS review bridge is missing", async () => {
    vi.stubGlobal("window", { webkit: { messageHandlers: {} } });
    const { requestStoreReview } = await import("@/lib/store-review");
    expect(() => requestStoreReview()).not.toThrow();
  });

  it("posts an empty message to the iOS review bridge when available", async () => {
    const postMessage = vi.fn();
    vi.stubGlobal("window", {
      webkit: {
        messageHandlers: {
          review: { postMessage },
        },
      },
    });
    const { requestStoreReview } = await import("@/lib/store-review");
    requestStoreReview();
    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith({});
  });
});
