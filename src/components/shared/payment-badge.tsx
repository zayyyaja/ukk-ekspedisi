import { Badge } from "@/components/ui/badge";

const paymentVariant: Record<string, "success" | "warning" | "danger" | "outline"> = {
  paid: "success",
  pending: "warning",
  failed: "danger",
};

export function PaymentBadge({ status }: { status: string }) {
  return <Badge variant={paymentVariant[status] ?? "outline"}>{status}</Badge>;
}
