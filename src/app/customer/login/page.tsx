"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/customer-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError((await res.json()).error || "Invalid username or password.");
      return;
    }
    router.push("/customer/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-100 bg-white p-8 shadow-xl">
        <Link href="/" className="text-xs font-semibold uppercase tracking-wide text-gray-400 hover:text-navy-700">
          ← Back to site
        </Link>
        <p className="mt-3 font-display text-xl font-bold text-navy-900">Customer Sign In</p>
        <p className="mt-1 text-sm text-gray-500">Access your recurring deposit account details.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="focus-ring mt-1 w-full rounded-sm border border-gray-200 px-3 py-2.5 outline-none"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring mt-1 w-full rounded-sm border border-gray-200 px-3 py-2.5 outline-none"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="text-sm font-medium text-danger">{error}</p>}
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-xs text-gray-400">
          Forgot your password? Your login and password resets are managed by the office — please contact them directly.
        </p>
      </div>
    </div>
  );
}
