import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import { createBranchData, getBranches } from "@/services/branch.service";
import {
  branchFilterSchema,
  createBranchSchema,
} from "@/validations/branch.validation";

export async function GET(request: NextRequest) {
  try {
    await requireRole("admin", "manager");
    const query = validateRequest(
      branchFilterSchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await getBranches(query);

    return successResponse("Branches retrieved successfully", result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole("admin");
    const input = validateRequest(createBranchSchema, await request.json());
    const branch = await createBranchData(input);

    return successResponse("Branch created successfully", branch, null, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
