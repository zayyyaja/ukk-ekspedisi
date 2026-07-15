import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireRole } from "@/middleware/role.middleware";
import { getCashierDashboardSummary } from "@/services/cashier.service";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireRole("cashier");
    const data = await getCashierDashboardSummary(
      currentUser,
      Object.fromEntries(request.nextUrl.searchParams),
    );

    return successResponse("Cashier dashboard summary retrieved successfully", data);
  } catch (error) {
    return handleApiError(error);
  }
}
