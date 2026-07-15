import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { ForbiddenError } from "@/lib/errors";
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
    const currentUser = await requireRole("admin", "manager");
    const { id } = await context.params;
    const user = await getUserDetail(Number(id));
    if (currentUser.role === "manager" && user.role !== "admin") {
      throw new ForbiddenError("Manager hanya dapat melihat admin cabang.");
    }

    return successResponse("User detail retrieved successfully", user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await requireRole("admin", "manager");
    const { id } = await context.params;
    const input = validateRequest(updateUserSchema, await request.json());
    const existing = await getUserDetail(Number(id));
    if (
      currentUser.role === "manager" &&
      (existing.role !== "admin" || (input.role && input.role !== "admin") || input.branchId === null)
    ) {
      throw new ForbiddenError("Manager hanya dapat mengubah admin cabang.");
    }
    const user = await updateUserData(Number(id), input);

    return successResponse("User updated successfully", user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const currentUser = await requireRole("admin", "manager");
    const { id } = await context.params;
    const existing = await getUserDetail(Number(id));
    if (currentUser.role === "manager" && existing.role !== "admin") {
      throw new ForbiddenError("Manager hanya dapat menghapus admin cabang.");
    }
    const user = await deleteUserData(Number(id));

    return successResponse("User deleted successfully", user);
  } catch (error) {
    return handleApiError(error);
  }
}
