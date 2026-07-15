import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireRole } from "@/middleware/role.middleware";
import { rejectOrder } from "@/services/cashier.service";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireRole("cashier");
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    const data = await rejectOrder(currentUser, Number(id), body.reason ?? "");

    return successResponse("Cashier order rejected successfully", data);
  } catch (error) {
    return handleApiError(error);
  }
}
