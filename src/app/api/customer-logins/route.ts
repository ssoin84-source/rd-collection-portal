import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const logins = await prisma.customerLogin.findMany({
    include: { accounts: { include: { customer: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ logins });
}

// Create Login - customer logins are created by Admin only, never self-registered
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username, password, customerIds } = await req.json();
  if (!username || !password || !Array.isArray(customerIds) || !customerIds.length) {
    return NextResponse.json({ error: "Username, password and at least one linked account are required" }, { status: 400 });
  }

  const existing = await prisma.customerLogin.findUnique({ where: { username } });
  if (existing) return NextResponse.json({ error: "Username already exists" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  const login = await prisma.customerLogin.create({
    data: {
      username,
      passwordHash,
      accounts: { create: customerIds.map((customerId: string) => ({ customerId })) },
    },
    include: { accounts: true },
  });

  return NextResponse.json({ login });
}
