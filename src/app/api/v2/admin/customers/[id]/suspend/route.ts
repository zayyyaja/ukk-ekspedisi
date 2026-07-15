import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireRole } from "@/middleware/role.middleware";
import { suspendCustomer } from "@/services/customer.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole("admin");
    const { id } = await context.params;
    const customer = await suspendCustomer(Number(id));

    return successResponse("Customer suspended successfully", customer);
  } catch (error) {
    return handleApiError(error);
  }
}
