import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { parseCustomerWorkbook } from "@/lib/excel";
import { prisma } from "@/lib/prisma";

// Preview before save - parses the file, runs duplicate + required-field
// validation, and returns rows with per-row errors. Nothing is saved yet.
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const rows = await parseCustomerWorkbook(buffer);

  const accountNumbers = rows.map((r) => r.accountNumber).filter(Boolean);
  const existing = await prisma.customer.findMany({
    where: { accountNumber: { in: accountNumbers } },
    select: { accountNumber: true },
  });
  const existingSet = new Set(existing.map((e) => e.accountNumber));

  rows.forEach((r) => {
    if (existingSet.has(r.accountNumber)) {
      r.errors.push("Account Number already exists in database");
    }
  });

  const validCount = rows.filter((r) => r.errors.length === 0).length;
  return NextResponse.json({ rows, validCount, totalCount: rows.length });
}
