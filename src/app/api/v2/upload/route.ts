import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { isFormDataFile } from "@/lib/form-data-file";
import { saveLocalImage } from "@/lib/local-upload";
import { successResponse } from "@/lib/response";
import { requireCustomer } from "@/middleware/customer.middleware";

export async function POST(request: NextRequest) {
  try {
    await requireCustomer();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!isFormDataFile(file)) {
      return handleApiError(new Error("File tidak ditemukan dalam request"));
    }

    const fileUrl = await saveLocalImage(file);

    return successResponse("File uploaded successfully", { url: fileUrl }, null, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
