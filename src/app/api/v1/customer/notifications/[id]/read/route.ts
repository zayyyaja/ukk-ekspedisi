import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireCustomer } from "@/middleware/customer.middleware";
import { readCustomerNotification } from "@/services/notification.service";

export async function PATCH(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await requireCustomer();
    const { id } = await context.params;
    const notification = await readCustomerNotification(currentUser, Number(id));

    return successResponse("Notification marked as read", notification);
  } catch (error) {
    return handleApiError(error);
  }
}
