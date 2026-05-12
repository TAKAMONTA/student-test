interface CloudflareEnv {
  [key: string]: unknown;
  DB: D1Database;
  AI_RATE_LIMIT: KVNamespace;
  IMAGES: R2Bucket;
  ASSETS: Fetcher;
  APP_URL: string;
}
