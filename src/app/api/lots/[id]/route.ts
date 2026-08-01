import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// Delete Lot must rollback all updates: reverses monthPaidUpto advances and
// removes the transactions + lot items that the lot created.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lot = await prisma.lot.findUnique({
    where: { id: params.id },
    include: { transactions: true },
  });
  if (!lot) return NextResponse.json({ error: "Lot not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    for (const txn of lot.transactions) {
      const customer = await tx.customer.findUnique({ where: { id: txn.customerId } });
      if (customer) {
        const revertedMonthPaidUpto = new Date(customer.monthPaidUpto);
        revertedMonthPaidUpto.setMonth(revertedMonthPaidUpto.getMonth() - 1);
        await tx.customer.update({
          where: { id: customer.id },
          data: { monthPaidUpto: revertedMonthPaidUpto },
        });
      }
    }
    await tx.transaction.deleteMany({ where: { lotId: lot.id } });
    await tx.lotItem.deleteMany({ where: { lotId: lot.id } });
    await tx.lot.delete({ where: { id: lot.id } });
  });

  return NextResponse.json({ ok: true });
}
