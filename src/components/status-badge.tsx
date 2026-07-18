import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status?: string | null;
  className?: string;
};

const styles: Record<string, string> = {
  pending: "badge-status badge-pending",
  picked_up: "badge-status badge-picked-up",
  in_transit: "badge-status badge-in-transit",
  arrived_at_branch: "badge-status badge-at-branch",
  out_for_delivery: "badge-status badge-out-for-delivery",
  delivered: "badge-status badge-success",
  cancelled: "badge-status badge-danger",
  paid: "badge-status badge-success",
  failed: "badge-status badge-danger",
};

export const labels: Record<string, string> = {
  pending: "Menunggu",
  picked_up: "Dijemput",
  in_transit: "Dalam proses",
  arrived_at_branch: "Tiba di cabang",
  out_for_delivery: "Sedang dikirim",
  delivered: "Selesai",
  cancelled: "Dibatalkan",
  paid: "Lunas",
  failed: "Gagal",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const value = status?.toLowerCase() ?? "pending";
  const defaultStyle = "badge-status badge-neutral";

  return (
    <span
      className={cn(
        styles[value] || defaultStyle,
        className
      )}
    >
      {labels[value] ?? value}
    </span>
  );
}
