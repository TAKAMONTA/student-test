import { sql } from "drizzle-orm";
import type { Db } from "@/db/client";

export type RateLimitBucket = {
  key: string;
  limit: number;
};

export function normalizeRateLimitEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getClientIp(headers: Pick<Headers, "get">): string {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export async function reserveRateLimits(
  db: Db,
  buckets: RateLimitBucket[],
  windowSeconds: number,
  now: Date = new Date(),
): Promise<{ allowed: boolean }> {
  if (buckets.length === 0) return { allowed: true };

  const nowMs = now.getTime();
  const resetAtMs = nowMs + windowSeconds * 1000;
  await db.run(sql`DELETE FROM rate_limits WHERE reset_at <= ${nowMs}`);

  const values = sql.join(
    buckets.map((bucket) => sql`(${bucket.key}, ${bucket.limit})`),
    sql`, `,
  );

  const result = await db.run(sql`
    WITH incoming(bucket_key, limit_value) AS (
      VALUES ${values}
    ),
    eligible AS (
      SELECT count(*) AS allowed_count
      FROM incoming
      LEFT JOIN rate_limits
        ON rate_limits.bucket_key = incoming.bucket_key
      WHERE rate_limits.bucket_key IS NULL
        OR rate_limits.reset_at <= ${nowMs}
        OR rate_limits.count < incoming.limit_value
    ),
    should_update AS (
      SELECT allowed_count = (SELECT count(*) FROM incoming) AS ok
      FROM eligible
    )
    INSERT INTO rate_limits (bucket_key, count, reset_at, updated_at)
    SELECT bucket_key, 1, ${resetAtMs}, ${nowMs}
    FROM incoming
    WHERE (SELECT ok FROM should_update)
    ON CONFLICT(bucket_key) DO UPDATE SET
      count = CASE
        WHEN reset_at <= ${nowMs} THEN 1
        ELSE count + 1
      END,
      reset_at = CASE
        WHEN reset_at <= ${nowMs} THEN ${resetAtMs}
        ELSE reset_at
      END,
      updated_at = ${nowMs}
    WHERE (SELECT ok FROM should_update)
  `);

  const changes = Number((result as D1Result).meta?.changes ?? 0);
  return { allowed: changes === buckets.length };
}
