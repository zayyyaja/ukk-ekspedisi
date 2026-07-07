import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

import { ValidationError } from "@/lib/errors";
import { isFormDataFile } from "@/lib/form-data-file";

const MAX_SIZE = 5 * 1024 * 1024;

export async function saveLocalImage(
  file: FormDataEntryValue | null | undefined,
  subfolder = "",
): Promise<string> {
  if (!isFormDataFile(file) || file.size === 0) {
    throw new ValidationError("File gambar tidak valid", { photo: ["File gambar tidak valid"] });
  }

  if (!file.type.startsWith("image/")) {
    throw new ValidationError("Hanya file gambar yang diperbolehkan", {
      photo: ["Hanya file gambar yang diperbolehkan"],
    });
  }

  if (file.size > MAX_SIZE) {
    throw new ValidationError("Ukuran file maksimal 5MB", {
      photo: ["Ukuran file maksimal 5MB"],
    });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const rawExtension = file.name.split(".").pop() || "jpg";
  const extension = rawExtension.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const fileName = `${randomBytes(16).toString("hex")}.${extension}`;
  const safeSubfolder = subfolder.replace(/[^a-z0-9_-]/gi, "");
  const uploadDir = safeSubfolder
    ? join(process.cwd(), "public", "uploads", safeSubfolder)
    : join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, fileName), buffer);

  return safeSubfolder ? `/uploads/${safeSubfolder}/${fileName}` : `/uploads/${fileName}`;
}
