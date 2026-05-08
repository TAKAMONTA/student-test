import { SignJWT, jwtVerify } from "jose";

const ALG = "HS256";

export async function createMagicToken(opts: {
  email: string;
  secret: string;
}): Promise<string> {
  const secret = new TextEncoder().encode(opts.secret);
  return new SignJWT({ email: opts.email })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}

export async function verifyMagicToken(opts: {
  token: string;
  secret: string;
}): Promise<{ email: string }> {
  const secret = new TextEncoder().encode(opts.secret);
  const { payload } = await jwtVerify(opts.token, secret);
  if (typeof payload["email"] !== "string") {
    throw new Error("invalid payload");
  }
  return { email: payload["email"] };
}
