import { NextRequest } from "next/server";
import { z } from "zod";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import { receiveShipmentAtDestination } from "@/services/shipment.service";

const receiveShipmentSchema = z.object({
  shipmentId: z.coerce.number().int().positive().optional(),
  trackingNumber: z.string().trim().min(1, "Nomor resi wajib diisi."),
});

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireRole("admin");
    const input = validateRequest(receiveShipmentSchema, await request.json());
    const shipment = await receiveShipmentAtDestination(
      currentUser,
      input.trackingNumber,
      input.shipmentId,
    );

    return successResponse("Paket tujuan berhasil diterima.", shipment);
  } catch (error) {
    return handleApiError(error);
  }
}
