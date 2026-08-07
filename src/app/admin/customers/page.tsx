"use client";
import { useEffect, useState, useCallback } from "react";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SidePanel } from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/calculations";

interface CustomerRow {
  id: string;
  customerName: string;
  accountNumber: string;
  denomination: number;
  openingDate: string;
  monthPaidUpto: string;
  monthDue: number;
  monthsPaid: number;
  pendingAmount: number;
  penalty: number;
  totalDueAmount: number;
  status: string;
}

const TABS = [
  { key: "ACTIVE", label: "Active Customers" },
  { key: "INACTIVE", label: "Inactive Customers" },
  { key: "ARCHIVED", label: "Archived" },
];

export default function CustomersPage() {
  const [tab, setTab] = useState("ACTIVE");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [panelCustomerId, setPanelCustomerId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ status: tab, search });
    const res = await fetch(`/api/customers?${params.toString()}`);
    const data = await res.json();
    setRows(data.customers || []);
    setSelected(new Set());
    setLoading(false);
  }, [tab, search]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))));
  }

  async function applyBulkStatus(status: string) {
    if (!selected.size) return;
    await fetch("/api/customers/bulk-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected), status }),
    });
    load();
  }

  async function applyBulkDelete() {
    if (!selected.size) return;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${selected.size} selected customer(s)?\n\nThis will also delete all of their transaction records. This cannot be undone.`
    );
    if (!confirmed) return;
    await fetch("/api/customers/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-navy-900">Customer Management</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or account number…"
          className="focus-ring w-72 rounded-sm border border-gray-200 bg-white px-3 py-2 text-sm outline-none"
        />
      </div>

      <div className="mt-5 flex gap-2 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`focus-ring border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.key ? "border-gold-500 text-navy-900" : "border-transparent text-gray-500 hover:text-navy-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {selected.size > 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-sm bg-navy-900/5 px-4 py-2.5">
          <span className="text-sm font-medium text-navy-900">{selected.size} selected</span>
          <Button variant="ghost" onClick={() => applyBulkStatus("ACTIVE")}>Mark Active</Button>
          <Button variant="ghost" onClick={() => applyBulkStatus("INACTIVE")}>Mark Inactive</Button>
          <Button variant="danger" onClick={() => applyBulkStatus("ARCHIVED")}>Archive</Button>
          <Button variant="danger" onClick={applyBulkDelete}>Delete Selected</Button>
        </div>
      )}

      <div className="mt-4 overflow-x-auto rounded-md border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">
                <input type="checkbox" checked={selected.size === rows.length && rows.length > 0} onChange={toggleAll} />
              </th>
              <th className="px-4 py-3">Customer Name</th>
              <th className="px-4 py-3">Account Number</th>
              <th className="px-4 py-3">Denomination</th>
              <th className="px-4 py-3">Opening Date</th>
              <th className="px-4 py-3">Installments Paid</th>
              <th className="px-4 py-3">Month Due</th>
              <th className="px-4 py-3">Penalty</th>
              <th className="px-4 py-3">Total Due</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">No customers found in this view.</td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleRow(r.id)} />
                  </td>
                  <td className="px-4 py-3 font-medium text-navy-900">{r.customerName}</td>
                  <td className="px-4 py-3">
                    <button
                      className="focus-ring font-semibold text-navy-700 underline decoration-gold-500 decoration-2 underline-offset-2 hover:text-navy-900"
                      onClick={() => setPanelCustomerId(r.id)}
                    >
                      {r.accountNumber}
                    </button>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(r.denomination)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(r.openingDate)}</td>
                  <td className="px-4 py-3 text-gray-500">{r.monthsPaid}</td>
                  <td className="px-4 py-3">{r.monthDue}</td>
                  <td className="px-4 py-3">{formatCurrency(r.penalty)}</td>
                  <td className="px-4 py-3 font-semibold text-navy-900">{formatCurrency(r.totalDueAmount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CustomerProfilePanel
        customerId={panelCustomerId}
        onClose={() => setPanelCustomerId(null)}
        onUpdated={load}
      />
    </div>
  );
}

function CustomerProfilePanel({
  customerId,
  onClose,
  onUpdated,
}: {
  customerId: string | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [data, setData] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [monthPaidUpto, setMonthPaidUpto] = useState("");

  useEffect(() => {
    if (!customerId) return;
    setData(null);
    setEditing(false);
    fetch(`/api/customers/${customerId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d.customer);
        setMonthPaidUpto(d.customer.monthPaidUpto?.slice(0, 10));
      });
  }, [customerId]);

  async function saveCorrection() {
    if (!customerId) return;
    await fetch(`/api/customers/${customerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthPaidUpto }),
    });
    setEditing(false);
    onUpdated();
    const res = await fetch(`/api/customers/${customerId}`);
    const d = await res.json();
    setData(d.customer);
  }

  async function deleteCustomer() {
    if (!customerId || !data) return;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${data.customerName} (${data.accountNumber})?\n\nThis will also delete all of their transaction records. This cannot be undone.`
    );
    if (!confirmed) return;
    await fetch(`/api/customers/${customerId}`, { method: "DELETE" });
    onUpdated();
    onClose();
  }

  return (
    <SidePanel open={!!customerId} onClose={onClose} title="Customer Profile">
      {!data ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <div className="space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display text-lg font-bold text-navy-900">{data.customerName}</p>
              <p className="text-sm text-gray-500">{data.accountNumber}</p>
            </div>
            <Button variant="danger" onClick={deleteCustomer}>
              Delete Customer
            </Button>
          </div>

          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Opening Date" value={formatDate(data.openingDate)} />
            <Field label="Denomination" value={formatCurrency(Number(data.denomination))} />
            <Field
              label="Installments Paid"
              value={
                editing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={monthPaidUpto}
                      onChange={(e) => setMonthPaidUpto(e.target.value)}
                      className="focus-ring rounded-sm border border-gray-200 px-2 py-1 text-sm"
                    />
                    <button onClick={saveCorrection} className="text-xs font-semibold text-success">Save</button>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    {data.monthsPaid}
                    <button onClick={() => setEditing(true)} aria-label="Correct installments paid" className="focus-ring text-gray-400 hover:text-navy-700">
                      ✎
                    </button>
                  </span>
                )
              }
            />
            <Field label="Next Due Date" value={formatDate(data.nextDueDate)} />
            <Field label="Pending Installments" value={String(data.monthDue)} />
            <Field label="Penalty Total" value={formatCurrency(data.penalty)} />
            <Field label="Total Due Amount" value={formatCurrency(data.totalDueAmount)} />
            <Field label="Total Deposit Amount" value={formatCurrency(data.totalDeposit)} />
          </dl>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Transaction History</p>
            <div className="mt-2 max-h-64 overflow-y-auto rounded-sm border border-gray-100">
              {data.transactions.length === 0 ? (
                <p className="p-3 text-sm text-gray-400">No transactions yet.</p>
              ) : (
                <table className="w-full text-left text-sm">
                  <tbody>
                    {data.transactions.map((t: any) => (
                      <tr key={t.id} className="border-b border-gray-50">
                        <td className="px-3 py-2 text-gray-500">{formatDate(t.transactionDate)}</td>
                        <td className="px-3 py-2 text-right font-medium text-navy-900">{formatCurrency(Number(t.amount))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </SidePanel>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-navy-900">{value}</dd>
    </div>
  );
}