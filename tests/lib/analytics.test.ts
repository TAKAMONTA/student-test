import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("posthog-js", () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
    register: vi.fn(),
    people: { set: vi.fn() },
  },
}));

describe("client analytics wrapper", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("isOptedOut returns true when DNT is '1'", async () => {
    vi.stubGlobal("navigator", { doNotTrack: "1" });
    const { isOptedOut } = await import("@/lib/analytics");
    expect(isOptedOut()).toBe(true);
  });

  it("isOptedOut returns false when DNT is not set", async () => {
    vi.stubGlobal("navigator", { doNotTrack: null });
    const { isOptedOut } = await import("@/lib/analytics");
    expect(isOptedOut()).toBe(false);
  });

  it("capture is a no-op when opted out", async () => {
    vi.stubGlobal("navigator", { doNotTrack: "1" });
    const posthog = (await import("posthog-js")).default;
    const { capture } = await import("@/lib/analytics");
    capture("test_event", { foo: "bar" });
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it("capture forwards to posthog when not opted out", async () => {
    vi.stubGlobal("navigator", { doNotTrack: null, userAgent: "Mozilla/5.0" });
    vi.stubGlobal("window", {});
    const posthog = (await import("posthog-js")).default;
    const { capture } = await import("@/lib/analytics");
    capture("test_event", { foo: "bar" });
    expect(posthog.capture).toHaveBeenCalledWith("test_event", { foo: "bar" });
  });
});
