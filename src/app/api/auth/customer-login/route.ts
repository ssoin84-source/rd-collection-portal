import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const login = await prisma.customerLogin.findUnique({
    where: { username },
    include: { accounts: true },
  });

  if (!login || !login.enabled) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, login.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  await createSession({
    role: "customer",
    loginId: login.id,
    username: login.username,
    accountIds: login.accounts.map((a) => a.customerId),
  });

  return NextResponse.json({ ok: true });
}
