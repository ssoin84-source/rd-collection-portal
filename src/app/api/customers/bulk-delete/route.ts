import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// Permanently deletes multiple customers at once (checkbox selection in
// Customer Management). Admin-only — enforced by requireAdmin(), the same
// guard used by every other admin API route, since there is no other login
// role that can reach this endpoint.
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids } = await req.json();
  if (!Array.isArray(ids) || !ids.length) {
    return NextResponse.json({ error: "No customers selected" }, { status: 400 });
  }

  const result = await prisma.customer.deleteMany({ where: { id: { in: ids } } });
  return NextResponse.json({ ok: true, deleted: result.count });
}