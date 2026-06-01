import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("analytics instrumentation", () => {
  it("layout mounts the PostHogProvider", () => {
    const text = source("src/app/layout.tsx");
    expect(text).toContain("import PostHogProvider");
    expect(text).toContain("<PostHogProvider>");
  });

  it("LP captures lp_cta_clicked", () => {
    const text = source("src/app/page.tsx");
    expect(text).toContain('"lp_cta_clicked"');
  });

  it("login captures login_email_submitted with hashed email", () => {
    const text = source("src/app/login/page.tsx");
    expect(text).toContain("hashEmailForAnalytics");
    expect(text).toContain('"login_email_submitted"');
  });

  it("buy captures purchase_initiated for both Stripe and iOS paths", () => {
    const text = source("src/app/buy/BuyPageClient.tsx");
    expect(text).toContain('"purchase_initiated"');
    expect(text).toContain('channel: "stripe"');
    expect(text).toContain('channel: "ios"');
  });

  it("buy identifies authenticated user via profile fetch", () => {
    const text = source("src/app/buy/BuyPageClient.tsx");
    expect(text).toContain("identifyUser");
    expect(text).toContain("profile.id");
  });

  it("app layout mounts PostHogIdentify for authenticated users", () => {
    const text = source("src/app/(app)/layout.tsx");
    expect(text).toContain("PostHogIdentify");
    expect(text).toContain("authResult.id");
  });

  it("profile page provides feedback channel via mailto with analytics", () => {
    const text = source("src/app/(app)/profile/page.tsx");
    expect(text).toContain("mailto:");
    expect(text).toContain("SUPPORT_EMAIL");
    expect(text).toContain('"feedback_initiated"');
  });

  it("auth verify captures login_completed server-side", () => {
    const text = source("src/app/api/auth/verify/route.ts");
    expect(text).toContain("captureServerEvent");
    expect(text).toContain('"login_completed"');
  });

  it("stripe webhook captures purchase_completed and purchase_failed", () => {
    const text = source("src/app/api/stripe/webhook/route.ts");
    expect(text).toContain('"purchase_completed"');
    expect(text).toContain('"purchase_failed"');
    expect(text).toContain("hashEmailForAnalytics");
  });

  it("apple iap verify captures purchase_completed", () => {
    const text = source("src/app/api/apple/iap/verify/route.ts");
    expect(text).toContain('"purchase_completed"');
    expect(text).toContain('channel: "ios"');
  });

  it("apple notifications capture purchase_failed on REFUND/REVOKE", () => {
    const text = source("src/app/api/apple/iap/notifications/route.ts");
    expect(text).toContain('"purchase_failed"');
    expect(text).toContain('"REFUND"');
    expect(text).toContain('"REVOKE"');
  });

  it("privacy policy discloses analytics", () => {
    const text = source("src/app/privacy/page.tsx");
    expect(text).toContain("PostHog");
    expect(text).toContain("Do Not Track");
    expect(text).toContain("ハッシュ化");
  });

  it("mock exam fires review prompt on completion with analytics", () => {
    const text = source("src/app/(app)/mock-exam/page.tsx");
    expect(text).toContain("requestStoreReview");
    expect(text).toContain('"review_prompt_requested"');
    expect(text).toContain('"mock_exam_done"');
  });
});
