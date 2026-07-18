export function StatCard({
  label,
  value,
  color = "neutral",
}: {
  label: string;
  value: string | number;
  color?: "primary" | "success" | "warning" | "info" | "danger" | "neutral";
}) {
  const indicatorMap: Record<string, string> = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    info: "bg-info",
    danger: "bg-danger",
    neutral: "bg-slate-300",
  };

  return (
    <div className="stat-tile">
      <div className={`stat-tile-indicator ${indicatorMap[color] || indicatorMap.primary}`} aria-hidden="true" />
      <div className="stat-tile-body">
        <span className="stat-tile-label">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted/40" aria-hidden="true" />
          {label}
        </span>
        <span className="stat-tile-value">{value}</span>
      </div>
    </div>
  );
}
