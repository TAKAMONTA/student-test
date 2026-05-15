import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { verifySessionToken } from "@/lib/session";

export type AuthUser = {
  id: string;
  email: string;
  purchasedAt: Date | null;
};

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  const secret = process.env["JWT_SECRET"];
  if (!secret) return null;

  let userId: string;
  try {
    ({ userId } = await verifySessionToken({ token, secret }));
  } catch {
    return null;
  }

  const db = getDb();
  const user = await db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    purchasedAt: user.purchasedAt ? new Date(user.purchasedAt) : null,
  };
}

export async function requireAuth(): Promise<AuthUser | Response> {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

export function hasPurchase(user: AuthUser): boolean {
  return Boolean(user.purchasedAt);
}
