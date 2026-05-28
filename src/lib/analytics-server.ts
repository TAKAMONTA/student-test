export type CaptureEventInput = {
  host: string;
  apiKey: string;
  event: string;
  distinctId: string;
  properties?: Record<string, unknown>;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 1_000;

export async function captureServerEvent(input: CaptureEventInput): Promise<void> {
  if (!input.host || !input.apiKey) return;

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  const body = JSON.stringify({
    api_key: input.apiKey,
    event: input.event,
    distinct_id: input.distinctId,
    properties: input.properties ?? {},
    timestamp: new Date().toISOString(),
  });

  try {
    await fetch(`${input.host.replace(/\/+$/, "")}/i/v0/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: controller.signal,
    });
  } catch (err) {
    console.warn(
      "[analytics-server] capture failed:",
      err instanceof Error ? err.message : err,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
