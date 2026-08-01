import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

const PROJECTS = [
  { name: "Monthly RD Scheme", detail: "Fixed monthly denomination, flexible tenure, penalty on overdue months." },
  { name: "Doorstep Collection", detail: "Field agents batch daily collections into lots for same-day posting." },
  { name: "Digital Passbook Access", detail: "Members view balances and due dates online, read-only, anytime." },
];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">Projects</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-navy-900">What we run collections for</h1>
        <div className="mt-8 space-y-4">
          {PROJECTS.map((p) => (
            <div key={p.name} className="rounded-md border border-navy-900/10 bg-white p-6 shadow-sm">
              <p className="font-display font-semibold text-navy-900">{p.name}</p>
              <p className="mt-1 text-sm text-navy-900/60">{p.detail}</p>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
