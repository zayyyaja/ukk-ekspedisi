import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireCustomer } from "@/middleware/customer.middleware";
import { cancelCustomerShipment } from "@/services/shipment.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    const currentUser = await requireCustomer();
    const { id } = await context.params;
    const shipment = await cancelCustomerShipment(currentUser, Number(id));

    return successResponse("Shipment cancelled successfully", shipment);
  } catch (error) {
    return handleApiError(error);
  }
}
