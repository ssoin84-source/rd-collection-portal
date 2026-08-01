import Link from "next/link";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-navy-900/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-lg font-bold text-navy-900">
          RD Collection
        </Link>
        <nav className="hidden gap-8 md:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="focus-ring text-sm font-medium text-navy-900/70 hover:text-navy-900">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/customer/login" className="focus-ring hidden text-sm font-semibold text-navy-900 hover:underline sm:block">
            Customer Login
          </Link>
          <Link
            href="/admin/login"
            className="focus-ring rounded-sm bg-navy-900 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </header>
  );
}
