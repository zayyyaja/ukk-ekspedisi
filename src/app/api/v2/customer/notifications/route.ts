import { NextRequest } from "next/server";
import { z } from "zod";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireCustomer } from "@/middleware/customer.middleware";
import {
  getCustomerNotificationSummary,
  getCustomerNotifications,
} from "@/services/notification.service";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireCustomer();
    const query = validateRequest(
      listQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await getCustomerNotifications(currentUser, query);

    return successResponse("Notifications retrieved successfully", result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}
