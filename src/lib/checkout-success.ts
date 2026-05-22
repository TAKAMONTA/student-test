import { SignJWT, jwtVerify } from "jose";

const ALG = "HS256";
const PURPOSE = "checkout_success";

export const CHECKOUT_SUCCESS_COOKIE = "checkout_success_verified";

export async function createCheckoutSuccessToken(opts: {
  sessionId: string;
  secret: string;
  expiresIn?: string;
}): Promise<string> {
  const secret = new TextEncoder().encode(opts.secret);
  return new SignJWT({ sessionId: opts.sessionId, purpose: PURPOSE })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(opts.expiresIn ?? "10m")
    .sign(secret);
}

export async function verifyCheckoutSuccessToken(opts: {
  token: string;
  secret: string;
}): Promise<{ sessionId: string }> {
  const secret = new TextEncoder().encode(opts.secret);
  const { payload } = await jwtVerify(opts.token, secret);
  if (payload["purpose"] !== PURPOSE || typeof payload["sessionId"] !== "string") {
    throw new Error("invalid checkout success token");
  }
  return { sessionId: payload["sessionId"] };
}

export async function isCheckoutSuccessVerified(opts: {
  verified?: string;
  token?: string;
  secret?: string;
}): Promise<boolean> {
  if (opts.verified !== "1" || !opts.token || !opts.secret) return false;

  try {
    await verifyCheckoutSuccessToken({ token: opts.token, secret: opts.secret });
    return true;
  } catch {
    return false;
  }
}
