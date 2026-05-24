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
