import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// Handles Active / Inactive / Archive (soft-delete) bulk actions with checkbox selection
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids, status } = await req.json();
  if (!Array.isArray(ids) || !ids.length) {
    return NextResponse.json({ error: "No customers selected" }, { status: 400 });
  }
  if (!["ACTIVE", "INACTIVE", "ARCHIVED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await prisma.customer.updateMany({ where: { id: { in: ids } }, data: { status } });
  return NextResponse.json({ ok: true, updated: ids.length });
}
