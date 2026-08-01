export function SiteFooter() {
  return (
    <footer className="border-t border-navy-900/10 bg-navy-950 text-white/70">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm">
        <p className="font-display text-base font-bold text-white">RD Collection</p>
        <p className="mt-2 max-w-md">
          Disciplined recurring deposit collection and record-keeping for member-based savings groups.
        </p>
        <p className="mt-6 text-xs text-white/40">© {new Date().getFullYear()} RD Collection Management Portal.</p>
      </div>
    </footer>
  );
}
