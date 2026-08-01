"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Invalid Admin ID or Password.");
      return;
    }
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm rounded-lg border border-navy-800 bg-navy-900 p-8 shadow-xl">
        <p className="font-display text-xl font-bold text-white">RD Collection Portal</p>
        <p className="mt-1 text-sm text-white/60">Admin sign in</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">
              Admin ID
            </label>
            <input
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              className="focus-ring mt-1 w-full rounded-sm border border-navy-700 bg-navy-950 px-3 py-2.5 text-white outline-none"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-white/60">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring mt-1 w-full rounded-sm border border-navy-700 bg-navy-950 px-3 py-2.5 text-white outline-none"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="text-sm font-medium text-red-400">{error}</p>}
          <Button type="submit" variant="secondary" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
