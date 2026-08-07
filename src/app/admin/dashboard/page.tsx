import { prisma } from "@/lib/prisma";
import { computeDueDetails, formatCurrency } from "@/lib/calculations";
import { StatCard } from "@/components/ui/StatCard";

// Force this page to always fetch fresh data on every request instead of
// being cached as a static page at build time (which showed stale/empty data).
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [totalCustomers, active, inactive, archived, activeCustomers, totalCollectedAgg, recentLots] =
    await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: "ACTIVE" } }),
      prisma.customer.count({ where: { status: "INACTIVE" } }),
      prisma.customer.count({ where: { status: "ARCHIVED" } }),
      prisma.customer.findMany({ where: { status: "ACTIVE" } }),
      prisma.transaction.aggregate({ _sum: { amount: true } }),
      prisma.lot.findMany({ orderBy: { uploadDate: "desc" }, take: 5, include: { items: true } }),
    ]);

  const setting = await prisma.setting.findUnique({ where: { key: "penaltyPerMonth" } });
  const penaltyPerMonth = setting ? Number(setting.value) : undefined;

  let totalPending = 0;
  let overdueCount = 0;
  activeCustomers.forEach((c) => {
    const due = computeDueDetails(c.openingDate, c.monthPaidUpto, Number(c.denomination), penaltyPerMonth);
    totalPending += due.totalDueAmount;
    if (due.monthDue > 0) overdueCount += 1;
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Overview of collections, customers and overdue accounts.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Customers" value={String(totalCustomers)} />
        <StatCard label="Active" value={String(active)} />
        <StatCard label="Inactive" value={String(inactive)} />
        <StatCard label="Archived" value={String(archived)} />
        <StatCard label="Total Collected" value={formatCurrency(Number(totalCollectedAgg._sum.amount ?? 0))} accent />
        <StatCard label="Total Due (Active)" value={formatCurrency(totalPending)} />
        <StatCard label="Overdue Accounts" value={String(overdueCount)} />
      </div>

      <div className="mt-8 rounded-md border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-navy-900">Recent Lot Uploads</h2>
        {recentLots.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">No lots uploaded yet. Upload one from Lot Management.</p>
        ) : (
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2">Reference No.</th>
                <th className="py-2">Items</th>
                <th className="py-2">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {recentLots.map((lot) => (
                <tr key={lot.id} className="border-b border-gray-50">
                  <td className="py-2 font-medium text-navy-900">{lot.lotReferenceNumber}</td>
                  <td className="py-2">{lot.items.length}</td>
                  <td className="py-2 text-gray-500">{new Date(lot.uploadDate).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}