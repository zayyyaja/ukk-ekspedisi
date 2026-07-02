type StatusBadgeProps = {
  status?: string | null;
};

const labels: Record<string, string> = {
  pending: "Pending",
  picked_up: "Picked up",
  in_transit: "In transit",
  arrived_at_branch: "Arrived at branch",
  delivered: "Delivered",
  cancelled: "Cancelled",
  paid: "Paid",
  failed: "Failed",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const value = status ?? "pending";

  return <span className={`badge ${value}`}>{labels[value] ?? value}</span>;
}
