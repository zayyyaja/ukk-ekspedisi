import { NextRequest } from "next/server";
import { z } from "zod";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import { verifyCashierOrderByResi } from "@/services/cashier.service";

const verifyResiSchema = z.object({
  trackingNumber: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireRole("cashier");
    const body = await request.json();
    const input = validateRequest(verifyResiSchema, body);
    const data = await verifyCashierOrderByResi(currentUser, input.trackingNumber);

    return successResponse("Order verified by tracking number successfully", data);
  } catch (error) {
    return handleApiError(error);
  }
}
