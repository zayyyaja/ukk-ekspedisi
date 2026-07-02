import { Badge } from "@/components/ui/badge";

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info" | "outline"> = {
  pending: "warning",
  picked_up: "info",
  in_transit: "info",
  arrived_at_branch: "outline",
  delivered: "success",
  cancelled: "danger",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={statusVariant[status] ?? "outline"}>
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
