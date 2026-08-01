import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

const FEATURES = [
  { title: "Lot-based collection", body: "Field collections are batched into lots and posted together — with full rollback if a lot needs correction." },
  { title: "Auto-calculated dues", body: "Month due, pending amount, penalty and total due update automatically as each month passes." },
  { title: "Admin-controlled access", body: "Every customer login is created and reset by the office. No self-registration, no shared passwords." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">Recurring Deposit Collection</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-navy-900 md:text-5xl">
            Every installment, accounted for.
          </h1>
          <p className="mt-5 max-w-md text-navy-900/70">
            A single ledger for your recurring deposit members — collections, dues and penalties tracked
            automatically, month after month.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/customer/login" className="focus-ring rounded-sm bg-navy-900 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-800">
              Customer Login
            </Link>
            <Link href="/contact" className="focus-ring rounded-sm border border-navy-900/20 px-6 py-3 text-sm font-semibold text-navy-900 hover:bg-navy-900/5">
              Contact Us
            </Link>
          </div>
        </div>

        {/* Signature element: a passbook ledger card, since the subject is a deposit passbook */}
        <div className="relative mx-auto w-full max-w-sm rotate-1 rounded-lg border border-navy-900/10 bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-dashed border-navy-900/15 pb-3">
            <p className="font-display text-sm font-bold text-navy-900">Deposit Passbook</p>
            <span className="rounded-sm bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-success">Active</span>
          </div>
          <dl className="mt-4 space-y-2.5 text-sm">
            {[
              ["Account No.", "RD-10482"],
              ["Denomination", "₹1,000 / month"],
              ["Month Paid Upto", "Jun 2026"],
              ["Next Due", "Jul 2026"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-navy-900/5 pb-2">
                <dt className="text-navy-900/50">{label}</dt>
                <dd className="font-medium text-navy-900">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 rounded-sm bg-gold-100 px-3 py-2 text-center text-xs font-semibold text-navy-900">
            Total Deposited: ₹24,000
          </div>
        </div>
      </section>

      <section className="border-t border-navy-900/5 bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-2xl font-bold text-navy-900">Built for how collections actually work</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-md border border-navy-900/10 p-6">
                <p className="font-display font-semibold text-navy-900">{f.title}</p>
                <p className="mt-2 text-sm text-navy-900/60">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
