"use client";
import { useRouter } from "next/navigation";

export default function CustomerAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/customer/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-display text-lg font-bold text-navy-900">RD Collection Portal</p>
            <p className="text-xs text-gray-500">Customer Dashboard</p>
          </div>
          <button onClick={handleLogout} className="focus-ring text-sm font-semibold text-navy-700 hover:text-navy-900">
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
