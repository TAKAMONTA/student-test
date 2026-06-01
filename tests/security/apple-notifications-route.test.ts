import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("apple notification route", () => {
  it("accepts signedPayload and records notification data", () => {
    const text = source("src/app/api/apple/iap/notifications/route.ts");

    expect(text).toContain("signedPayload");
    expect(text).toContain("decodeAppleNotificationPayload");
    expect(text).toContain("normalizeAppleNotification");
    expect(text).toContain("validateAppleNotificationForApp");
    expect(text).toContain("readAppleNotificationConfig");
    expect(text).toContain("db.update(applePurchases)");
    expect(text).toContain("NextResponse.json({ ok: true })");
    expect(text).toContain("Notification persistence failed");
    expect(text).toContain("{ status: 500 }");
  });
});
