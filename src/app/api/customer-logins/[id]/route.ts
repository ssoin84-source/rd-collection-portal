import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// Reset Password / Enable-Disable Login - password reset only by Admin, no self-service
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (typeof body.enabled === "boolean") data.enabled = body.enabled;
  if (body.newPassword) data.passwordHash = await bcrypt.hash(body.newPassword, 10);

  const login = await prisma.customerLogin.update({ where: { id: params.id }, data });
  return NextResponse.json({ login });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.customerLogin.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
