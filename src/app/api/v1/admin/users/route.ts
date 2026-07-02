import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireRole } from "@/middleware/role.middleware";
import { createUserData, getUsers } from "@/services/user.service";
import { createUserSchema, userFilterSchema } from "@/validations/user.validation";

export async function GET(request: NextRequest) {
  try {
    await requireRole("admin", "manager");
    const query = validateRequest(
      userFilterSchema,
      Object.fromEntries(request.nextUrl.searchParams),
    );
    const result = await getUsers(query);

    return successResponse("Users retrieved successfully", result.data, result.meta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole("admin", "manager");
    const input = validateRequest(createUserSchema, await request.json());
    const user = await createUserData(input);

    return successResponse("User created successfully", user, null, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
