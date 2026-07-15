import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireCustomer } from "@/middleware/customer.middleware";
import { getCustomerShipmentDetail } from "@/services/shipment.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const currentUser = await requireCustomer();
    const { id } = await context.params;
    const shipment = await getCustomerShipmentDetail(currentUser, Number(id));

    return successResponse("Shipment detail retrieved successfully", shipment);
  } catch (error) {
    return handleApiError(error);
  }
}
