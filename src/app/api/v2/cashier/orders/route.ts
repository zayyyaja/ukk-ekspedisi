import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import { getCashierOrders } from "@/services/cashier.service";
import { createCashierOrder } from "@/services/shipment.service";
import { createCashierOrderSchema } from "@/validations/shipment.validation";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireRole("cashier");
    const result = await getCashierOrders(
      currentUser,
      Object.fromEntries(request.nextUrl.searchParams),
    );

    return successResponse("Cashier orders retrieved successfully", result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireRole("cashier");
    const body = await request.json();
    const input = validateRequest(createCashierOrderSchema, body);
    const shipment = await createCashierOrder(currentUser, input);

    return successResponse("Cashier order created successfully", shipment, null, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
