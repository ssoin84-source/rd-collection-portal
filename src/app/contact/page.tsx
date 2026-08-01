import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <section className="mx-auto max-w-2xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">Contact</p>
        <h1 className="mt-4 font-display text-3xl font-bold text-navy-900">Get in touch</h1>
        <p className="mt-4 text-navy-900/70">
          Customers: your login is created and managed by our office. If you've lost access, please contact your
          local branch directly rather than through this form.
        </p>
        <div className="mt-8 space-y-3 rounded-md border border-navy-900/10 bg-white p-6 shadow-sm text-sm">
          <p><span className="font-semibold text-navy-900">Office Hours:</span> Mon–Sat, 10:00 AM – 6:00 PM</p>
          <p><span className="font-semibold text-navy-900">Phone:</span> +91 00000 00000</p>
          <p><span className="font-semibold text-navy-900">Email:</span> support@example.com</p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
