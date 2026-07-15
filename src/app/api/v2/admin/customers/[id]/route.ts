import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import {
  getCustomerDetail,
  updateCustomerData,
} from "@/services/customer.service";
import { updateCustomerSchema } from "@/validations/customer.validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole("admin");
    const { id } = await context.params;
    const customer = await getCustomerDetail(Number(id));

    return successResponse("Customer detail retrieved successfully", customer);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireRole("admin");
    const { id } = await context.params;
    const input = validateRequest(updateCustomerSchema, await request.json());
    const customer = await updateCustomerData(Number(id), input);

    return successResponse("Customer updated successfully", customer);
  } catch (error) {
    return handleApiError(error);
  }
}
