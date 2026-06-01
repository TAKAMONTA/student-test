import { describe, expect, it, vi, beforeEach } from "vitest";
import { captureServerEvent } from "@/lib/analytics-server";

describe("captureServerEvent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("posts the expected payload to PostHog's capture endpoint", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("", { status: 200 }),
    );
    await captureServerEvent({
      host: "https://eu.i.posthog.com",
      apiKey: "phc_test",
      event: "purchase_completed",
      distinctId: "user_123",
      properties: { channel: "stripe", amount: 980 },
    });
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe("https://eu.i.posthog.com/i/v0/capture/");
    expect(init?.method).toBe("POST");
    const body = JSON.parse((init?.body as string) ?? "{}");
    expect(body).toMatchObject({
      api_key: "phc_test",
      event: "purchase_completed",
      distinct_id: "user_123",
      properties: { channel: "stripe", amount: 980 },
    });
    expect(typeof body.timestamp).toBe("string");
  });

  it("swallows fetch failures (fire-and-forget contract)", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));
    await expect(
      captureServerEvent({
        host: "https://eu.i.posthog.com",
        apiKey: "phc_test",
        event: "purchase_completed",
        distinctId: "user_123",
        properties: {},
      }),
    ).resolves.toBeUndefined();
  });

  it("returns silently when host or apiKey is missing", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await captureServerEvent({
      host: "",
      apiKey: "",
      event: "purchase_completed",
      distinctId: "user_123",
      properties: {},
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
