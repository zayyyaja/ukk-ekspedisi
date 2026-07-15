import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { ForbiddenError } from "@/lib/errors";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import { createUserData, getUsers } from "@/services/user.service";
import { createUserSchema, userFilterSchema } from "@/validations/user.validation";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireRole("admin", "manager");
    const query = validateRequest(
      userFilterSchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    if (currentUser.role === "manager") {
      query.role = "admin";
    }
    const result = await getUsers(query);

    return successResponse("Users retrieved successfully", result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireRole("admin", "manager");
    const input = validateRequest(createUserSchema, await request.json());
    if (currentUser.role === "manager" && (input.role !== "admin" || !input.branchId)) {
      throw new ForbiddenError("Manager hanya dapat membuat admin cabang.");
    }
    const user = await createUserData(input);

    return successResponse("User created successfully", user, null, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
