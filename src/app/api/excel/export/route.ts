import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildCustomerWorkbook } from "@/lib/excel";

// Export selected customers using the same template as import
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids } = await req.json();
  const customers = await prisma.customer.findMany({
    where: ids?.length ? { id: { in: ids } } : undefined,
  });

  const buffer = await buildCustomerWorkbook(
    customers.map((c) => ({
      customerName: c.customerName,
      accountNumber: c.accountNumber,
      denomination: Number(c.denomination),
      openingDate: c.openingDate,
      monthPaidUpto: c.monthPaidUpto,
    }))
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="customers-export.xlsx"`,
    },
  });
}
