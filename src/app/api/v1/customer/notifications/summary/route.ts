import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireCustomer } from "@/middleware/customer.middleware";
import { getCustomerNotificationSummary } from "@/services/notification.service";

export async function GET(_request: NextRequest) {
  try {
    const currentUser = await requireCustomer();
    const summary = await getCustomerNotificationSummary(currentUser);

    return successResponse("Notification summary retrieved successfully", summary);
  } catch (error) {
    return handleApiError(error);
  }
}
