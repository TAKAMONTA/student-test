import { sql, and, eq } from "drizzle-orm";
import type { Db } from "@/db/client";
import { aiRateLimits } from "@/db/schema";

export function getUtcDayKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export async function reserveAiQuestion(
  db: Db,
  opts: { userId: string; day: string; limit: number; now?: Date },
): Promise<{ allowed: boolean; remaining: number }> {
  const now = opts.now ?? new Date();
  const nowMs = now.getTime();
  const result = await db.run(sql`
    INSERT INTO ai_rate_limits (user_id, day, count, updated_at)
    VALUES (${opts.userId}, ${opts.day}, 1, ${nowMs})
    ON CONFLICT(user_id, day) DO UPDATE SET
      count = count + 1,
      updated_at = ${nowMs}
    WHERE count < ${opts.limit}
  `);

  const changed = Number((result as D1Result).meta?.changes ?? 0) > 0;
  const row = await db
    .select({ count: aiRateLimits.count })
    .from(aiRateLimits)
    .where(and(eq(aiRateLimits.userId, opts.userId), eq(aiRateLimits.day, opts.day)))
    .get();

  const count = row?.count ?? opts.limit;
  return {
    allowed: changed,
    remaining: Math.max(0, opts.limit - count),
  };
}

export async function refundAiQuestion(
  db: Db,
  opts: { userId: string; day: string; now?: Date },
): Promise<void> {
  const now = opts.now ?? new Date();
  const nowMs = now.getTime();
  await db.run(sql`
    UPDATE ai_rate_limits
    SET
      count = max(count - 1, 0),
      updated_at = ${nowMs}
    WHERE user_id = ${opts.userId}
      AND day = ${opts.day}
      AND count > 0
  `);
}
