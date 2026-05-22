import { describe, expect, it } from "vitest";
import {
  claimStripePurchaseEmail,
  completeStripePurchaseEmail,
  getCheckoutSessionEmail,
  getPaymentIntentId,
  isUnrecoverableStripePurchase,
  shouldAttemptPurchaseEmail,
  shouldResumeStripePurchase,
} from "@/lib/stripe-purchase";
import type { SQL } from "drizzle-orm";
import { SQLiteAsyncDialect } from "drizzle-orm/sqlite-core";

type BuiltQuery = {
  sql: string;
  params: unknown[];
};

class MemoryStripePurchaseDb {
  private dialect = new SQLiteAsyncDialect();
  private statuses = new Map<string, string>();
  runs: BuiltQuery[] = [];

  constructor(rows: Record<string, string>) {
    this.statuses = new Map(Object.entries(rows));
  }

  async run(query: SQL) {
    const built = this.dialect.sqlToQuery(query);
    this.runs.push(built);

    if (built.sql.includes("email_send_status = ?") && built.sql.includes("email_send_status = 'sending'")) {
      const status = String(built.params[0]);
      const sessionId = String(built.params[1]);
      if (this.statuses.get(sessionId) !== "sending") {
        return { meta: { changes: 0 } };
      }
      this.statuses.set(sessionId, status);
      return { meta: { changes: 1 } };
    }

    if (built.sql.includes("email_send_status = 'sending'")) {
      const sessionId = String(built.params[0]);
      const current = this.statuses.get(sessionId);
      if (current !== "skipped" && current !== "failed") {
        return { meta: { changes: 0 } };
      }
      this.statuses.set(sessionId, "sending");
      return { meta: { changes: 1 } };
    }

    throw new Error(`unexpected query: ${built.sql}`);
  }

  status(sessionId: string): string | undefined {
    return this.statuses.get(sessionId);
  }
}

describe("stripe purchase helpers", () => {
  it("prefers metadata email", () => {
    expect(
      getCheckoutSessionEmail({
        metadata: { email: "buyer@example.com" },
        customer_details: { email: "stripe@example.com" },
        customer_email: "fallback@example.com",
      }),
    ).toBe("buyer@example.com");
  });

  it("falls back to Stripe customer email fields", () => {
    expect(
      getCheckoutSessionEmail({
        metadata: {},
        customer_details: { email: "stripe@example.com" },
        customer_email: "fallback@example.com",
      }),
    ).toBe("stripe@example.com");
  });

  it("normalizes payment intent id variants", () => {
    expect(getPaymentIntentId("pi_123")).toBe("pi_123");
    expect(getPaymentIntentId({ id: "pi_456" })).toBe("pi_456");
    expect(getPaymentIntentId(null)).toBeNull();
  });

  it("resumes incomplete webhook state but skips completed purchases", () => {
    expect(
      shouldResumeStripePurchase({
        userId: null,
        purchaseEmail: "buyer@example.com",
        emailSendStatus: "skipped",
      }),
    ).toBe(true);
    expect(
      shouldResumeStripePurchase({
        userId: "user_1",
        purchaseEmail: "buyer@example.com",
        emailSendStatus: "skipped",
      }),
    ).toBe(true);
    expect(
      shouldResumeStripePurchase({
        userId: "user_1",
        purchaseEmail: "buyer@example.com",
        emailSendStatus: "sent",
      }),
    ).toBe(false);
    expect(
      shouldResumeStripePurchase({
        userId: "user_1",
        purchaseEmail: "buyer@example.com",
        emailSendStatus: "failed",
      }),
    ).toBe(true);
    expect(
      shouldResumeStripePurchase({
        userId: null,
        purchaseEmail: null,
        emailSendStatus: "skipped",
      }),
    ).toBe(false);
    expect(
      shouldResumeStripePurchase(
        {
          userId: null,
          purchaseEmail: null,
          emailSendStatus: "skipped",
        },
        { userId: "user_1" },
      ),
    ).toBe(true);
    expect(
      shouldResumeStripePurchase(
        {
          userId: null,
          purchaseEmail: null,
          emailSendStatus: "sent",
        },
        { userId: "user_1" },
      ),
    ).toBe(true);
    expect(
      shouldResumeStripePurchase(
        {
          userId: null,
          purchaseEmail: null,
          emailSendStatus: "skipped",
        },
        { purchaseEmail: "buyer@example.com" },
      ),
    ).toBe(true);
  });

  it("does not attempt another purchase email after a successful send", () => {
    expect(shouldAttemptPurchaseEmail("skipped")).toBe(true);
    expect(shouldAttemptPurchaseEmail("failed")).toBe(true);
    expect(shouldAttemptPurchaseEmail("sending")).toBe(false);
    expect(shouldAttemptPurchaseEmail("sent")).toBe(false);
  });

  it("identifies duplicate state that cannot resume a purchase grant", () => {
    expect(
      isUnrecoverableStripePurchase({
        userId: null,
        purchaseEmail: null,
        emailSendStatus: "skipped",
      }),
    ).toBe(true);
    expect(
      isUnrecoverableStripePurchase(
        {
          userId: null,
          purchaseEmail: null,
          emailSendStatus: "skipped",
        },
        { userId: "user_1" },
      ),
    ).toBe(false);
    expect(
      isUnrecoverableStripePurchase(
        {
          userId: null,
          purchaseEmail: null,
          emailSendStatus: "skipped",
        },
        { purchaseEmail: "buyer@example.com" },
      ),
    ).toBe(false);
    expect(
      isUnrecoverableStripePurchase({
        userId: "user_1",
        purchaseEmail: "buyer@example.com",
        emailSendStatus: "sent",
      }),
    ).toBe(false);
  });

  it("claims purchase email delivery exactly once for retryable statuses", async () => {
    const memoryDb = new MemoryStripePurchaseDb({
      skipped_session: "skipped",
      failed_session: "failed",
      sending_session: "sending",
      sent_session: "sent",
    });
    const db = memoryDb as unknown as Parameters<typeof claimStripePurchaseEmail>[0];

    await expect(claimStripePurchaseEmail(db, "skipped_session")).resolves.toBe(true);
    await expect(claimStripePurchaseEmail(db, "skipped_session")).resolves.toBe(false);
    await expect(claimStripePurchaseEmail(db, "failed_session")).resolves.toBe(true);
    await expect(claimStripePurchaseEmail(db, "sending_session")).resolves.toBe(false);
    await expect(claimStripePurchaseEmail(db, "sent_session")).resolves.toBe(false);

    expect(memoryDb.status("skipped_session")).toBe("sending");
    expect(memoryDb.status("failed_session")).toBe("sending");
    expect(memoryDb.runs.some((run) => run.sql.includes("email_send_status IN ('skipped', 'failed')"))).toBe(true);
  });

  it("only completes email delivery from a claimed sending state", async () => {
    const memoryDb = new MemoryStripePurchaseDb({
      sending_session: "sending",
      sent_session: "sent",
    });
    const db = memoryDb as unknown as Parameters<typeof completeStripePurchaseEmail>[0];

    await completeStripePurchaseEmail(db, { sessionId: "sending_session", status: "sent" });
    await completeStripePurchaseEmail(db, { sessionId: "sent_session", status: "failed" });

    expect(memoryDb.status("sending_session")).toBe("sent");
    expect(memoryDb.status("sent_session")).toBe("sent");
  });
});
