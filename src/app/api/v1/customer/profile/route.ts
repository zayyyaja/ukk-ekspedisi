import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { isFormDataFile } from "@/lib/form-data-file";
import { saveLocalImage } from "@/lib/local-upload";
import { successResponse } from "@/lib/response";
import { validateRequest } from "@/lib/validation";
import { requireCustomer } from "@/middleware/customer.middleware";
import { updateCustomerData } from "@/services/customer.service";
import {
  updateCustomerProfileSchema,
  type UpdateCustomerInput,
} from "@/validations/customer.validation";

function getStringField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

async function parseMultipartProfile(request: NextRequest) {
  const formData = await request.formData();

  const profileFields = {
    name: getStringField(formData, "name"),
    phone: getStringField(formData, "phone"),
    address: getStringField(formData, "address"),
    city: getStringField(formData, "city"),
  };

  let photo: string | null | undefined;

  if (formData.get("removePhoto") === "true") {
    photo = null;
  } else {
    const photoFile = formData.get("photo");
    if (isFormDataFile(photoFile) && photoFile.size > 0) {
      photo = await saveLocalImage(photoFile, "profile");
    }
  }

  return { profileFields, photo };
}

async function parseJsonProfile(request: NextRequest) {
  const body = (await request.json()) as Record<string, unknown>;
  const profileFields = {
    name: typeof body.name === "string" ? body.name : "",
    phone: typeof body.phone === "string" ? body.phone : "",
    address: typeof body.address === "string" ? body.address : "",
    city: typeof body.city === "string" ? body.city : "",
  };

  let photo: string | null | undefined;
  if (body.photo === null) {
    photo = null;
  } else if (typeof body.photo === "string") {
    photo = body.photo;
  }

  return { profileFields, photo };
}

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await requireCustomer();
    const contentType = request.headers.get("content-type") ?? "";

    const { profileFields, photo } = contentType.includes("application/json")
      ? await parseJsonProfile(request)
      : await parseMultipartProfile(request);

    const validated = validateRequest(updateCustomerProfileSchema, profileFields);

    const updatePayload: UpdateCustomerInput = {
      ...validated,
      ...(photo !== undefined ? { photo } : {}),
    };

    const customer = await updateCustomerData(currentUser.id, updatePayload);

    return successResponse("Profile berhasil diperbarui", customer);
  } catch (error) {
    console.error("[PATCH /api/v1/customer/profile]", error);
    return handleApiError(error);
  }
}
