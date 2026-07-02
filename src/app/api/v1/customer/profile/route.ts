import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireCustomer } from "@/middleware/customer.middleware";
import { updateCustomerData } from "@/services/customer.service";
import { updateCustomerSchema } from "@/validations/customer.validation";

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await requireCustomer();
    const body = await request.json();
    const input = validateRequest(updateCustomerSchema, body);
    const customer = await updateCustomerData(currentUser.id, input);

    return successResponse("Profile updated successfully", customer);
  } catch (error) {
    return handleApiError(error);
  }
}
