# iOS Web IAP Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the web/backend foundation that lets the future iOS shell grant permanent access through Apple In-App Purchase without breaking existing Stripe web purchases.

**Architecture:** Keep `users.purchased_at` as the single entitlement flag. Web Stripe purchases continue through existing Stripe routes; iOS purchases use new Apple transaction verification routes and write to a new `apple_purchases` audit table. The first implementation phase stops at the Web/API boundary; the native SwiftUI/WKWebView shell is a separate follow-up plan.

**Tech Stack:** Next.js 16 App Router Route Handlers, TypeScript, Drizzle ORM on Cloudflare D1, `jose`, Zod, Vitest, Cloudflare Workers/OpenNext.

---

## Scope

This plan implements Phase 1 from [2026-05-23-ios-release-design.md](/Users/taka/中学一年生中間テスト対策/docs/superpowers/specs/2026-05-23-ios-release-design.md): Web-side IAP readiness.

It does not create the Xcode project, StoreKit native code, icons, screenshots, or TestFlight/App Store Connect setup. Those belong to the Phase 2 iOS shell plan and Phase 3 submission plan.

## File Structure

- Modify `src/db/schema.ts`: add `applePurchases`.
- Create `migrations/0005_apple_iap.sql`: D1 table and indexes.
- Create `src/lib/apple-iap.ts`: Apple transaction JWS decoding, App Store Server API JWT creation, transaction lookup, and transaction validation.
- Create `src/lib/apple-purchase.ts`: pure purchase grant orchestration that can be tested with a fake DB adapter.
- Create `src/app/api/apple/iap/verify/route.ts`: logged-in StoreKit purchase/restore verification endpoint.
- Create `src/lib/apple-notifications.ts`: App Store Server Notifications V2 payload handling.
- Create `src/app/api/apple/iap/notifications/route.ts`: public Apple notification endpoint.
- Modify `src/app/api/auth/send/route.ts`: create unpaid users before sending a login link.
- Create `src/lib/ios-app.ts`: iOS app WebView detection and bridge message helpers.
- Modify `src/app/buy/page.tsx`: render iOS IAP purchase/restore UI when loaded inside the native iOS app.
- Create `src/app/.well-known/apple-app-site-association/route.ts`: Universal Links association file.
- Modify `.env.local.example`: document Apple env vars.
- Create/modify tests under `tests/lib` and `tests/security`.

## Task 1: Add Apple Purchase Schema

**Files:**
- Modify: `src/db/schema.ts`
- Create: `migrations/0005_apple_iap.sql`
- Test: `tests/security/apple-iap-schema.test.ts`

- [ ] **Step 1: Write the failing schema test**

Create `tests/security/apple-iap-schema.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("apple iap schema", () => {
  it("defines the apple purchase audit table in Drizzle schema", () => {
    const text = source("src/db/schema.ts");

    expect(text).toContain("export const applePurchases");
    expect(text).toContain('sqliteTable("apple_purchases"');
    expect(text).toContain('transactionId: text("transaction_id").primaryKey()');
    expect(text).toContain('originalTransactionId: text("original_transaction_id")');
    expect(text).toContain('webOrderLineItemId: text("web_order_line_item_id")');
    expect(text).toContain('userId: text("user_id")');
    expect(text).toContain('productId: text("product_id").notNull()');
    expect(text).toContain('signedTransactionInfo: text("signed_transaction_info").notNull()');
  });

  it("ships a D1 migration for the apple purchase audit table", () => {
    const text = source("migrations/0005_apple_iap.sql");

    expect(text).toContain("CREATE TABLE `apple_purchases`");
    expect(text).toContain("`transaction_id` text PRIMARY KEY NOT NULL");
    expect(text).toContain("`original_transaction_id` text");
    expect(text).toContain("`user_id` text NOT NULL");
    expect(text).toContain("`signed_transaction_info` text NOT NULL");
    expect(text).toContain("CREATE INDEX `apple_purchases_user_id_idx`");
    expect(text).toContain("CREATE INDEX `apple_purchases_original_transaction_id_idx`");
  });
});
```

- [ ] **Step 2: Run the schema test to verify it fails**

Run:

```bash
npm test -- tests/security/apple-iap-schema.test.ts
```

Expected: FAIL because `applePurchases` and `migrations/0005_apple_iap.sql` do not exist yet.

- [ ] **Step 3: Add the Drizzle schema**

In `src/db/schema.ts`, add this after `stripePurchases`:

```ts
export const applePurchases = sqliteTable("apple_purchases", {
  transactionId: text("transaction_id").primaryKey(),
  originalTransactionId: text("original_transaction_id"),
  webOrderLineItemId: text("web_order_line_item_id"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  productId: text("product_id").notNull(),
  environment: text("environment", {
    enum: ["Production", "Sandbox", "Xcode"],
  }).notNull(),
  purchaseDate: integer("purchase_date", { mode: "timestamp_ms" }).notNull(),
  revocationDate: integer("revocation_date", { mode: "timestamp_ms" }),
  revocationReason: integer("revocation_reason"),
  signedTransactionInfo: text("signed_transaction_info").notNull(),
  source: text("source", {
    enum: ["purchase", "restore", "update", "notification"],
  }).notNull(),
  notificationType: text("notification_type"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});
```

- [ ] **Step 4: Add the D1 migration**

Create `migrations/0005_apple_iap.sql`:

```sql
CREATE TABLE `apple_purchases` (
  `transaction_id` text PRIMARY KEY NOT NULL,
  `original_transaction_id` text,
  `web_order_line_item_id` text,
  `user_id` text NOT NULL,
  `product_id` text NOT NULL,
  `environment` text NOT NULL,
  `purchase_date` integer NOT NULL,
  `revocation_date` integer,
  `revocation_reason` integer,
  `signed_transaction_info` text NOT NULL,
  `source` text NOT NULL,
  `notification_type` text,
  `created_at` integer NOT NULL DEFAULT (unixepoch() * 1000),
  `updated_at` integer NOT NULL DEFAULT (unixepoch() * 1000),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX `apple_purchases_user_id_idx`
ON `apple_purchases` (`user_id`);

CREATE INDEX `apple_purchases_original_transaction_id_idx`
ON `apple_purchases` (`original_transaction_id`);
```

