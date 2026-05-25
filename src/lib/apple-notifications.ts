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
  productId: string;
  environment: AppleIapEnvironment;
  purchaseDate: Date;
  revocationDate: Date | null;
  revocationReason: number | null;
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
  if (typeof tx.purchaseDate !== "number") {
    throw new Error("apple notification purchase date missing");
  }

  return {
    notificationType: notification.notificationType,
    signedTransactionInfo: notification.signedTransactionInfo,
    transactionId: tx.transactionId,
    originalTransactionId: tx.originalTransactionId ?? null,
    webOrderLineItemId: tx.webOrderLineItemId ?? null,
    productId: tx.productId,
    environment: normalizeEnvironment(tx.environment),
    purchaseDate: new Date(tx.purchaseDate),
    revocationDate: typeof tx.revocationDate === "number" ? new Date(tx.revocationDate) : null,
    revocationReason: tx.revocationReason ?? null,
  };
}
