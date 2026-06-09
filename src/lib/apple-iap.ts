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
  environment?: AppleIapEnvironment;
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

export function normalizeAppleEnvironment(environment: unknown): AppleIapEnvironment {
  if (environment === "Production" || environment === "Sandbox" || environment === "Xcode") {
    return environment;
  }
  throw new Error("apple transaction environment invalid");
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
  const environment = normalizeAppleEnvironment(payload.environment);
  if (payload.type !== "Non-Consumable") {
    throw new Error("apple transaction type mismatch");
  }
  if (!payload.transactionId) {
    throw new Error("apple transaction id missing");
  }
  if (typeof payload.purchaseDate !== "number") {
    throw new Error("apple transaction purchase date missing");
  }
  if (typeof payload.revocationDate === "number") {
    throw new Error("apple transaction is revoked");
  }

  return {
    transactionId: payload.transactionId,
    originalTransactionId: payload.originalTransactionId ?? null,
    webOrderLineItemId: payload.webOrderLineItemId ?? null,
    productId: payload.productId,
    environment,
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
  const lookup = (environment: AppleIapEnvironment) =>
    fetchImpl(
      `${appStoreServerBaseUrl(environment)}/inApps/v1/transactions/${encodeURIComponent(transactionId)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

  // App Review purchases run in Sandbox even against the production build, so
  // try Production first and fall back to Sandbox on 404 (Apple's recommended
  // pattern). A single build serves both.
  let res = await lookup("Production");
  if (res.status === 404) {
    res = await lookup("Sandbox");
  }

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

  if (!bundleId || !productId) {
    throw new Error("apple iap environment is incomplete");
  }
  if (environment && environment !== "Production" && environment !== "Sandbox" && environment !== "Xcode") {
    throw new Error("apple iap environment is invalid");
  }

  const isXcode = environment === "Xcode";
  if (!isXcode && (!issuerId || !keyId || !privateKey)) {
    throw new Error("apple iap environment is incomplete");
  }

  return {
    bundleId,
    productId,
    ...(environment ? { environment: environment as AppleIapEnvironment } : {}),
    issuerId: issuerId ?? "",
    keyId: keyId ?? "",
    privateKey: privateKey ?? "",
  };
}
