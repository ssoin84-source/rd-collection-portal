import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { computeDueDetails } from "@/lib/calculations";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: { transactions: { orderBy: { transactionDate: "desc" } } },
  });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const setting = await prisma.setting.findUnique({ where: { key: "penaltyPerMonth" } });
  const penaltyPerMonth = setting ? Number(setting.value) : undefined;
  const due = computeDueDetails(customer.openingDate, customer.monthPaidUpto, Number(customer.denomination), penaltyPerMonth);
  const totalDeposit = customer.transactions.reduce((sum, t) => sum + Number(t.amount), 0);

  return NextResponse.json({ customer: { ...customer, ...due, totalDeposit } });
}

// Manual correction - admin can only edit monthPaidUpto and nextDueDate (via pencil icon)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.monthPaidUpto) data.monthPaidUpto = new Date(body.monthPaidUpto);

  const customer = await prisma.customer.update({ where: { id: params.id }, data });
  return NextResponse.json({ customer });
}
