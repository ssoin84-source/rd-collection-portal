"use client";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/calculations";

interface LotItem {
  accountNumber: string;
  customerName: string;
  denomination: number;
  depositAmount: number;
}
interface Lot {
  id: string;
  lotReferenceNumber: string;
  uploadDate: string;
  items: LotItem[];
}

export default function LotsPage() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [lotReferenceNumber, setLotReferenceNumber] = useState("");
  const [rows, setRows] = useState<LotItem[]>([{ accountNumber: "", customerName: "", denomination: 0, depositAmount: 0 }]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/lots");
    const data = await res.json();
    setLots(data.lots || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateRow(index: number, field: keyof LotItem, value: string) {
    setRows((prev) =>
      prev.map((r, i) =>
        i === index
          ? { ...r, [field]: field === "denomination" || field === "depositAmount" ? Number(value) : value }
          : r
      )
    );
  }

  function addRow() {
    setRows((prev) => [...prev, { accountNumber: "", customerName: "", denomination: 0, depositAmount: 0 }]);
  }

  async function uploadLot() {
    setError("");
    setSubmitting(true);
    const res = await fetch("/api/lots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lotReferenceNumber, items: rows.filter((r) => r.accountNumber) }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }
    setLotReferenceNumber("");
    setRows([{ accountNumber: "", customerName: "", denomination: 0, depositAmount: 0 }]);
    load();
  }

  async function deleteLot(id: string) {
    if (!confirm("Delete this lot? All linked payments will be rolled back.")) return;
    await fetch(`/api/lots/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-900">Lot Management</h1>
      <p className="mt-1 text-sm text-gray-500">
        Upload a lot of deposits to advance customer accounts. Deleting a lot rolls back every change it made.
      </p>

      <div className="mt-6 rounded-md border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-navy-900">Upload New Lot</h2>
        <input
          value={lotReferenceNumber}
          onChange={(e) => setLotReferenceNumber(e.target.value)}
          placeholder="Lot Reference Number"
          className="focus-ring mt-3 w-64 rounded-sm border border-gray-200 px-3 py-2 text-sm outline-none"
        />

        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
              <th className="py-2">Account Number</th>
              <th className="py-2">Customer Name</th>
              <th className="py-2">Denomination</th>
              <th className="py-2">Deposit Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="py-1 pr-2">
                  <input value={r.accountNumber} onChange={(e) => updateRow(i, "accountNumber", e.target.value)} className="focus-ring w-full rounded-sm border border-gray-200 px-2 py-1.5" />
                </td>
                <td className="py-1 pr-2">
                  <input value={r.customerName} onChange={(e) => updateRow(i, "customerName", e.target.value)} className="focus-ring w-full rounded-sm border border-gray-200 px-2 py-1.5" />
                </td>
                <td className="py-1 pr-2">
                  <input type="number" value={r.denomination || ""} onChange={(e) => updateRow(i, "denomination", e.target.value)} className="focus-ring w-full rounded-sm border border-gray-200 px-2 py-1.5" />
                </td>
                <td className="py-1 pr-2">
                  <input type="number" value={r.depositAmount || ""} onChange={(e) => updateRow(i, "depositAmount", e.target.value)} className="focus-ring w-full rounded-sm border border-gray-200 px-2 py-1.5" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-3 flex items-center gap-3">
          <Button variant="ghost" onClick={addRow}>+ Add Row</Button>
          <Button variant="primary" disabled={!lotReferenceNumber || submitting} onClick={uploadLot}>
            {submitting ? "Uploading…" : "Upload Lot"}
          </Button>
        </div>
        {error && <p className="mt-2 text-sm font-medium text-danger">{error}</p>}
      </div>

      <div className="mt-8 rounded-md border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-navy-900">Uploaded Lots</h2>
        {lots.length === 0 ? (
          <p className="mt-3 text-sm text-gray-400">No lots uploaded yet.</p>
        ) : (
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2">Reference No.</th>
                <th className="py-2">Items</th>
                <th className="py-2">Total Amount</th>
                <th className="py-2">Upload Date</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot) => (
                <tr key={lot.id} className="border-b border-gray-50">
                  <td className="py-2 font-medium text-navy-900">{lot.lotReferenceNumber}</td>
                  <td className="py-2">{lot.items.length}</td>
                  <td className="py-2">{formatCurrency(lot.items.reduce((s, i) => s + Number(i.depositAmount), 0))}</td>
                  <td className="py-2 text-gray-500">{formatDate(lot.uploadDate)}</td>
                  <td className="py-2 text-right">
                    <Button variant="danger" onClick={() => deleteLot(lot.id)}>Delete (Rollback)</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
