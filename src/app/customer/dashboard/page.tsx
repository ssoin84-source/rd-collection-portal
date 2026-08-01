"use client";
import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/calculations";

interface Account {
  id: string;
  customerName: string;
  accountNumber: string;
  denomination: number;
  openingDate: string;
  monthPaidUpto: string;
  nextDueDate: string;
  monthDue: number;
  pendingAmount: number;
  penalty: number;
  totalDueAmount: number;
  totalDeposit: number;
  transactions: { id: string; amount: number; transactionDate: string }[];
}

export default function CustomerDashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/customer/me")
      .then((r) => r.json())
      .then((d) => {
        setAccounts(d.accounts || []);
        setActiveId(d.accounts?.[0]?.id ?? null);
      });
  }, []);

  const active = accounts.find((a) => a.id === activeId);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-900">My Accounts</h1>
      <p className="mt-1 text-sm text-gray-500">Read-only view of your recurring deposit accounts.</p>

      {accounts.length > 1 && (
        <div className="mt-5 flex gap-2 border-b border-gray-200">
          {accounts.map((a) => (
            <button
              key={a.id}
              onClick={() => setActiveId(a.id)}
              className={`focus-ring border-b-2 px-4 py-2 text-sm font-semibold ${
                activeId === a.id ? "border-gold-500 text-navy-900" : "border-transparent text-gray-500"
              }`}
            >
              {a.accountNumber}
            </button>
          ))}
        </div>
      )}

      {!active ? (
        <p className="mt-6 text-sm text-gray-400">No linked accounts found.</p>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatBox label="Pending Amount" value={formatCurrency(active.pendingAmount)} />
            <StatBox label="Penalty" value={formatCurrency(active.penalty)} />
            <StatBox label="Total Due" value={formatCurrency(active.totalDueAmount)} accent />
            <StatBox label="Next Due Date" value={formatDate(active.nextDueDate)} />
          </div>

          <div className="rounded-md border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-navy-900">Account Details</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
              <Field label="Customer Name" value={active.customerName} />
              <Field label="Account Number" value={active.accountNumber} />
              <Field label="Denomination" value={formatCurrency(active.denomination)} />
              <Field label="Opening Date" value={formatDate(active.openingDate)} />
              <Field label="Month Paid Upto" value={formatDate(active.monthPaidUpto)} />
              <Field label="Total Deposit Amount" value={formatCurrency(active.totalDeposit)} />
            </dl>
          </div>

          <div className="rounded-md border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-navy-900">Transaction History</h2>
            {active.transactions.length === 0 ? (
              <p className="mt-3 text-sm text-gray-400">No transactions recorded yet.</p>
            ) : (
              <table className="mt-3 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                    <th className="py-2">Date</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {active.transactions.map((t) => (
                    <tr key={t.id} className="border-b border-gray-50">
                      <td className="py-2 text-gray-500">{formatDate(t.transactionDate)}</td>
                      <td className="py-2 text-right font-medium text-navy-900">{formatCurrency(Number(t.amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-md border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-1 font-display text-xl font-bold ${accent ? "text-gold-500" : "text-navy-900"}`}>{value}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-navy-900">{value}</dd>
    </div>
  );
}
