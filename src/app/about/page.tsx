import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">About</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-navy-900">Built around the passbook, not the software</h1>
        <p className="mt-6 text-navy-900/70">
          Recurring deposit collection has always run on discipline: a fixed amount, paid on a fixed date, recorded
          in a passbook that both sides trust. This portal keeps that same discipline, just faster to reconcile —
          every account carries its own opening date, denomination and payment history, and every overdue month is
          calculated automatically instead of by hand.
        </p>
        <p className="mt-4 text-navy-900/70">
          Field collection happens in lots, so a day's work is entered once and posted together. If something needs
          correcting, deleting a lot rolls back exactly what it changed — nothing is left half-updated.
        </p>
      </section>
      <SiteFooter />
    </div>
  );
}
