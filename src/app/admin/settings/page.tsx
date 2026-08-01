"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const [penaltyPerMonth, setPenaltyPerMonth] = useState(10);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => setPenaltyPerMonth(d.penaltyPerMonth));
  }, []);

  async function save() {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ penaltyPerMonth }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-900">Settings</h1>
      <p className="mt-1 text-sm text-gray-500">Configure collection rules used across the portal.</p>

      <div className="mt-6 max-w-md rounded-md border border-gray-100 bg-white p-6 shadow-sm">
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Penalty per overdue month (₹)
        </label>
        <input
          type="number"
          value={penaltyPerMonth}
          onChange={(e) => setPenaltyPerMonth(Number(e.target.value))}
          className="focus-ring mt-2 w-full rounded-sm border border-gray-200 px-3 py-2 text-sm outline-none"
        />
        <p className="mt-2 text-xs text-gray-500">
          Applied automatically to every account with one or more months overdue.
        </p>
        <Button variant="primary" className="mt-4" onClick={save}>Save Settings</Button>
        {saved && <p className="mt-2 text-sm font-medium text-success">Saved.</p>}
      </div>
    </div>
  );
}
