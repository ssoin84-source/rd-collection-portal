import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { computeDueDetails } from "@/lib/calculations";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [totalCustomers, active, inactive, archived, customers] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { status: "ACTIVE" } }),
    prisma.customer.count({ where: { status: "INACTIVE" } }),
    prisma.customer.count({ where: { status: "ARCHIVED" } }),
    prisma.customer.findMany({ where: { status: "ACTIVE" } }),
  ]);

  const setting = await prisma.setting.findUnique({ where: { key: "penaltyPerMonth" } });
  const penaltyPerMonth = setting ? Number(setting.value) : undefined;

  let totalPendingAmount = 0;
  let totalPenalty = 0;
  let overdueCustomers = 0;

  customers.forEach((c) => {
    const due = computeDueDetails(c.openingDate, c.monthPaidUpto, Number(c.denomination), penaltyPerMonth);
    totalPendingAmount += due.pendingAmount;
    totalPenalty += due.penalty;
    if (due.monthDue > 0) overdueCustomers += 1;
  });

  const totalCollectedAgg = await prisma.transaction.aggregate({ _sum: { amount: true } });

  return NextResponse.json({
    totalCustomers,
    active,
    inactive,
    archived,
    overdueCustomers,
    totalPendingAmount,
    totalPenalty,
    totalCollected: Number(totalCollectedAgg._sum.amount ?? 0),
  });
}
