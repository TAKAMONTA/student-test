import { describe, expect, it } from "vitest";
import { isIosAppUserAgent } from "@/lib/ios-app";

describe("ios app detection", () => {
  it("detects the native iOS wrapper user agent suffix", () => {
    expect(isIosAppUserAgent("Mozilla/5.0 Mobile Safari/604.1 Chu1TestKitIOS/1")).toBe(true);
  });

  it("does not detect normal mobile safari", () => {
    expect(isIosAppUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile Safari/604.1")).toBe(false);
  });
});
