import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { subjects } from "@/db/schema";
import { requirePurchased } from "@/lib/auth";

export async function GET() {
  const authResult = await requirePurchased();
  if (authResult instanceof Response) return authResult;

  const db = getDb();
  const rows = await db.select().from(subjects).orderBy(asc(subjects.order)).all();
  return NextResponse.json(rows);
}
