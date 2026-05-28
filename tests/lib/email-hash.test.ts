import { describe, expect, it } from "vitest";
import { hashEmailForAnalytics } from "@/lib/email-hash";

describe("hashEmailForAnalytics", () => {
  it("returns a 64-char hex SHA-256 string", async () => {
    const result = await hashEmailForAnalytics("user@example.com");
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it("normalizes by trimming whitespace and lowercasing", async () => {
    const a = await hashEmailForAnalytics("  USER@Example.COM ");
    const b = await hashEmailForAnalytics("user@example.com");
    expect(a).toBe(b);
  });

  it("is deterministic for the same input", async () => {
    const a = await hashEmailForAnalytics("user@example.com");
    const b = await hashEmailForAnalytics("user@example.com");
    expect(a).toBe(b);
  });

  it("yields different outputs for different inputs", async () => {
    const a = await hashEmailForAnalytics("user1@example.com");
    const b = await hashEmailForAnalytics("user2@example.com");
    expect(a).not.toBe(b);
  });
});
