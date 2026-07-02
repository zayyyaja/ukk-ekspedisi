import { toJsonSafe } from "@/lib/serialize";
import { applyShipmentScope } from "@/lib/shipment-scope";
import { getDashboardData } from "@/repositories/dashboard.repository";
import type { AuthUser } from "@/types/auth";

export async function getDashboardSummary(currentUser: AuthUser) {
  return toJsonSafe(await getDashboardData(applyShipmentScope(currentUser)));
}
