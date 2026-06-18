import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import {
  deleteUserData,
  getUserDetail,
  updateUserData,
} from "@/services/user.service";
import { updateUserSchema } from "@/validations/user.validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole("admin", "manager");
    const { id } = await context.params;
    const user = await getUserDetail(Number(id));

    return successResponse("User detail retrieved successfully", user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireRole("admin");
    const { id } = await context.params;
    const input = validateRequest(updateUserSchema, await request.json());
    const user = await updateUserData(Number(id), input);

    return successResponse("User updated successfully", user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole("admin");
    const { id } = await context.params;
    const user = await deleteUserData(Number(id));

    return successResponse("User deleted successfully", user);
  } catch (error) {
    return handleApiError(error);
  }
}
