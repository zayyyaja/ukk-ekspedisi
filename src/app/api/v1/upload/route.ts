import { randomBytes } from "crypto";
import { writeFile } from "fs/promises";
import { join } from "path";
import { NextRequest } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/response";
import { requireCustomer } from "@/middleware/customer.middleware";

export async function POST(request: NextRequest) {
  try {
    // Ensure only authenticated customers can upload
    await requireCustomer();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return handleApiError(new Error("File tidak ditemukan dalam request"));
    }

    // Read the file data
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a secure random filename while keeping the extension
    const extension = file.name.split(".").pop() || "jpg";
    const randomName = randomBytes(16).toString("hex");
    const fileName = `${randomName}.${extension}`;

    // Define the path: <project_root>/public/uploads/<filename>
    const uploadDir = join(process.cwd(), "public", "uploads");
    const filePath = join(uploadDir, fileName);

    // Write file to local disk
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;

    return successResponse("File uploaded successfully", { url: fileUrl }, null, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
