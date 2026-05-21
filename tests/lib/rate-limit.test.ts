import { describe, expect, it } from "vitest";
import type { SQL } from "drizzle-orm";
import { SQLiteAsyncDialect } from "drizzle-orm/sqlite-core";
import { getClientIp, normalizeRateLimitEmail, reserveRateLimits } from "@/lib/rate-limit";

type RateLimitRow = {
  bucket_key: string;
  count: number;
  reset_at: number;
  updated_at: number;
};

type BuiltQuery = {
  sql: string;
  params: unknown[];
};

class MemoryRateLimitDb {
  private dialect = new SQLiteAsyncDialect();
  private buckets = new Map<string, RateLimitRow>();
  runs: BuiltQuery[] = [];

  async run(query: SQL) {
    const built = this.dialect.sqlToQuery(query);
    this.runs.push(built);

    if (built.sql.includes("DELETE FROM rate_limits")) {
      const nowMs = Number(built.params[0]);
      let changes = 0;
      for (const [key, bucket] of this.buckets) {
        if (bucket.reset_at <= nowMs) {
          this.buckets.delete(key);
          changes += 1;
        }
      }
      return { meta: { changes } };
    }

    const bucketCount = (built.params.length - 7) / 2;
    const incoming = Array.from({ length: bucketCount }, (_, index) => ({
      key: String(built.params[index * 2]),
      limit: Number(built.params[index * 2 + 1]),
    }));
    const nowMs = Number(built.params[bucketCount * 2]);
    const resetAtMs = Number(built.params[bucketCount * 2 + 1]);
    const allEligible = incoming.every((bucket) => {
      const existing = this.buckets.get(bucket.key);
      return !existing || existing.reset_at <= nowMs || existing.count < bucket.limit;
    });

    if (!allEligible) return { meta: { changes: 0 } };

    for (const bucket of incoming) {
      const existing = this.buckets.get(bucket.key);
      this.buckets.set(bucket.key, {
        bucket_key: bucket.key,
        count: !existing || existing.reset_at <= nowMs ? 1 : existing.count + 1,
        reset_at: !existing || existing.reset_at <= nowMs ? resetAtMs : existing.reset_at,
        updated_at: nowMs,
      });
    }
    return { meta: { changes: incoming.length } };
  }

  rows(): RateLimitRow[] {
    return [...this.buckets.values()].sort((a, b) => a.bucket_key.localeCompare(b.bucket_key));
  }
}

describe("rate-limit helpers", () => {
  it("normalizes email keys", () => {
    expect(normalizeRateLimitEmail("  USER@Example.COM ")).toBe("user@example.com");
  });

  it("extracts the client ip from Cloudflare or forwarded headers", () => {
    expect(getClientIp(new Headers({ "cf-connecting-ip": "203.0.113.10" }))).toBe("203.0.113.10");
    expect(getClientIp(new Headers({ "x-forwarded-for": "198.51.100.1, 198.51.100.2" }))).toBe("198.51.100.1");
    expect(getClientIp(new Headers())).toBe("unknown");
  });

  it("reserves multiple D1 buckets atomically", async () => {
    const memoryDb = new MemoryRateLimitDb();
    const db = memoryDb as unknown as Parameters<typeof reserveRateLimits>[0];

    await expect(
      reserveRateLimits(
        db,
        [
          { key: "auth_email:user@example.com", limit: 1 },
          { key: "auth_ip:203.0.113.10", limit: 2 },
        ],
        60,
        new Date(0),
      ),
    ).resolves.toEqual({ allowed: true });
    expect(memoryDb.rows()).toEqual([
      { bucket_key: "auth_email:user@example.com", count: 1, reset_at: 60_000, updated_at: 0 },
      { bucket_key: "auth_ip:203.0.113.10", count: 1, reset_at: 60_000, updated_at: 0 },
    ]);

    await expect(
      reserveRateLimits(
        db,
        [
          { key: "auth_email:user@example.com", limit: 1 },
          { key: "auth_ip:203.0.113.10", limit: 2 },
        ],
        60,
        new Date(10),
      ),
    ).resolves.toEqual({ allowed: false });
    expect(memoryDb.rows()).toEqual([
      { bucket_key: "auth_email:user@example.com", count: 1, reset_at: 60_000, updated_at: 0 },
      { bucket_key: "auth_ip:203.0.113.10", count: 1, reset_at: 60_000, updated_at: 0 },
    ]);
    expect(memoryDb.runs.some((run) => run.sql.includes("ON CONFLICT(bucket_key) DO UPDATE"))).toBe(true);
    expect(memoryDb.runs.some((run) => run.sql.includes("WHERE (SELECT ok FROM should_update)"))).toBe(true);
  });

  it("resets expired D1 buckets", async () => {
    const memoryDb = new MemoryRateLimitDb();
    const db = memoryDb as unknown as Parameters<typeof reserveRateLimits>[0];

    await reserveRateLimits(db, [{ key: "auth_email:user@example.com", limit: 1 }], 60, new Date(0));
    await expect(
      reserveRateLimits(db, [{ key: "auth_email:user@example.com", limit: 1 }], 60, new Date(61_000)),
    ).resolves.toEqual({ allowed: true });

    expect(memoryDb.rows()).toEqual([
      { bucket_key: "auth_email:user@example.com", count: 1, reset_at: 121_000, updated_at: 61_000 },
    ]);
    expect(memoryDb.runs.some((run) => run.sql.includes("DELETE FROM rate_limits WHERE reset_at <="))).toBe(true);
  });
});
