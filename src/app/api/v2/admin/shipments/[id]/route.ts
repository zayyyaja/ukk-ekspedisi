import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireRole } from "@/middleware/role.middleware";
import { getShipmentDetailForStaff } from "@/services/shipment.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const currentUser = await requireRole("admin");
    const { id } = await context.params;
    const shipment = await getShipmentDetailForStaff(currentUser, Number(id));

    return successResponse("Shipment detail retrieved successfully", shipment);
  } catch (error) {
    return handleApiError(error);
  }
}
