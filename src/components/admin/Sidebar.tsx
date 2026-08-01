"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/customers", label: "Customer Management" },
  { href: "/admin/customer-logins", label: "Customer Logins" },
  { href: "/admin/excel", label: "Excel Import / Export" },
  { href: "/admin/lots", label: "Lot Management" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 flex-shrink-0 flex-col border-r border-navy-800 bg-navy-900 text-white">
      <div className="border-b border-navy-800 px-6 py-5">
        <p className="font-display text-lg font-bold leading-tight">RD Collection</p>
        <p className="text-xs text-gold-100/70">Admin Panel</p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-ring block rounded-sm px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-gold-500 text-navy-950" : "text-white/80 hover:bg-navy-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-navy-800 px-3 py-4">
        <button
          onClick={handleLogout}
          className="focus-ring block w-full rounded-sm px-3 py-2.5 text-left text-sm font-medium text-white/70 hover:bg-navy-800 hover:text-white"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
