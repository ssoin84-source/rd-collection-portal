import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { DEFAULT_PENALTY_PER_MONTH } from "@/lib/calculations";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const setting = await prisma.setting.findUnique({ where: { key: "penaltyPerMonth" } });
  return NextResponse.json({ penaltyPerMonth: setting ? Number(setting.value) : DEFAULT_PENALTY_PER_MONTH });
}

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { penaltyPerMonth } = await req.json();

  await prisma.setting.upsert({
    where: { key: "penaltyPerMonth" },
    create: { key: "penaltyPerMonth", value: String(penaltyPerMonth) },
    update: { value: String(penaltyPerMonth) },
  });

  return NextResponse.json({ ok: true });
}
