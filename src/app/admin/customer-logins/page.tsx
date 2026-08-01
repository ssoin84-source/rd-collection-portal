"use client";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";

interface Login {
  id: string;
  username: string;
  enabled: boolean;
  accounts: { customer: { id: string; customerName: string; accountNumber: string } }[];
}
interface CustomerOption {
  id: string;
  customerName: string;
  accountNumber: string;
}

export default function CustomerLoginsPage() {
  const [logins, setLogins] = useState<Login[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [loginsRes, customersRes] = await Promise.all([
      fetch("/api/customer-logins"),
      fetch("/api/customers?status=ALL"),
    ]);
    setLogins((await loginsRes.json()).logins || []);
    setCustomers((await customersRes.json()).customers || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createLogin() {
    setError("");
    const res = await fetch("/api/customer-logins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, customerIds: [selectedAccount] }),
    });
    if (!res.ok) {
      setError((await res.json()).error);
      return;
    }
    setUsername("");
    setPassword("");
    setSelectedAccount("");
    load();
  }

  async function toggleEnabled(id: string, enabled: boolean) {
    await fetch(`/api/customer-logins/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    });
    load();
  }

  async function resetPassword(id: string) {
    const newPassword = prompt("Enter new password for this customer login:");
    if (!newPassword) return;
    await fetch(`/api/customer-logins/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    alert("Password reset successfully.");
  }

  async function linkAccount(loginId: string) {
    const accountNumber = prompt("Enter account number to link:");
    if (!accountNumber) return;
    const customer = customers.find((c) => c.accountNumber === accountNumber);
    if (!customer) {
      alert("No customer found with that account number.");
      return;
    }
    await fetch(`/api/customer-logins/${loginId}/link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId: customer.id }),
    });
    load();
  }

  async function unlinkAccount(loginId: string, customerId: string) {
    await fetch(`/api/customer-logins/${loginId}/link`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId }),
    });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-navy-900">Customer Login Management</h1>
      <p className="mt-1 text-sm text-gray-500">
        Customer logins are created by Admin only. There is no self-registration or self-service password reset.
      </p>

      <div className="mt-6 rounded-md border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-navy-900">Create Login</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="focus-ring rounded-sm border border-gray-200 px-3 py-2 text-sm" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Temporary password" className="focus-ring rounded-sm border border-gray-200 px-3 py-2 text-sm" />
          <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className="focus-ring rounded-sm border border-gray-200 px-3 py-2 text-sm">
            <option value="">Select account to link…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.customerName} — {c.accountNumber}</option>
            ))}
          </select>
          <Button variant="primary" disabled={!username || !password || !selectedAccount} onClick={createLogin}>
            Create Login
          </Button>
        </div>
        {error && <p className="mt-2 text-sm font-medium text-danger">{error}</p>}
      </div>

      <div className="mt-8 rounded-md border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-navy-900">Existing Logins</h2>
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
              <th className="py-2">Username</th>
              <th className="py-2">Linked Accounts</th>
              <th className="py-2">Status</th>
              <th className="py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {logins.map((login) => (
              <tr key={login.id} className="border-b border-gray-50 align-top">
                <td className="py-3 font-medium text-navy-900">{login.username}</td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {login.accounts.map((a) => (
                      <span key={a.customer.id} className="inline-flex items-center gap-1.5 rounded-sm bg-gray-100 px-2 py-1 text-xs">
                        {a.customer.accountNumber}
                        <button onClick={() => unlinkAccount(login.id, a.customer.id)} className="text-gray-400 hover:text-danger" aria-label="Unlink">✕</button>
                      </span>
                    ))}
                  </div>
                  <button onClick={() => linkAccount(login.id)} className="mt-1.5 text-xs font-semibold text-navy-700 hover:underline">
                    + Link account
                  </button>
                </td>
                <td className="py-3"><StatusBadge status={login.enabled ? "ACTIVE" : "INACTIVE"} /></td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => resetPassword(login.id)}>Reset Password</Button>
                    <Button variant={login.enabled ? "danger" : "primary"} onClick={() => toggleEnabled(login.id, login.enabled)}>
                      {login.enabled ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
