import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireCustomer } from "@/middleware/customer.middleware";
import {
  createShipment,
  getCustomerShipments,
} from "@/services/shipment.service";
import { validateRequest } from "@/lib/validation";
import {
  createShipmentSchema,
  shipmentListQuerySchema,
} from "@/validations/shipment.validation";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireCustomer();
    const query = validateRequest(
      shipmentListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await getCustomerShipments(currentUser, query);

    return successResponse("Shipments retrieved successfully", result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireCustomer();
    const body = await request.json();
    const input = validateRequest(createShipmentSchema, body);
    const shipment = await createShipment(currentUser, input);

    return successResponse("Shipment created successfully", shipment, null, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
