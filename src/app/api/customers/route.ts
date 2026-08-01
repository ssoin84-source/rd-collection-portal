import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { computeDueDetails } from "@/lib/calculations";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status") || "ACTIVE";
  const search = req.nextUrl.searchParams.get("search") || "";

  const customers = await prisma.customer.findMany({
    where: {
      status: status === "ALL" ? undefined : (status as "ACTIVE" | "INACTIVE" | "ARCHIVED"),
      OR: search
        ? [
            { customerName: { contains: search, mode: "insensitive" } },
            { accountNumber: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: { createdAt: "desc" },
  });

  const setting = await prisma.setting.findUnique({ where: { key: "penaltyPerMonth" } });
  const penaltyPerMonth = setting ? Number(setting.value) : undefined;

  const withCalc = customers.map((c) => {
    const due = computeDueDetails(
      c.openingDate,
      c.monthPaidUpto,
      Number(c.denomination),
      penaltyPerMonth
    );
    return { ...c, ...due };
  });

  return NextResponse.json({ customers: withCalc });
}
