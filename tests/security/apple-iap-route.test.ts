import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("apple iap verify route", () => {
  it("requires auth and delegates to the apple purchase workflow", () => {
    const text = source("src/app/api/apple/iap/verify/route.ts");

    expect(text).toContain("await requireAuth()");
    expect(text).toContain("bodySchema.safeParse");
    expect(text).toContain("verifyApplePurchaseForUser");
    expect(text).toContain("fetchAppleTransactionInfo");
    expect(text).toContain("validateAppleLifetimeTransaction");
    expect(text).toContain("NextResponse.json");
  });

  it("records apple purchases and marks users purchased through Drizzle", () => {
    const text = source("src/app/api/apple/iap/verify/route.ts");

    expect(text).toContain("db.insert(applePurchases)");
    expect(text).toContain("db.update(users)");
    expect(text).toContain("onConflictDoNothing");
    expect(text).toContain("where(eq(users.id, userId))");
  });
});
