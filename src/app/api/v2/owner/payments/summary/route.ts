import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireRole } from "@/middleware/role.middleware";
import { getManagerPaymentSummary } from "@/services/payment.service";

export async function GET() {
  try {
    const currentUser = await requireRole("owner");
    const summary = await getManagerPaymentSummary(currentUser);

    return successResponse("Payment summary retrieved successfully", summary);
  } catch (error) {
    return handleApiError(error);
  }
}
