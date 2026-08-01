import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { adminId, password } = await req.json();

  const validId = process.env.ADMIN_ID || "Admin123";
  const validPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  if (adminId !== validId || password !== validPassword) {
    return NextResponse.json({ error: "Invalid Admin ID or Password." }, { status: 401 });
  }

  await createSession({ role: "admin" });
  return NextResponse.json({ ok: true });
}
