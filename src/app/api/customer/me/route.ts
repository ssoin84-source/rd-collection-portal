import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/auth";
import { computeDueDetails } from "@/lib/calculations";

// Read-only dashboard data for the logged-in customer:
// My Accounts, Account Details, Transaction History, Penalty, Pending Amount, Next Due Date
export async function GET() {
  const session = await requireCustomer();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accounts = await prisma.customer.findMany({
    where: { id: { in: session.accountIds } },
    include: { transactions: { orderBy: { transactionDate: "desc" } } },
  });

  const setting = await prisma.setting.findUnique({ where: { key: "penaltyPerMonth" } });
  const penaltyPerMonth = setting ? Number(setting.value) : undefined;

  const withCalc = accounts.map((a) => {
    const due = computeDueDetails(a.openingDate, a.monthPaidUpto, Number(a.denomination), penaltyPerMonth);
    const totalDeposit = a.transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    return { ...a, ...due, totalDeposit };
  });

  return NextResponse.json({ accounts: withCalc });
}
