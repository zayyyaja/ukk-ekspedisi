import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireAuth } from "@/middleware/auth.middleware";
import { getPaymentDetail } from "@/services/payment.service";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const currentUser = await requireAuth();
    const { id } = await context.params;
    const payment = await getPaymentDetail(currentUser, Number(id));

    return successResponse("Payment detail retrieved successfully", payment);
  } catch (error) {
    return handleApiError(error);
  }
}
