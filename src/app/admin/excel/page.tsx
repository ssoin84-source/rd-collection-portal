"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface PreviewRow {
  rowNumber: number;
  customerName: string;
  accountNumber: string;
  denomination: number;
  openingDate: string;
  monthPaidUpto: string;
  errors: string[];
}

export default function ExcelPage() {
  const [rows, setRows] = useState<PreviewRow[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/excel/import/preview", { method: "POST", body: formData });
    const data = await res.json();
    setRows(data.rows);
  }

  async function commitImport() {
    if (!rows) return;
    setImporting(true);
    const validRows = rows.filter((r) => r.errors.length === 0);
    const res = await fetch("/api/excel/import/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: validRows }),
    });
    const data = await res.json();
    setImporting(false);
    setResult(`${data.created} customers imported successfully.`);
    setRows(null);
  }

  async function handleExport() {
    const res = await fetch("/api/excel/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [] }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers-export.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  }

  const validCount = rows?.filter((r) => r.errors.length === 0).length ?? 0;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-900">Excel Import / Export</h1>
      <p className="mt-1 text-sm text-gray-500">Import new customers from a spreadsheet, or export the current list.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-md border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-navy-900">Import Customers</h2>
          <p className="mt-1 text-sm text-gray-500">
            Columns required: Customer Name, Account Number, Denomination, Opening Date, Month Paid Upto.
          </p>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFile}
            className="focus-ring mt-4 block w-full text-sm file:mr-4 file:rounded-sm file:border-0 file:bg-navy-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-navy-800"
          />
          {result && <p className="mt-3 text-sm font-medium text-success">{result}</p>}
        </div>

        <div className="rounded-md border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-navy-900">Export Customers</h2>
          <p className="mt-1 text-sm text-gray-500">Downloads all customers using the same template as import.</p>
          <Button variant="secondary" className="mt-4" onClick={handleExport}>
            Export to Excel
          </Button>
        </div>
      </div>

      {rows && (
        <div className="mt-6 rounded-md border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-navy-900">
              Preview — {validCount} of {rows.length} rows valid
            </h2>
            <Button variant="primary" disabled={!validCount || importing} onClick={commitImport}>
              {importing ? "Importing…" : `Import ${validCount} valid rows`}
            </Button>
          </div>
          <div className="mt-4 max-h-96 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2">Row</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Account No.</th>
                  <th className="px-3 py-2">Denomination</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.rowNumber} className={`border-b border-gray-50 ${r.errors.length ? "bg-danger/5" : ""}`}>
                    <td className="px-3 py-2 text-gray-400">{r.rowNumber}</td>
                    <td className="px-3 py-2">{r.customerName}</td>
                    <td className="px-3 py-2">{r.accountNumber}</td>
                    <td className="px-3 py-2">{r.denomination}</td>
                    <td className="px-3 py-2">
                      {r.errors.length ? (
                        <span className="text-xs font-medium text-danger">{r.errors.join("; ")}</span>
                      ) : (
                        <span className="text-xs font-medium text-success">Valid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
