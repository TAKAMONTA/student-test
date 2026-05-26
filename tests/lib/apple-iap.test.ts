import { afterEach, describe, expect, it, vi } from "vitest";
import {
  appStoreServerBaseUrl,
  decodeAppleJwsPayload,
  extractTransactionIdFromSignedTransactionInfo,
  fetchAppleTransactionInfo,
  readAppleIapConfig,
  validateAppleLifetimeTransaction,
} from "@/lib/apple-iap";

function unsignedJws(payload: unknown): string {
  const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.`;
}

const validPayload = {
  transactionId: "2000000123456789",
  originalTransactionId: "2000000123456789",
  webOrderLineItemId: "2000000000000001",
  bundleId: "jp.taka.chu1testkit",
  productId: "chu1_testkit_lifetime",
  environment: "Sandbox",
  purchaseDate: 1779450000000,
  type: "Non-Consumable",
};

describe("apple iap helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("decodes a compact JWS payload without trusting it", () => {
    expect(decodeAppleJwsPayload(unsignedJws(validPayload))).toMatchObject(validPayload);
  });

  it("extracts transaction id from a signed transaction payload", () => {
    expect(extractTransactionIdFromSignedTransactionInfo(unsignedJws(validPayload))).toBe("2000000123456789");
  });

  it("uses the correct App Store Server API base URL", () => {
    expect(appStoreServerBaseUrl("Production")).toBe("https://api.storekit.apple.com");
    expect(appStoreServerBaseUrl("Sandbox")).toBe("https://api.storekit-sandbox.apple.com");
    expect(appStoreServerBaseUrl("Xcode")).toBe("xcode-local");
  });

  it("validates the lifetime product claims", () => {
    expect(
      validateAppleLifetimeTransaction(validPayload, {
        bundleId: "jp.taka.chu1testkit",
        productId: "chu1_testkit_lifetime",
        environment: "Sandbox",
      }),
    ).toEqual({
      transactionId: "2000000123456789",
      originalTransactionId: "2000000123456789",
      webOrderLineItemId: "2000000000000001",
      productId: "chu1_testkit_lifetime",
      environment: "Sandbox",
      purchaseDate: new Date(1779450000000),
      revocationDate: null,
      revocationReason: null,
    });
  });

  it("rejects wrong bundle, wrong product, revoked transactions, and wrong type", () => {
    expect(() =>
      validateAppleLifetimeTransaction(
        { ...validPayload, bundleId: "bad.bundle" },
        {
          bundleId: "jp.taka.chu1testkit",
          productId: "chu1_testkit_lifetime",
          environment: "Sandbox",
        },
      ),
    ).toThrow("apple transaction bundle mismatch");

    expect(() =>
      validateAppleLifetimeTransaction(
        { ...validPayload, productId: "other_product" },
        {
          bundleId: "jp.taka.chu1testkit",
          productId: "chu1_testkit_lifetime",
          environment: "Sandbox",
        },
      ),
    ).toThrow("apple transaction product mismatch");

    expect(() =>
      validateAppleLifetimeTransaction(
        { ...validPayload, revocationDate: 1779460000000 },
        {
          bundleId: "jp.taka.chu1testkit",
          productId: "chu1_testkit_lifetime",
          environment: "Sandbox",
        },
      ),
    ).toThrow("apple transaction is revoked");

    expect(() =>
      validateAppleLifetimeTransaction(
        { ...validPayload, type: "Consumable" },
        {
          bundleId: "jp.taka.chu1testkit",
          productId: "chu1_testkit_lifetime",
          environment: "Sandbox",
        },
      ),
    ).toThrow("apple transaction type mismatch");
  });

  it("fetches official transaction info from the sandbox API", async () => {
    const serverJws = unsignedJws(validPayload);
    const fetchImpl = vi.fn<typeof fetch>(
      async (_input, _init) =>
        new Response(JSON.stringify({ signedTransactionInfo: serverJws }), { status: 200 }),
    );

    const result = await fetchAppleTransactionInfo({
      signedTransactionInfo: unsignedJws(validPayload),
      environment: "Sandbox",
      issuerId: "issuer-id",
      keyId: "key-id",
      bundleId: "jp.taka.chu1testkit",
      productId: "chu1_testkit_lifetime",
      privateKey: [
        "-----BEGIN PRIVATE KEY-----",
        "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLEdCuaTk3TcDquw3",
        "WsD6EURKjWDPjB9EGNC0tzSpslyhRANCAARVYTYpkojBjEWG/tK6fQQOSVMY+bn0",
        "yr9S7Zhuo7TgC3Vhoj74nqJy9E2iUcTbUQqo4+YCBREmUaGqj059R0qf",
        "-----END PRIVATE KEY-----",
      ].join("\n"),
      fetchImpl,
    });

    expect(result.signedTransactionInfo).toBe(serverJws);
    expect(result.payload).toMatchObject(validPayload);
    expect(fetchImpl.mock.calls[0]?.[0]).toBe(
      "https://api.storekit-sandbox.apple.com/inApps/v1/transactions/2000000123456789",
    );
    expect(fetchImpl.mock.calls[0]?.[1]?.headers).toMatchObject({
      Authorization: expect.stringMatching(/^Bearer /),
    });
  });

  it("allows Xcode StoreKit testing without App Store Server API credentials", () => {
    vi.stubEnv("APPLE_BUNDLE_ID", "jp.taka.chu1testkit");
    vi.stubEnv("APPLE_IAP_PRODUCT_ID", "chu1_testkit_lifetime");
    vi.stubEnv("APPLE_APP_STORE_ENVIRONMENT", "Xcode");
    vi.stubEnv("APPLE_IAP_ISSUER_ID", "");
    vi.stubEnv("APPLE_IAP_KEY_ID", "");
    vi.stubEnv("APPLE_IAP_PRIVATE_KEY", "");

    expect(readAppleIapConfig()).toEqual({
      bundleId: "jp.taka.chu1testkit",
      productId: "chu1_testkit_lifetime",
      environment: "Xcode",
      issuerId: "",
      keyId: "",
      privateKey: "",
    });
  });
});