- [ ] **Step 5: Run the schema test to verify it passes**

Run:

```bash
npm test -- tests/security/apple-iap-schema.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/db/schema.ts migrations/0005_apple_iap.sql tests/security/apple-iap-schema.test.ts
git commit -m "feat: add apple iap purchase schema"
```

## Task 2: Add Apple IAP Transaction Helpers

**Files:**
- Create: `src/lib/apple-iap.ts`
- Test: `tests/lib/apple-iap.test.ts`

- [ ] **Step 1: Write the failing helper tests**

Create `tests/lib/apple-iap.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import {
  appStoreServerBaseUrl,
  decodeAppleJwsPayload,
  extractTransactionIdFromSignedTransactionInfo,
  fetchAppleTransactionInfo,
  validateAppleLifetimeTransaction,
} from "@/lib/apple-iap";

function unsignedJws(payload: unknown): string {
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.`;
}

const validPayload = {
  transactionId: "2000000123456789",
  originalTransactionId: "2000000123456789",
  webOrderLineItemId: "2000000000000001",
  bundleId: "jp.taka.chu1testkit",
  productId: "chu1_testkit_lifetime",
  environment: "Sandbox",
  purchaseDate: 1779450000000,
  type: "Non-Consumable",
};

describe("apple iap helpers", () => {
  it("decodes a compact JWS payload without trusting it", () => {
    expect(decodeAppleJwsPayload(unsignedJws(validPayload))).toMatchObject(validPayload);
  });

  it("extracts transaction id from a signed transaction payload", () => {
    expect(extractTransactionIdFromSignedTransactionInfo(unsignedJws(validPayload))).toBe("2000000123456789");
  });

  it("uses the correct App Store Server API base URL", () => {
    expect(appStoreServerBaseUrl("Production")).toBe("https://api.storekit.apple.com");
    expect(appStoreServerBaseUrl("Sandbox")).toBe("https://api.storekit-sandbox.apple.com");
    expect(appStoreServerBaseUrl("Xcode")).toBe("xcode-local");
  });

  it("validates the lifetime product claims", () => {
    expect(
      validateAppleLifetimeTransaction(validPayload, {
        bundleId: "jp.taka.chu1testkit",
        productId: "chu1_testkit_lifetime",
        environment: "Sandbox",
      }),
    ).toEqual({
      transactionId: "2000000123456789",
      originalTransactionId: "2000000123456789",
      webOrderLineItemId: "2000000000000001",
      productId: "chu1_testkit_lifetime",
      environment: "Sandbox",
      purchaseDate: new Date(1779450000000),
      revocationDate: null,
      revocationReason: null,
    });
  });

  it("rejects wrong bundle, wrong product, revoked transactions, and wrong type", () => {
    expect(() =>
      validateAppleLifetimeTransaction({ ...validPayload, bundleId: "bad.bundle" }, {
        bundleId: "jp.taka.chu1testkit",
        productId: "chu1_testkit_lifetime",
        environment: "Sandbox",
      }),
    ).toThrow("apple transaction bundle mismatch");

    expect(() =>
      validateAppleLifetimeTransaction({ ...validPayload, productId: "other_product" }, {
        bundleId: "jp.taka.chu1testkit",
        productId: "chu1_testkit_lifetime",
        environment: "Sandbox",
      }),
    ).toThrow("apple transaction product mismatch");

    expect(() =>
      validateAppleLifetimeTransaction({ ...validPayload, revocationDate: 1779460000000 }, {
        bundleId: "jp.taka.chu1testkit",
        productId: "chu1_testkit_lifetime",
        environment: "Sandbox",
      }),
    ).toThrow("apple transaction is revoked");

    expect(() =>
      validateAppleLifetimeTransaction({ ...validPayload, type: "Consumable" }, {
        bundleId: "jp.taka.chu1testkit",
        productId: "chu1_testkit_lifetime",
        environment: "Sandbox",
      }),
    ).toThrow("apple transaction type mismatch");
  });

  it("fetches official transaction info from the sandbox API", async () => {
    const serverJws = unsignedJws(validPayload);
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ signedTransactionInfo: serverJws }), { status: 200 }));

    const result = await fetchAppleTransactionInfo({
      signedTransactionInfo: unsignedJws(validPayload),
      environment: "Sandbox",
      issuerId: "issuer-id",
      keyId: "key-id",
      bundleId: "jp.taka.chu1testkit",
      privateKey: [
        "-----BEGIN PRIVATE KEY-----",
        "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLEdCuaTk3TcDquw3",
        "WsD6EURKjWDPjB9EGNC0tzSpslyhRANCAARVYTYpkojBjEWG/tK6fQQOSVMY+bn0",
        "yr9S7Zhuo7TgC3Vhoj74nqJy9E2iUcTbUQqo4+YCBREmUaGqj059R0qf",
        "-----END PRIVATE KEY-----",
      ].join("\n"),
      fetchImpl,
    });

    expect(result.signedTransactionInfo).toBe(serverJws);
    expect(result.payload).toMatchObject(validPayload);
    expect(fetchImpl.mock.calls[0]?.[0]).toBe("https://api.storekit-sandbox.apple.com/inApps/v1/transactions/2000000123456789");
    expect(fetchImpl.mock.calls[0]?.[1]?.headers).toMatchObject({ Authorization: expect.stringMatching(/^Bearer /) });
  });
});
```

- [ ] **Step 2: Run the helper tests to verify they fail**

Run:

```bash
npm test -- tests/lib/apple-iap.test.ts
```

Expected: FAIL because `src/lib/apple-iap.ts` does not exist.

- [ ] **Step 3: Create the Apple IAP helper module**

Create `src/lib/apple-iap.ts`:

```ts
import { SignJWT, importPKCS8 } from "jose";

export type AppleIapEnvironment = "Production" | "Sandbox" | "Xcode";
export type AppleIapSource = "purchase" | "restore" | "update";

