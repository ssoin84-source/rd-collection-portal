export function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-md border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-2 font-display text-2xl font-bold ${accent ? "text-gold-500" : "text-navy-900"}`}>
        {value}
      </p>
    </div>
  );
}
