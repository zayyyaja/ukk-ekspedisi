import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireRole } from "@/middleware/role.middleware";
import { getDashboardSummary } from "@/services/dashboard.service";

export async function GET() {
  try {
    const currentUser = await requireRole("admin");
    const dashboard = await getDashboardSummary(currentUser);

    return successResponse("Dashboard retrieved successfully", dashboard);
  } catch (error) {
    return handleApiError(error);
  }
}