export type AppleTransactionPayload = {
  transactionId?: string;
  originalTransactionId?: string;
  webOrderLineItemId?: string;
  bundleId?: string;
  productId?: string;
  environment?: string;
  purchaseDate?: number;
  revocationDate?: number;
  revocationReason?: number;
  type?: string;
};

export type ValidAppleTransaction = {
  transactionId: string;
  originalTransactionId: string | null;
  webOrderLineItemId: string | null;
  productId: string;
  environment: AppleIapEnvironment;
  purchaseDate: Date;
  revocationDate: Date | null;
  revocationReason: number | null;
};

export type AppleIapConfig = {
  bundleId: string;
  productId: string;
  environment: AppleIapEnvironment;
};

export type AppStoreServerConfig = AppleIapConfig & {
  issuerId: string;
  keyId: string;
  privateKey: string;
  fetchImpl?: typeof fetch;
};

function decodeBase64UrlJson<T>(part: string): T {
  const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

export function decodeAppleJwsPayload<T = AppleTransactionPayload>(jws: string): T {
  const parts = jws.split(".");
  if (parts.length !== 3 || !parts[1]) {
    throw new Error("invalid apple jws");
  }
  return decodeBase64UrlJson<T>(parts[1]);
}

export function extractTransactionIdFromSignedTransactionInfo(signedTransactionInfo: string): string {
  const payload = decodeAppleJwsPayload<AppleTransactionPayload>(signedTransactionInfo);
  if (!payload.transactionId) {
    throw new Error("apple transaction id missing");
  }
  return payload.transactionId;
}

export function appStoreServerBaseUrl(environment: AppleIapEnvironment): string {
  if (environment === "Production") return "https://api.storekit.apple.com";
  if (environment === "Sandbox") return "https://api.storekit-sandbox.apple.com";
  return "xcode-local";
}

export function validateAppleLifetimeTransaction(
  payload: AppleTransactionPayload,
  config: AppleIapConfig,
): ValidAppleTransaction {
  if (payload.bundleId !== config.bundleId) {
    throw new Error("apple transaction bundle mismatch");
  }
  if (payload.productId !== config.productId) {
    throw new Error("apple transaction product mismatch");
  }
  if (payload.environment !== config.environment) {
    throw new Error("apple transaction environment mismatch");
  }
  if (payload.type !== "Non-Consumable") {
    throw new Error("apple transaction type mismatch");
  }
  if (!payload.transactionId) {
    throw new Error("apple transaction id missing");
  }
  if (typeof payload.purchaseDate !== "number") {
    throw new Error("apple transaction purchase date missing");
  }
  if (payload.revocationDate) {
    throw new Error("apple transaction is revoked");
  }

  return {
    transactionId: payload.transactionId,
    originalTransactionId: payload.originalTransactionId ?? null,
    webOrderLineItemId: payload.webOrderLineItemId ?? null,
    productId: payload.productId,
    environment: config.environment,
    purchaseDate: new Date(payload.purchaseDate),
    revocationDate: null,
    revocationReason: payload.revocationReason ?? null,
  };
}

async function createAppStoreServerJwt(config: AppStoreServerConfig): Promise<string> {
  const privateKey = await importPKCS8(config.privateKey.replace(/\\n/g, "\n"), "ES256");
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({ bid: config.bundleId })
    .setProtectedHeader({ alg: "ES256", kid: config.keyId, typ: "JWT" })
    .setIssuer(config.issuerId)
    .setAudience("appstoreconnect-v1")
    .setIssuedAt(now)
    .setExpirationTime(now + 300)
    .sign(privateKey);
}

export async function fetchAppleTransactionInfo(
  opts: AppStoreServerConfig & { signedTransactionInfo: string },
): Promise<{ signedTransactionInfo: string; payload: AppleTransactionPayload }> {
  if (opts.environment === "Xcode") {
    return {
      signedTransactionInfo: opts.signedTransactionInfo,
      payload: decodeAppleJwsPayload(opts.signedTransactionInfo),
    };
  }

  const transactionId = extractTransactionIdFromSignedTransactionInfo(opts.signedTransactionInfo);
  const token = await createAppStoreServerJwt(opts);
  const fetchImpl = opts.fetchImpl ?? fetch;
  const res = await fetchImpl(`${appStoreServerBaseUrl(opts.environment)}/inApps/v1/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`apple transaction lookup failed: ${res.status}`);
  }

  const data = (await res.json()) as { signedTransactionInfo?: string };
  if (!data.signedTransactionInfo) {
    throw new Error("apple transaction lookup returned no signedTransactionInfo");
  }

  return {
    signedTransactionInfo: data.signedTransactionInfo,
    payload: decodeAppleJwsPayload(data.signedTransactionInfo),
  };
}

export function readAppleIapConfig(): AppStoreServerConfig {
  const bundleId = process.env["APPLE_BUNDLE_ID"];
  const productId = process.env["APPLE_IAP_PRODUCT_ID"];
  const environment = process.env["APPLE_APP_STORE_ENVIRONMENT"];
  const issuerId = process.env["APPLE_IAP_ISSUER_ID"];
  const keyId = process.env["APPLE_IAP_KEY_ID"];
  const privateKey = process.env["APPLE_IAP_PRIVATE_KEY"];

  if (!bundleId || !productId || !environment || !issuerId || !keyId || !privateKey) {
    throw new Error("apple iap environment is incomplete");
  }
  if (environment !== "Production" && environment !== "Sandbox" && environment !== "Xcode") {
    throw new Error("apple iap environment is invalid");
  }

  return { bundleId, productId, environment, issuerId, keyId, privateKey };
}
```

- [ ] **Step 4: Run the helper tests to verify they pass**

Run:

```bash
npm test -- tests/lib/apple-iap.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/apple-iap.ts tests/lib/apple-iap.test.ts
git commit -m "feat: add apple iap transaction helpers"
```

## Task 3: Add Purchase Grant Orchestration

**Files:**
- Create: `src/lib/apple-purchase.ts`
- Test: `tests/lib/apple-purchase.test.ts`

- [ ] **Step 1: Write the failing purchase grant tests**

Create `tests/lib/apple-purchase.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { verifyApplePurchaseForUser, type ApplePurchaseDb } from "@/lib/apple-purchase";

const signedTransactionInfo = "header.payload.signature";
const transaction = {
  transactionId: "tx_1",
  originalTransactionId: "tx_1",
  webOrderLineItemId: "line_1",
  productId: "chu1_testkit_lifetime",
  environment: "Sandbox" as const,
  purchaseDate: new Date("2026-05-24T00:00:00.000Z"),
  revocationDate: null,
  revocationReason: null,
};

class MemoryApplePurchaseDb implements ApplePurchaseDb {
  users = new Map<string, { purchasedAt: Date | null }>();
  purchases: unknown[] = [];
  updates: Array<{ userId: string; purchasedAt: Date }> = [];

  constructor() {
    this.users.set("user_1", { purchasedAt: null });
    this.users.set("purchased_user", { purchasedAt: new Date("2026-05-01T00:00:00.000Z") });
  }

  async getUser(userId: string) {
    const user = this.users.get(userId);
    return user ? { id: userId, purchasedAt: user.purchasedAt } : null;
  }

  async recordApplePurchase(record: unknown) {
    this.purchases.push(record);
  }

  async markUserPurchased(userId: string, purchasedAt: Date) {
    this.updates.push({ userId, purchasedAt });
    this.users.set(userId, { purchasedAt });
  }
}

describe("apple purchase grant orchestration", () => {
  it("records the transaction and grants purchase to an unpaid user", async () => {
    const db = new MemoryApplePurchaseDb();

    const result = await verifyApplePurchaseForUser({
      userId: "user_1",
      source: "purchase",
      signedTransactionInfo,
      deps: {
        db,
        fetchAndValidateTransaction: async () => ({ signedTransactionInfo, transaction }),
      },
    });

    expect(result).toEqual({ ok: true, purchasedAt: transaction.purchaseDate });
    expect(db.purchases).toHaveLength(1);
    expect(db.updates).toEqual([{ userId: "user_1", purchasedAt: transaction.purchaseDate }]);
  });

  it("records restore but preserves the first purchase date for an already purchased user", async () => {
    const db = new MemoryApplePurchaseDb();

    const result = await verifyApplePurchaseForUser({
      userId: "purchased_user",
      source: "restore",
      signedTransactionInfo,
      deps: {
        db,
        fetchAndValidateTransaction: async () => ({ signedTransactionInfo, transaction }),
      },
    });

    expect(result).toEqual({ ok: true, purchasedAt: new Date("2026-05-01T00:00:00.000Z") });
    expect(db.purchases).toHaveLength(1);
    expect(db.updates).toEqual([]);
  });

  it("rejects missing users", async () => {
    const db = new MemoryApplePurchaseDb();

    await expect(
      verifyApplePurchaseForUser({
        userId: "missing",
        source: "purchase",
        signedTransactionInfo,
        deps: {
          db,
          fetchAndValidateTransaction: async () => ({ signedTransactionInfo, transaction }),
        },
      }),
    ).rejects.toThrow("apple purchase user not found");
  });
});
```

- [ ] **Step 2: Run the purchase grant tests to verify they fail**

Run:

```bash
npm test -- tests/lib/apple-purchase.test.ts
```

Expected: FAIL because `src/lib/apple-purchase.ts` does not exist.

- [ ] **Step 3: Create the purchase grant module**

Create `src/lib/apple-purchase.ts`:

```ts
import type { AppleIapSource, ValidAppleTransaction } from "@/lib/apple-iap";

export type ApplePurchaseDb = {
  getUser(userId: string): Promise<{ id: string; purchasedAt: Date | null } | null>;
  recordApplePurchase(record: ApplePurchaseRecord): Promise<void>;
  markUserPurchased(userId: string, purchasedAt: Date): Promise<void>;
};

export type ApplePurchaseRecord = {
  userId: string;
  transaction: ValidAppleTransaction;
  source: AppleIapSource | "notification";
  signedTransactionInfo: string;
  notificationType: string | null;
};

export async function verifyApplePurchaseForUser(opts: {
  userId: string;
  signedTransactionInfo: string;
  source: AppleIapSource;
  deps: {
    db: ApplePurchaseDb;
    fetchAndValidateTransaction: (signedTransactionInfo: string) => Promise<{
      signedTransactionInfo: string;
      transaction: ValidAppleTransaction;
    }>;
  };
}): Promise<{ ok: true; purchasedAt: Date }> {
  const user = await opts.deps.db.getUser(opts.userId);
  if (!user) {
    throw new Error("apple purchase user not found");
  }

  const { signedTransactionInfo, transaction } = await opts.deps.fetchAndValidateTransaction(opts.signedTransactionInfo);

  await opts.deps.db.recordApplePurchase({
    userId: opts.userId,
    transaction,
    source: opts.source,
    signedTransactionInfo,
    notificationType: null,
  });

  if (user.purchasedAt) {
    return { ok: true, purchasedAt: user.purchasedAt };
  }

  await opts.deps.db.markUserPurchased(opts.userId, transaction.purchaseDate);
  return { ok: true, purchasedAt: transaction.purchaseDate };
}
```

- [ ] **Step 4: Run the purchase grant tests to verify they pass**

Run:

```bash
npm test -- tests/lib/apple-purchase.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/apple-purchase.ts tests/lib/apple-purchase.test.ts
git commit -m "feat: add apple purchase grant workflow"
```

## Task 4: Add StoreKit Verify Route

**Files:**
- Create: `src/app/api/apple/iap/verify/route.ts`
- Test: `tests/security/apple-iap-route.test.ts`

- [ ] **Step 1: Write the failing static route test**

Create `tests/security/apple-iap-route.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the route test to verify it fails**

Run:

```bash
npm test -- tests/security/apple-iap-route.test.ts
```

Expected: FAIL because the route does not exist.

- [ ] **Step 3: Create the verify route**

Create `src/app/api/apple/iap/verify/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { applePurchases, users } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import {
  fetchAppleTransactionInfo,
  readAppleIapConfig,
  validateAppleLifetimeTransaction,
  type AppleIapSource,
} from "@/lib/apple-iap";
import { verifyApplePurchaseForUser, type ApplePurchaseDb, type ApplePurchaseRecord } from "@/lib/apple-purchase";

const bodySchema = z.object({
  signedTransactionInfo: z.string().min(20),
  source: z.enum(["purchase", "restore", "update"]),
});

function createApplePurchaseDb(): ApplePurchaseDb {
  const db = getDb();

  return {
    async getUser(userId: string) {
      const row = await db
        .select({ id: users.id, purchasedAt: users.purchasedAt })
        .from(users)
        .where(eq(users.id, userId))
        .get();
      return row ?? null;
    },

    async recordApplePurchase(record: ApplePurchaseRecord) {
      const now = new Date();
      await db
        .insert(applePurchases)
        .values({
          transactionId: record.transaction.transactionId,
          originalTransactionId: record.transaction.originalTransactionId,
          webOrderLineItemId: record.transaction.webOrderLineItemId,
          userId: record.userId,
          productId: record.transaction.productId,
          environment: record.transaction.environment,
          purchaseDate: record.transaction.purchaseDate,
          revocationDate: record.transaction.revocationDate,
          revocationReason: record.transaction.revocationReason,
          signedTransactionInfo: record.signedTransactionInfo,
          source: record.source,
          notificationType: record.notificationType,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing()
        .execute();
    },

    async markUserPurchased(userId: string, purchasedAt: Date) {
      await db
        .update(users)
        .set({ purchasedAt, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .execute();
    },
  };
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof Response) return authResult;

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  let result: { ok: true; purchasedAt: Date };
  try {
    const config = readAppleIapConfig();
    result = await verifyApplePurchaseForUser({
      userId: authResult.id,
      signedTransactionInfo: parsed.data.signedTransactionInfo,
      source: parsed.data.source as AppleIapSource,
      deps: {
        db: createApplePurchaseDb(),
        fetchAndValidateTransaction: async (signedTransactionInfo) => {
          const official = await fetchAppleTransactionInfo({ ...config, signedTransactionInfo });
          return {
            signedTransactionInfo: official.signedTransactionInfo,
            transaction: validateAppleLifetimeTransaction(official.payload, config),
          };
        },
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Apple purchase verification failed";
    console.error("Apple purchase verification failed:", message);
    return NextResponse.json({ error: "Apple purchase verification failed" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, purchasedAt: result.purchasedAt.getTime() });
}
```

- [ ] **Step 4: Run the route test to verify it passes**

Run:

```bash
npm test -- tests/security/apple-iap-route.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run the focused Apple tests**

Run:

```bash
npm test -- tests/lib/apple-iap.test.ts tests/lib/apple-purchase.test.ts tests/security/apple-iap-route.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/apple/iap/verify/route.ts tests/security/apple-iap-route.test.ts
git commit -m "feat: add apple iap verify route"
```

## Task 5: Add Apple Server Notification Route

**Files:**
- Create: `src/lib/apple-notifications.ts`
- Create: `src/app/api/apple/iap/notifications/route.ts`
- Test: `tests/lib/apple-notifications.test.ts`
- Test: `tests/security/apple-notifications-route.test.ts`

- [ ] **Step 1: Write the failing notification helper test**

Create `tests/lib/apple-notifications.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { decodeAppleNotificationPayload, normalizeAppleNotification } from "@/lib/apple-notifications";

function unsignedJws(payload: unknown): string {
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.`;
}

const transactionPayload = {
  transactionId: "tx_1",
  originalTransactionId: "tx_1",
  webOrderLineItemId: "line_1",
  bundleId: "jp.taka.chu1testkit",
  productId: "chu1_testkit_lifetime",
  environment: "Sandbox",
  purchaseDate: 1779450000000,
  revocationDate: 1779460000000,
  revocationReason: 1,
  type: "Non-Consumable",
};

describe("apple notifications", () => {
  it("decodes notification signed payloads", () => {
    const signedTransactionInfo = unsignedJws(transactionPayload);
    const signedPayload = unsignedJws({
      notificationType: "REFUND",
      data: { signedTransactionInfo },
    });

    expect(decodeAppleNotificationPayload(signedPayload)).toEqual({
      notificationType: "REFUND",
      signedTransactionInfo,
      transactionPayload,
    });
  });

  it("normalizes transaction notification data", () => {
    const normalized = normalizeAppleNotification({
      notificationType: "REFUND",
      signedTransactionInfo: unsignedJws(transactionPayload),
      transactionPayload,
    });

    expect(normalized).toEqual({
      notificationType: "REFUND",
      signedTransactionInfo: expect.any(String),
      transactionId: "tx_1",
      originalTransactionId: "tx_1",
      webOrderLineItemId: "line_1",
      productId: "chu1_testkit_lifetime",
      environment: "Sandbox",
      purchaseDate: new Date(1779450000000),
      revocationDate: new Date(1779460000000),
      revocationReason: 1,
    });
  });
});
```

- [ ] **Step 2: Write the failing notification route test**

Create `tests/security/apple-notifications-route.test.ts`:

```ts
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
    expect(text).toContain("db.update(applePurchases)");
    expect(text).toContain("NextResponse.json({ ok: true })");
  });
});
```

- [ ] **Step 3: Run notification tests to verify they fail**

Run:

```bash
npm test -- tests/lib/apple-notifications.test.ts tests/security/apple-notifications-route.test.ts
```

Expected: FAIL because the helper and route do not exist.

- [ ] **Step 4: Create notification helper**

Create `src/lib/apple-notifications.ts`:

```ts
import { decodeAppleJwsPayload, type AppleTransactionPayload, type AppleIapEnvironment } from "@/lib/apple-iap";

export type DecodedAppleNotification = {
  notificationType: string;
  signedTransactionInfo: string;
  transactionPayload: AppleTransactionPayload;
};

export type NormalizedAppleNotification = {
  notificationType: string;
  signedTransactionInfo: string;
  transactionId: string;
  originalTransactionId: string | null;
  webOrderLineItemId: string | null;
  productId: string;
  environment: AppleIapEnvironment;
  purchaseDate: Date;
  revocationDate: Date | null;
  revocationReason: number | null;
};

export function decodeAppleNotificationPayload(signedPayload: string): DecodedAppleNotification {
  const payload = decodeAppleJwsPayload<{
    notificationType?: string;
    data?: { signedTransactionInfo?: string };
  }>(signedPayload);

  if (!payload.notificationType) {
    throw new Error("apple notification type missing");
  }
  if (!payload.data?.signedTransactionInfo) {
    throw new Error("apple notification transaction missing");
  }

  return {
    notificationType: payload.notificationType,
    signedTransactionInfo: payload.data.signedTransactionInfo,
    transactionPayload: decodeAppleJwsPayload(payload.data.signedTransactionInfo),
  };
}

export function normalizeAppleNotification(decoded: DecodedAppleNotification): NormalizedAppleNotification {
  const tx = decoded.transactionPayload;
  if (!tx.transactionId) throw new Error("apple notification transaction id missing");
  if (!tx.productId) throw new Error("apple notification product id missing");
  if (tx.environment !== "Production" && tx.environment !== "Sandbox" && tx.environment !== "Xcode") {
    throw new Error("apple notification environment invalid");
  }
  if (typeof tx.purchaseDate !== "number") {
    throw new Error("apple notification purchase date missing");
  }

  return {
    notificationType: decoded.notificationType,
    signedTransactionInfo: decoded.signedTransactionInfo,
    transactionId: tx.transactionId,
    originalTransactionId: tx.originalTransactionId ?? null,
    webOrderLineItemId: tx.webOrderLineItemId ?? null,
    productId: tx.productId,
    environment: tx.environment,
    purchaseDate: new Date(tx.purchaseDate),
    revocationDate: tx.revocationDate ? new Date(tx.revocationDate) : null,
    revocationReason: tx.revocationReason ?? null,
  };
}
```

- [ ] **Step 5: Create notification route**

Create `src/app/api/apple/iap/notifications/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/client";
import { applePurchases } from "@/db/schema";
import { decodeAppleNotificationPayload, normalizeAppleNotification } from "@/lib/apple-notifications";

const bodySchema = z.object({ signedPayload: z.string().min(20) });

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    const normalized = normalizeAppleNotification(decodeAppleNotificationPayload(parsed.data.signedPayload));
    const db = getDb();

    await db
      .update(applePurchases)
      .set({
        revocationDate: normalized.revocationDate,
        revocationReason: normalized.revocationReason,
        notificationType: normalized.notificationType,
        signedTransactionInfo: normalized.signedTransactionInfo,
        updatedAt: new Date(),
      })
      .where(eq(applePurchases.transactionId, normalized.transactionId))
      .execute();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Apple notification failed";
    console.error("Apple notification failed:", message);
    return NextResponse.json({ error: "Invalid notification" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 6: Run notification tests to verify they pass**

Run:

```bash
npm test -- tests/lib/apple-notifications.test.ts tests/security/apple-notifications-route.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/apple-notifications.ts src/app/api/apple/iap/notifications/route.ts tests/lib/apple-notifications.test.ts tests/security/apple-notifications-route.test.ts
git commit -m "feat: add apple server notification route"
```

## Task 6: Let Login Create Unpaid Users

**Files:**
- Modify: `src/app/api/auth/send/route.ts`
- Test: `tests/security/auth-send-registration.test.ts`

- [ ] **Step 1: Write the failing registration test**

Create `tests/security/auth-send-registration.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the registration test to verify it fails**

Run:

```bash
npm test -- tests/security/auth-send-registration.test.ts
```

Expected: FAIL because the route currently only sends email for existing users.

- [ ] **Step 3: Modify the auth send route**

In `src/app/api/auth/send/route.ts`, add `nanoid`:

```ts
import { nanoid } from "nanoid";
```

Replace the existing-user email block:

```ts
  const existing = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${email}`)
    .get();
  if (existing) {
    const { ctx } = getCloudflareContext();
    ctx.waitUntil(
      sendLoginEmail({
        email: existing.email,
        secret,
        resendApiKey,
        resendFromEmail,
        appUrl,
      }),
    );
  }
```

with:

```ts
  const existing = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${email}`)
    .get();

  const loginUser = existing ?? {
    id: nanoid(),
    email,
  };

  if (!existing) {
    await db
      .insert(users)
      .values({
        id: loginUser.id,
        email: loginUser.email,
      })
      .execute();
  }

  const { ctx } = getCloudflareContext();
  ctx.waitUntil(
    sendLoginEmail({
      email: loginUser.email,
      secret,
      resendApiKey,
      resendFromEmail,
      appUrl,
    }),
  );
```

- [ ] **Step 4: Run the registration test to verify it passes**

Run:

```bash
npm test -- tests/security/auth-send-registration.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run session and auth-related tests**

Run:

```bash
npm test -- tests/lib/session.test.ts tests/security/auth-send-registration.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/auth/send/route.ts tests/security/auth-send-registration.test.ts
git commit -m "feat: allow login to create unpaid users"
```

## Task 7: Add iOS App Detection and Purchase Bridge UI

**Files:**
- Create: `src/lib/ios-app.ts`
- Modify: `src/app/buy/page.tsx`
- Test: `tests/lib/ios-app.test.ts`
- Test: `tests/security/buy-page-ios.test.ts`

- [ ] **Step 1: Write iOS helper tests**

Create `tests/lib/ios-app.test.ts`:

```ts
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
```

- [ ] **Step 2: Write the buy-page static test**

Create `tests/security/buy-page-ios.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("buy page ios purchase mode", () => {
  it("has StoreKit bridge calls and restore purchase UI", () => {
    const text = source("src/app/buy/page.tsx");

    expect(text).toContain("isIosAppUserAgent");
    expect(text).toContain("window.webkit.messageHandlers.iap.postMessage");
    expect(text).toContain('type: "purchase"');
    expect(text).toContain('type: "restore"');
    expect(text).toContain("App Storeで購入");
    expect(text).toContain("購入を復元");
  });
});
```

- [ ] **Step 3: Run iOS UI tests to verify they fail**

Run:

```bash
npm test -- tests/lib/ios-app.test.ts tests/security/buy-page-ios.test.ts
```

Expected: FAIL because the helper and UI branch do not exist.

- [ ] **Step 4: Add the iOS app helper**

Create `src/lib/ios-app.ts`:

```ts
export const IOS_APP_USER_AGENT_TOKEN = "Chu1TestKitIOS/1";

export function isIosAppUserAgent(userAgent: string): boolean {
  return userAgent.includes(IOS_APP_USER_AGENT_TOKEN);
}
```

- [ ] **Step 5: Add the iOS StoreKit branch to the buy page**

In `src/app/buy/page.tsx`, import the helper:

```ts
import { isIosAppUserAgent } from "@/lib/ios-app";
```

Add this type near the top of the file:

```ts
type IosBridgeMessage = { type: "purchase" | "restore" };

declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        iap?: {
          postMessage: (message: IosBridgeMessage) => void;
        };
      };
    };
  }
}
```

Add state inside `BuyPage`:

```ts
  const [isIosApp, setIsIosApp] = useState(false);
```

Add this effect inside `BuyPage`:

```ts
  useEffect(() => {
    setIsIosApp(isIosAppUserAgent(window.navigator.userAgent));
  }, []);
```

Add these handlers inside `BuyPage`:

```ts
  function sendIosPurchaseMessage(type: "purchase" | "restore") {
    const bridge = window.webkit?.messageHandlers?.iap;
    if (!bridge) {
      setError("iOSアプリ内で購入を開始できませんでした。アプリを再起動してからもう一度お試しください。");
      return;
    }
    setError("");
    bridge.postMessage({ type });
  }
```

In the purchase card copy, branch Stripe wording:

```tsx
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {isIosApp
                    ? "月額料金はありません。App Storeの購入画面で買い切りアクセスを購入します。"
                    : "月額料金はありません。Stripeの決済画面に移動して購入します。"}
                </p>
```

Replace the non-purchased purchase form branch with this iOS-aware branch:

```tsx
                {isIosApp ? (
                  <>
                    {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

                    <button
                      onClick={() => sendIosPurchaseMessage("purchase")}
                      disabled={checking}
                      className="mt-5 w-full rounded-md bg-cyan-500 px-5 py-4 text-lg font-black text-slate-950 shadow-lg shadow-cyan-100 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {checking ? "確認中..." : "App Storeで購入"}
                    </button>

                    <button
                      onClick={() => sendIosPurchaseMessage("restore")}
                      disabled={checking}
                      className="mt-3 w-full rounded-md border border-slate-300 bg-white px-5 py-3 font-black text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      購入を復元
                    </button>

                    <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                      購入と復元はApp Storeの仕組みを使います。
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mt-6">
                      <label htmlFor="purchase-email" className="mb-2 block text-sm font-black text-slate-700">
                        ログインリンクを受け取るメールアドレス
                      </label>
                      <input
                        id="purchase-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full rounded-md border border-slate-300 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    {error && <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

                    <button
                      onClick={handlePurchase}
                      disabled={loading || checking}
                      className="mt-5 w-full rounded-md bg-cyan-500 px-5 py-4 text-lg font-black text-slate-950 shadow-lg shadow-cyan-100 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {checking ? "確認中..." : loading ? "決済画面を準備中..." : "980円で購入する"}
                    </button>

                    <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                      決済後、このメールアドレスにログインリンクを送信します。
                    </p>
                  </>
                )}
```

- [ ] **Step 6: Run iOS UI tests to verify they pass**

Run:

```bash
npm test -- tests/lib/ios-app.test.ts tests/security/buy-page-ios.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/ios-app.ts src/app/buy/page.tsx tests/lib/ios-app.test.ts tests/security/buy-page-ios.test.ts
git commit -m "feat: add ios app purchase bridge UI"
```

## Task 8: Add Universal Links Association Route

**Files:**
- Create: `src/app/.well-known/apple-app-site-association/route.ts`
- Modify: `.env.local.example`
- Test: `tests/security/apple-app-site-association.test.ts`

- [ ] **Step 1: Write the failing association route test**

Create `tests/security/apple-app-site-association.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("apple app site association route", () => {
  it("serves Universal Links details for login verification", () => {
    const text = source("src/app/.well-known/apple-app-site-association/route.ts");

    expect(text).toContain("APPLE_TEAM_ID");
    expect(text).toContain("APPLE_BUNDLE_ID");
    expect(text).toContain("appIDs");
    expect(text).toContain("/api/auth/verify*");
    expect(text).toContain("application/json");
  });

  it("documents required Apple env vars", () => {
    const text = source(".env.local.example");

    expect(text).toContain("APPLE_TEAM_ID=");
    expect(text).toContain("APPLE_BUNDLE_ID=");
    expect(text).toContain("APPLE_IAP_PRODUCT_ID=");
    expect(text).toContain("APPLE_APP_STORE_ENVIRONMENT=");
    expect(text).toContain("APPLE_IAP_ISSUER_ID=");
    expect(text).toContain("APPLE_IAP_KEY_ID=");
    expect(text).toContain("APPLE_IAP_PRIVATE_KEY=");
  });
});
```

- [ ] **Step 2: Run the association test to verify it fails**

Run:

```bash
npm test -- tests/security/apple-app-site-association.test.ts
```

Expected: FAIL because the route and env docs do not exist yet.

- [ ] **Step 3: Create the association route**

Create `src/app/.well-known/apple-app-site-association/route.ts`:

```ts
import { NextResponse } from "next/server";

export async function GET() {
  const teamId = process.env["APPLE_TEAM_ID"];
  const bundleId = process.env["APPLE_BUNDLE_ID"];

  if (!teamId || !bundleId) {
    return NextResponse.json({ error: "Apple app association is not configured" }, { status: 500 });
  }

  return NextResponse.json(
    {
      applinks: {
        details: [
          {
            appIDs: [`${teamId}.${bundleId}`],
            components: [
              {
                "/": "/api/auth/verify*",
                comment: "Open email magic links in the iOS app",
              },
            ],
          },
        ],
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
```

- [ ] **Step 4: Add env documentation**

Append these lines to `.env.local.example`:

```bash
APPLE_TEAM_ID=
APPLE_BUNDLE_ID=jp.taka.chu1testkit
APPLE_IAP_PRODUCT_ID=chu1_testkit_lifetime
APPLE_APP_STORE_ENVIRONMENT=Sandbox
APPLE_IAP_ISSUER_ID=
APPLE_IAP_KEY_ID=
APPLE_IAP_PRIVATE_KEY=
```

- [ ] **Step 5: Run the association test to verify it passes**

Run:

```bash
npm test -- tests/security/apple-app-site-association.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/app/.well-known/apple-app-site-association/route.ts .env.local.example tests/security/apple-app-site-association.test.ts
git commit -m "feat: add apple universal links association"
```

## Task 9: Add Release Documentation Updates

**Files:**
- Modify: `README.md`
- Create: `docs/release/2026-05-24-ios-iap-readiness.md`
- Test: `tests/security/ios-release-docs.test.ts`

- [ ] **Step 1: Write the failing docs test**

Create `tests/security/ios-release-docs.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("ios release docs", () => {
  it("documents the iOS IAP verification commands", () => {
    const text = source("docs/release/2026-05-24-ios-iap-readiness.md");

    expect(text).toContain("iOS IAP Readiness");
    expect(text).toContain("migrations/0005_apple_iap.sql");
    expect(text).toContain("APPLE_IAP_PRODUCT_ID");
    expect(text).toContain("App Store Server Notifications");
    expect(text).toContain("npm test");
    expect(text).toContain("npm run build");
  });

  it("links the iOS release docs from README", () => {
    const text = source("README.md");
    expect(text).toContain("docs/release/2026-05-24-ios-iap-readiness.md");
  });
});
```

- [ ] **Step 2: Run the docs test to verify it fails**

Run:

```bash
npm test -- tests/security/ios-release-docs.test.ts
```

Expected: FAIL because the release note does not exist and README does not link it.

- [ ] **Step 3: Create the release note**

Create `docs/release/2026-05-24-ios-iap-readiness.md`:

```md
# iOS IAP Readiness

Date: 2026-05-24

This release prepares the Web/API layer for a future iOS App Store build.

## Included

- Apple purchase audit table via `migrations/0005_apple_iap.sql`
- StoreKit transaction verification endpoint at `/api/apple/iap/verify`
- App Store Server Notifications endpoint at `/api/apple/iap/notifications`
- Unpaid user creation through email magic-link login
- iOS WebView detection for `/buy`
- Universal Links association file for email login return

## Required Secrets

- `APPLE_TEAM_ID`
- `APPLE_BUNDLE_ID`
- `APPLE_IAP_PRODUCT_ID`
- `APPLE_APP_STORE_ENVIRONMENT`
- `APPLE_IAP_ISSUER_ID`
- `APPLE_IAP_KEY_ID`
- `APPLE_IAP_PRIVATE_KEY`

## Manual Setup

1. Create the non-consumable IAP product in App Store Connect with product ID `chu1_testkit_lifetime`.
2. Create an In-App Purchase key and store its `.p8` content in `APPLE_IAP_PRIVATE_KEY`.
3. Configure App Store Server Notifications V2 to call `/api/apple/iap/notifications`.
4. Apply `migrations/0005_apple_iap.sql` to the remote D1 database before enabling iOS purchase verification.

## Verification

```bash
npm test
npx tsc --noEmit
npm run content:check
npm run build
```

## Notes

Web Stripe Checkout remains the purchase method for browsers. The iOS native app must hide Stripe purchase copy and call StoreKit through the WebView bridge.
```

- [ ] **Step 4: Link the release note from README**

In `README.md`, add this under the existing release docs or Deploy section:

```md
## iOS App Store Preparation

iOS IAP readiness is tracked in [docs/release/2026-05-24-ios-iap-readiness.md](/Users/taka/中学一年生中間テスト対策/docs/release/2026-05-24-ios-iap-readiness.md).
```

- [ ] **Step 5: Run the docs test to verify it passes**

Run:

```bash
npm test -- tests/security/ios-release-docs.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add README.md docs/release/2026-05-24-ios-iap-readiness.md tests/security/ios-release-docs.test.ts
git commit -m "docs: add ios iap readiness release notes"
```

## Task 10: Final Verification

**Files:**
- No code changes.

- [ ] **Step 1: Run focused iOS readiness tests**

Run:

```bash
npm test -- tests/lib/apple-iap.test.ts tests/lib/apple-purchase.test.ts tests/lib/apple-notifications.test.ts tests/lib/ios-app.test.ts tests/security/apple-iap-schema.test.ts tests/security/apple-iap-route.test.ts tests/security/apple-notifications-route.test.ts tests/security/auth-send-registration.test.ts tests/security/buy-page-ios.test.ts tests/security/apple-app-site-association.test.ts tests/security/ios-release-docs.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run all tests**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 3: Run typecheck**

Run:

```bash
npx tsc --noEmit
```

Expected: exits with code 0.

- [ ] **Step 4: Run content check**

Run:

```bash
npm run content:check
```

Expected: exits with code 0.

- [ ] **Step 5: Run production build**

Run:

```bash
npm run build
```

Expected: exits with code 0.

- [ ] **Step 6: Confirm only intended files changed**

Run:

```bash
git status --short
```

Expected: only files from this plan are modified or the working tree is clean after commits.

Known pre-existing untracked paths such as `.agents/`, `.claude/`, `.playwright-mcp/`, `skills-lock.json`, and older plan files may remain; do not stage or remove them as part of this plan.

## Self-Review Checklist

- Spec coverage: this plan covers Phase 1 Web/API readiness: schema, verification API, notifications API, login creation, iOS buy-page branch, Universal Links, env docs, and release notes.
- Excluded by design: native SwiftUI/WKWebView project, StoreKit native code, TestFlight, App Store screenshots, Privacy Manifest, and App Store Connect manual setup.
- TDD coverage: every implementation task starts with a failing test and ends with a focused passing test.
- Next.js 16 docs checked: Route Handlers, async `cookies()` / `headers()`, and `NextResponse`.
