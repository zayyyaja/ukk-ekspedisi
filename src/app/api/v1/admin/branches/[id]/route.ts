import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import {
  deleteBranchData,
  getBranchDetail,
  updateBranchData,
} from "@/services/branch.service";
import { updateBranchSchema } from "@/validations/branch.validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole("admin", "manager");
    const { id } = await context.params;
    const branch = await getBranchDetail(Number(id));

    return successResponse("Branch detail retrieved successfully", branch);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireRole("admin");
    const { id } = await context.params;
    const input = validateRequest(updateBranchSchema, await request.json());
    const branch = await updateBranchData(Number(id), input);

    return successResponse("Branch updated successfully", branch);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole("admin");
    const { id } = await context.params;
    const branch = await deleteBranchData(Number(id));

    return successResponse("Branch deleted successfully", branch);
  } catch (error) {
    return handleApiError(error);
  }
}
