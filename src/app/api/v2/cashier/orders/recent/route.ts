import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireRole } from "@/middleware/role.middleware";
import { getRecentCashierOrders } from "@/services/cashier.service";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireRole("cashier");
    const result = await getRecentCashierOrders(
      currentUser,
      Object.fromEntries(request.nextUrl.searchParams),
    );

    return successResponse("Recent cashier orders retrieved successfully", result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}
