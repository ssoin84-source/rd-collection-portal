import { prisma } from "@/lib/prisma";
import { computeDueDetails, formatCurrency } from "@/lib/calculations";
import { StatCard } from "@/components/ui/StatCard";

export default async function ReportsPage() {
  const customers = await prisma.customer.findMany({ where: { status: "ACTIVE" } });
  const setting = await prisma.setting.findUnique({ where: { key: "penaltyPerMonth" } });
  const penaltyPerMonth = setting ? Number(setting.value) : undefined;

  const rows = customers
    .map((c) => ({
      ...c,
      ...computeDueDetails(c.openingDate, c.monthPaidUpto, Number(c.denomination), penaltyPerMonth),
    }))
    .filter((c) => c.monthDue > 0)
    .sort((a, b) => b.totalDueAmount - a.totalDueAmount);

  const totalOverdueAmount = rows.reduce((s, r) => s + r.totalDueAmount, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-900">Reports</h1>
      <p className="mt-1 text-sm text-gray-500">Overdue accounts sorted by total amount due.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Overdue Accounts" value={String(rows.length)} />
        <StatCard label="Total Overdue Amount" value={formatCurrency(totalOverdueAmount)} accent />
        <StatCard label="Active Accounts" value={String(customers.length)} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-md border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Customer Name</th>
              <th className="px-4 py-3">Account Number</th>
              <th className="px-4 py-3">Months Due</th>
              <th className="px-4 py-3">Pending Amount</th>
              <th className="px-4 py-3">Penalty</th>
              <th className="px-4 py-3">Total Due</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No overdue accounts. Everyone is current.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium text-navy-900">{r.customerName}</td>
                  <td className="px-4 py-3">{r.accountNumber}</td>
                  <td className="px-4 py-3">{r.monthDue}</td>
                  <td className="px-4 py-3">{formatCurrency(r.pendingAmount)}</td>
                  <td className="px-4 py-3">{formatCurrency(r.penalty)}</td>
                  <td className="px-4 py-3 font-semibold text-danger">{formatCurrency(r.totalDueAmount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
