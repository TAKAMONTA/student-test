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
    expect(text).toContain(".insert(users)");
    expect(text).toContain("onConflictDoNothing");
    expect(text).toContain("const loginUser = await");
    expect(text).toContain("if (existing) return existing");
    expect(text).toContain("if (inserted) return inserted");
    expect(text).toContain("if (conflicted) return conflicted");
    expect(text).toContain("sendLoginEmail({");
    expect(text).toContain("email: loginUser.email");
  });

  it("keeps user enumeration protection", () => {
    const text = source("src/app/api/auth/send/route.ts");

    expect(text).toContain("return NextResponse.json({ ok: true })");
    expect(text).not.toContain("user_not_found");
    expect(text).not.toContain("No user");
  });

  it("gates direct local test login to localhost and allowed emails", () => {
    const route = source("src/app/api/auth/send/route.ts");
    const page = source("src/app/login/page.tsx");

    expect(route).toContain("isLocalTestLoginRequest(req, email)");
    expect(route).toContain('process.env["ENABLE_TEST_LOGIN"] !== "true"');
    expect(route).toContain("TEST_LOGIN_ALLOWED_EMAILS");
    expect(route).toContain('hostname === "localhost"');
    expect(route).toContain('hostname === "127.0.0.1"');
    expect(route).toContain("sessionCookieOptions(req.url)");
    expect(route).toContain("directLogin: true");
    expect(page).toContain("data.directLogin");
    expect(page).toContain("window.location.href = data.redirectTo");
  });
});
