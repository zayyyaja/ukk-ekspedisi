import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireRole } from "@/middleware/role.middleware";
import { getCashierOrderDetail } from "@/services/cashier.service";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireRole("cashier");
    const { id } = await params;
    const data = await getCashierOrderDetail(currentUser, Number(id));

    return successResponse("Cashier order detail retrieved successfully", data);
  } catch (error) {
    return handleApiError(error);
  }
}
