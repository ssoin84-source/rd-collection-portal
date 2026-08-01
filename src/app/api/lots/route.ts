import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const lots = await prisma.lot.findMany({
    include: { items: true },
    orderBy: { uploadDate: "desc" },
  });
  return NextResponse.json({ lots });
}

// Lot Upload: creates a Lot, its LotItems, and posts a Transaction per item,
// advancing each matched customer's monthPaidUpto by one month.
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lotReferenceNumber, items } = await req.json();
  if (!lotReferenceNumber || !Array.isArray(items) || !items.length) {
    return NextResponse.json({ error: "Lot reference number and items are required" }, { status: 400 });
  }

  const existing = await prisma.lot.findUnique({ where: { lotReferenceNumber } });
  if (existing) {
    return NextResponse.json({ error: "A lot with this reference number already exists" }, { status: 409 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const lot = await tx.lot.create({ data: { lotReferenceNumber } });

    for (const item of items as {
      accountNumber: string;
      customerName: string;
      denomination: number;
      depositAmount: number;
    }[]) {
      const customer = await tx.customer.findUnique({ where: { accountNumber: item.accountNumber } });

      await tx.lotItem.create({
        data: {
          lotId: lot.id,
          customerId: customer?.id,
          accountNumber: item.accountNumber,
          customerName: item.customerName,
          denomination: item.denomination,
          depositAmount: item.depositAmount,
        },
      });

      if (customer) {
        await tx.transaction.create({
          data: {
            customerId: customer.id,
            amount: item.depositAmount,
            lotId: lot.id,
          },
        });
        const nextMonthPaidUpto = new Date(customer.monthPaidUpto);
        nextMonthPaidUpto.setMonth(nextMonthPaidUpto.getMonth() + 1);
        await tx.customer.update({
          where: { id: customer.id },
          data: { monthPaidUpto: nextMonthPaidUpto },
        });
      }
    }

    return lot;
  });

  return NextResponse.json({ lot: result });
}
