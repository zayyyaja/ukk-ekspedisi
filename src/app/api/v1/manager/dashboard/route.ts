import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireRole } from "@/middleware/role.middleware";
import { getDashboardSummary } from "@/services/dashboard.service";

export async function GET() {
  try {
    await requireRole("manager");
    const dashboard = await getDashboardSummary();

    return successResponse("Dashboard retrieved successfully", dashboard);
  } catch (error) {
    return handleApiError(error);
  }
}
