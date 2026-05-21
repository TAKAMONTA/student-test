import { describe, expect, it } from "vitest";
import type { SQL } from "drizzle-orm";
import { SQLiteAsyncDialect } from "drizzle-orm/sqlite-core";
import { getUtcDayKey, shouldRefundAiQuestion, refundAiQuestion, reserveAiQuestion } from "@/lib/ai-rate-limit";

type AiRateLimitRow = {
  user_id: string;
  day: string;
  count: number;
  updated_at: number;
};

type BuiltQuery = {
  sql: string;
  params: unknown[];
};

class MemoryAiRateLimitDb {
  private dialect = new SQLiteAsyncDialect();
  private rowsByKey = new Map<string, AiRateLimitRow>();
  private lastKey: string | undefined;
  runs: BuiltQuery[] = [];

  async run(query: SQL) {
    const built = this.dialect.sqlToQuery(query);
    this.runs.push(built);

    if (built.sql.includes("UPDATE ai_rate_limits")) {
      const updatedAt = built.params[0];
      const userId = String(built.params[1]);
      const day = String(built.params[2]);
      expect(typeof updatedAt).toBe("number");
      const key = `${userId}:${day}`;
      const existing = this.rowsByKey.get(key);
      if (!existing || existing.count <= 0) {
        return { meta: { changes: 0 } };
      }
      existing.count = Math.max(existing.count - 1, 0);
      existing.updated_at = Number(updatedAt);
      this.lastKey = key;
      return { meta: { changes: 1 } };
    }

    const userId = String(built.params[0]);
    const day = String(built.params[1]);
    const insertedAt = built.params[2];
    const updatedAt = built.params[3];
    const limit = Number(built.params[4]);
    expect(typeof insertedAt).toBe("number");
    expect(typeof updatedAt).toBe("number");
    const key = `${userId}:${day}`;
    this.lastKey = key;

    const existing = this.rowsByKey.get(key);
    if (!existing) {
      this.rowsByKey.set(key, {
        user_id: userId,
        day,
        count: 1,
        updated_at: Number(insertedAt),
      });
      return { meta: { changes: 1 } };
    }

    if (existing.count < limit) {
      existing.count += 1;
      existing.updated_at = Number(updatedAt);
      return { meta: { changes: 1 } };
    }

    return { meta: { changes: 0 } };
  }

  select() {
    return {
      from: () => ({
        where: () => ({
          get: async () => {
            const row = this.lastKey ? this.rowsByKey.get(this.lastKey) : undefined;
            return row ? { count: row.count } : undefined;
          },
        }),
      }),
    };
  }

  rows(): AiRateLimitRow[] {
    return [...this.rowsByKey.values()].sort((a, b) =>
      `${a.user_id}:${a.day}`.localeCompare(`${b.user_id}:${b.day}`),
    );
  }
}

describe("ai-rate-limit helpers", () => {
  it("builds UTC day keys", () => {
    expect(getUtcDayKey(new Date("2026-05-21T00:30:00.000Z"))).toBe("2026-05-21");
    expect(getUtcDayKey(new Date("2026-05-20T23:59:59.999Z"))).toBe("2026-05-20");
  });

  it("only refunds when no AI output was delivered", () => {
    expect(shouldRefundAiQuestion({ deliveredOutput: false })).toBe(true);
    expect(shouldRefundAiQuestion({ deliveredOutput: true })).toBe(false);
  });

  it("reserves AI questions atomically until the daily limit", async () => {
    const memoryDb = new MemoryAiRateLimitDb();
    const db = memoryDb as unknown as Parameters<typeof reserveAiQuestion>[0];
    const day = "2026-05-21";

    await expect(
      reserveAiQuestion(db, { userId: "user_1", day, limit: 2, now: new Date(0) }),
    ).resolves.toEqual({ allowed: true, remaining: 1 });
    await expect(
      reserveAiQuestion(db, { userId: "user_1", day, limit: 2, now: new Date(1_000) }),
    ).resolves.toEqual({ allowed: true, remaining: 0 });
    await expect(
      reserveAiQuestion(db, { userId: "user_1", day, limit: 2, now: new Date(2_000) }),
    ).resolves.toEqual({ allowed: false, remaining: 0 });

    expect(memoryDb.rows()).toEqual([
      { user_id: "user_1", day, count: 2, updated_at: 1_000 },
    ]);
    expect(memoryDb.runs.some((run) => run.sql.includes("ON CONFLICT(user_id, day) DO UPDATE"))).toBe(true);
    expect(memoryDb.runs.some((run) => run.sql.includes("WHERE count <"))).toBe(true);
  });

  it("refunds a reserved AI question after a failed answer", async () => {
    const memoryDb = new MemoryAiRateLimitDb();
    const db = memoryDb as unknown as Parameters<typeof reserveAiQuestion>[0];
    const day = "2026-05-21";

    await reserveAiQuestion(db, { userId: "user_1", day, limit: 2, now: new Date(0) });
    await refundAiQuestion(db, { userId: "user_1", day, now: new Date(1_000) });

    expect(memoryDb.rows()).toEqual([
      { user_id: "user_1", day, count: 0, updated_at: 1_000 },
    ]);
    expect(memoryDb.runs.some((run) => run.sql.includes("UPDATE ai_rate_limits"))).toBe(true);
    expect(memoryDb.runs.some((run) => run.sql.includes("count = max(count - 1, 0)"))).toBe(true);
  });
});
