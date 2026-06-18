import { toJsonSafe } from "@/lib/serialize";
import { getDashboardData } from "@/repositories/dashboard.repository";

export async function getDashboardSummary() {
  return toJsonSafe(await getDashboardData());
}
