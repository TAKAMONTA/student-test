import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getDb() {
  const { env } = getCloudflareContext<CloudflareEnv>();
  return drizzle(env.DB, { schema });
}

export type Db = ReturnType<typeof getDb>;
