import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { parseCustomerWorkbook } from "@/lib/excel";
import { prisma } from "@/lib/prisma";

// Preview before save - parses the file, runs duplicate + required-field
// validation, and returns rows with per-row errors. Nothing is saved yet.
//
// If a row's Account Number already exists in the database, it is NOT
// treated as an error — it's marked as an "update" row. This lets the same
// export/import template be used to bulk-correct existing customers (e.g.
// filling in Month Paid Upto after reconciling paid installments).
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

  const rowsWithStatus = rows.map((r) => ({
    ...r,
    isUpdate: existingSet.has(r.accountNumber),
  }));

  const validCount = rowsWithStatus.filter((r) => r.errors.length === 0).length;
  const createCount = rowsWithStatus.filter((r) => r.errors.length === 0 && !r.isUpdate).length;
  const updateCount = rowsWithStatus.filter((r) => r.errors.length === 0 && r.isUpdate).length;

  return NextResponse.json({ rows: rowsWithStatus, validCount, createCount, updateCount, totalCount: rows.length });
}