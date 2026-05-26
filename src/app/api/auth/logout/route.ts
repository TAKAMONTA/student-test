import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookieOptions } from "@/lib/cookie-options";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", "", clearSessionCookieOptions(req.url));
  res.headers.set("Clear-Site-Data", '"cache"');
  return res;
}
