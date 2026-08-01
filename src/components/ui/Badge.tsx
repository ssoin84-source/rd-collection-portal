const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success",
  INACTIVE: "bg-amber-100 text-amber-700",
  ARCHIVED: "bg-gray-200 text-gray-600",
  OVERDUE: "bg-danger/10 text-danger",
  CURRENT: "bg-success/10 text-success",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-semibold tracking-wide ${style}`}>
      {status}
    </span>
  );
}
