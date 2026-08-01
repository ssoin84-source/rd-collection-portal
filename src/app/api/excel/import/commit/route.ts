import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Commit only the rows the admin confirmed in the preview step
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await req.json();
  if (!Array.isArray(rows) || !rows.length) {
    return NextResponse.json({ error: "No rows to import" }, { status: 400 });
  }

  let created = 0;
  for (const r of rows as {
    customerName: string;
    accountNumber: string;
    denomination: number;
    openingDate: string;
    monthPaidUpto: string;
  }[]) {
    await prisma.customer.create({
      data: {
        customerName: r.customerName,
        accountNumber: r.accountNumber,
        denomination: r.denomination,
        openingDate: new Date(r.openingDate),
        monthPaidUpto: new Date(r.monthPaidUpto),
      },
    });
    created += 1;
  }

  return NextResponse.json({ ok: true, created });
}
