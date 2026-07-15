import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import { confirmCashierOrder } from "@/services/cashier.service";
import { z } from "zod";

const confirmCashierOrderSchema = z.object({
  trackingNumber: z.string().trim().min(1, "Nomor resi wajib diisi."),
  actualWeight: z.coerce.number().positive("Berat aktual harus berupa angka positif.").optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireRole("cashier");
    const { id } = await params;
    const body = await request.json();
    const input = validateRequest(confirmCashierOrderSchema, body);
    const data = await confirmCashierOrder(currentUser, Number(id), input.trackingNumber, input.actualWeight);

    return successResponse("Cashier order confirmed successfully", data);
  } catch (error) {
    return handleApiError(error);
  }
}
