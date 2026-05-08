import { SignJWT, jwtVerify } from "jose";

const ALG = "HS256";

export async function signSessionToken(opts: {
  userId: string;
  secret: string;
  expiresIn?: string;
}): Promise<string> {
  const secret = new TextEncoder().encode(opts.secret);
  return new SignJWT({ userId: opts.userId })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(opts.expiresIn ?? "30d")
    .sign(secret);
}

export async function verifySessionToken(opts: {
  token: string;
  secret: string;
}): Promise<{ userId: string }> {
  const secret = new TextEncoder().encode(opts.secret);
  const { payload } = await jwtVerify(opts.token, secret);
  if (typeof payload["userId"] !== "string") {
    throw new Error("invalid payload");
  }
  return { userId: payload["userId"] };
}
