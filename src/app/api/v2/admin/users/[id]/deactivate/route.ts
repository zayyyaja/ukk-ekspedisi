import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireRole } from "@/middleware/role.middleware";
import { deactivateUser } from "@/services/user.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole("admin");
    const { id } = await context.params;
    const user = await deactivateUser(Number(id));

    return successResponse("User deactivated successfully", user);
  } catch (error) {
    return handleApiError(error);
  }
}
