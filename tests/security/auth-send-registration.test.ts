import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("auth send registration behavior", () => {
  it("creates unpaid users before sending magic links", () => {
    const text = source("src/app/api/auth/send/route.ts");

    expect(text).toContain("nanoid");
    expect(text).toContain("db.insert(users)");
    expect(text).toContain("const loginUser = existing ??");
    expect(text).toContain("sendLoginEmail({");
    expect(text).toContain("email: loginUser.email");
  });

  it("keeps user enumeration protection", () => {
    const text = source("src/app/api/auth/send/route.ts");

    expect(text).toContain("return NextResponse.json({ ok: true })");
    expect(text).not.toContain("user_not_found");
    expect(text).not.toContain("No user");
  });
});
