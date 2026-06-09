import {
  decodeAppleJwsPayload,
  type AppleIapEnvironment,
  type AppleTransactionPayload,
} from "@/lib/apple-iap";

type AppleNotificationPayload = {
  notificationType?: string;
  data?: {
    signedTransactionInfo?: string;
  };
};

export type DecodedAppleNotification = {
  notificationType: string;
  signedTransactionInfo: string;
  transactionPayload: AppleTransactionPayload;
};

export type NormalizedAppleNotification = {
  notificationType: string;
  signedTransactionInfo: string;
  transactionId: string;
  originalTransactionId: string | null;
  webOrderLineItemId: string | null;
  bundleId: string;
  productId: string;
  environment: AppleIapEnvironment;
  purchaseDate: Date;
  revocationDate: Date | null;
  revocationReason: number | null;
};

export type AppleNotificationConfig = {
  bundleId: string;
  productId: string;
  environment?: AppleIapEnvironment;
};

function normalizeEnvironment(environment: unknown): AppleIapEnvironment {
  if (environment === "Production" || environment === "Sandbox" || environment === "Xcode") {
    return environment;
  }
  throw new Error("apple notification environment invalid");
}

export function decodeAppleNotificationPayload(signedPayload: string): DecodedAppleNotification {
  const payload = decodeAppleJwsPayload<AppleNotificationPayload>(signedPayload);
  const signedTransactionInfo = payload.data?.signedTransactionInfo;

  if (!payload.notificationType) {
    throw new Error("apple notification type missing");
  }
  if (!signedTransactionInfo) {
    throw new Error("apple notification transaction info missing");
  }

  return {
    notificationType: payload.notificationType,
    signedTransactionInfo,
    transactionPayload: decodeAppleJwsPayload<AppleTransactionPayload>(signedTransactionInfo),
  };
}

export function normalizeAppleNotification(
  notification: DecodedAppleNotification,
): NormalizedAppleNotification {
  const tx = notification.transactionPayload;

  if (!tx.transactionId) {
    throw new Error("apple notification transaction id missing");
  }
  if (!tx.productId) {
    throw new Error("apple notification product id missing");
  }
  if (!tx.bundleId) {
    throw new Error("apple notification bundle id missing");
  }
  if (typeof tx.purchaseDate !== "number") {
    throw new Error("apple notification purchase date missing");
  }

  return {
    notificationType: notification.notificationType,
    signedTransactionInfo: notification.signedTransactionInfo,
    transactionId: tx.transactionId,
    originalTransactionId: tx.originalTransactionId ?? null,
    webOrderLineItemId: tx.webOrderLineItemId ?? null,
    bundleId: tx.bundleId,
    productId: tx.productId,
    environment: normalizeEnvironment(tx.environment),
    purchaseDate: new Date(tx.purchaseDate),
    revocationDate: typeof tx.revocationDate === "number" ? new Date(tx.revocationDate) : null,
    revocationReason: tx.revocationReason ?? null,
  };
}

export function validateAppleNotificationForApp(
  notification: NormalizedAppleNotification,
  config: AppleNotificationConfig,
): NormalizedAppleNotification {
  if (notification.bundleId !== config.bundleId) {
    throw new Error("apple notification bundle mismatch");
  }
  if (notification.productId !== config.productId) {
    throw new Error("apple notification product mismatch");
  }
  // Production builds receive Sandbox notifications during App Review, so trust
  // the env stamped on the (already signed) transaction rather than a static
  // server config. bundle/product match is enough for safety.
  return notification;
}

export function readAppleNotificationConfig(): AppleNotificationConfig {
  const bundleId = process.env["APPLE_BUNDLE_ID"];
  const productId = process.env["APPLE_IAP_PRODUCT_ID"];
  const environment = process.env["APPLE_APP_STORE_ENVIRONMENT"];

  if (!bundleId || !productId) {
    throw new Error("apple notification environment is incomplete");
  }

  return {
    bundleId,
    productId,
    ...(environment ? { environment: normalizeEnvironment(environment) } : {}),
  };
}
