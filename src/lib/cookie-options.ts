type CookieOrigin = string | URL;

function isLoopbackHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function isSecureOrigin(origin: CookieOrigin): boolean {
  const url = origin instanceof URL ? origin : new URL(origin);
  return url.protocol === "https:" || !isLoopbackHost(url.hostname);
}

export function sessionCookieOptions(origin: CookieOrigin) {
  return {
    httpOnly: true,
    secure: isSecureOrigin(origin),
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  };
}

export function clearSessionCookieOptions(origin: CookieOrigin) {
  return {
    ...sessionCookieOptions(origin),
    maxAge: 0,
  };
}

export function checkoutSuccessCookieOptions(origin: CookieOrigin) {
  return {
    httpOnly: true,
    secure: isSecureOrigin(origin),
    sameSite: "lax" as const,
    maxAge: 60 * 10,
    path: "/checkout/success",
  };
}
