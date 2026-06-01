import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("buy page ios purchase mode", () => {
  it("has StoreKit bridge calls and restore purchase UI", () => {
    const text = source("src/app/buy/BuyPageClient.tsx");

    expect(text).toContain("isIosAppUserAgent");
    expect(text).toContain("window.webkit.messageHandlers.iap.postMessage");
    expect(text).toContain('type: "purchase"');
    expect(text).toContain('type: "restore"');
    expect(text).toContain("App Storeで購入");
    expect(text).toContain("購入を復元");
  });

  it("requires login before StoreKit and hides web checkout copy in iOS mode", () => {
    const text = source("src/app/buy/BuyPageClient.tsx");

    expect(text).toContain("isAuthenticated");
    expect(text).toContain("if (!isAuthenticated)");
    expect(text).toContain("isIosAuthPending");
    expect(text).toContain("購入状態を確認中");
    expect(text).toContain("isIosLoginRequired");
    expect(text).toContain("ログインしてから購入する");
    expect(text).toContain("const displaySteps = isIosApp ? IOS_STEPS : WEB_STEPS");
    expect(text).toContain("const displayFaqs = isIosApp ? IOS_FAQS : WEB_FAQS");
    expect(text).toContain("価格はApp Storeの購入確認画面に表示されます");
  });

  it("derives the initial iOS mode from request user agent before hydration", () => {
    const page = source("src/app/buy/page.tsx");
    const client = source("src/app/buy/BuyPageClient.tsx");

    expect(page).toContain("headers()");
    expect(page).toContain('headersList.get("user-agent")');
    expect(page).toContain("initialIsIosApp");
    expect(client).toContain("initialIsIosApp");
    expect(client).toContain("useState(initialIsIosApp)");
  });
});
