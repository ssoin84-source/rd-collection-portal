import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// Link Multiple Accounts to one customer login
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { customerId } = await req.json();

  await prisma.customerLoginAccount.upsert({
    where: { loginId_customerId: { loginId: params.id, customerId } },
    create: { loginId: params.id, customerId },
    update: {},
  });

  return NextResponse.json({ ok: true });
}

// Unlink Accounts
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { customerId } = await req.json();

  await prisma.customerLoginAccount.delete({
    where: { loginId_customerId: { loginId: params.id, customerId } },
  });

  return NextResponse.json({ ok: true });
}
