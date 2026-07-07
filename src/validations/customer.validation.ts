import { z } from "zod";

function normalizePhone(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  return value.replace(/\s+/g, "").slice(0, 15);
}

/** Validasi field teks saat customer update profil (foto ditangani terpisah di route). */
export const updateCustomerProfileSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(50, "Nama maksimal 50 karakter"),
  address: z.string().trim().min(1, "Alamat wajib diisi"),
  city: z.string().trim().min(1, "Kota wajib diisi").max(255),
  phone: z.preprocess(
    normalizePhone,
    z.string().min(1, "Telepon wajib diisi").max(15, "Telepon maksimal 15 karakter"),
  ),
});

/** Validasi admin / JSON update (photo berupa path string, bukan File). */
export const updateCustomerSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  address: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).max(255).optional(),
  phone: z.preprocess(
    normalizePhone,
    z.string().min(1).max(15).optional(),
  ),
  photo: z.preprocess(
    (value) => (value === "" ? null : value),
    z.string().max(255).nullable().optional(),
  ),
});

export const customerFilterSchema = z.object({
  city: z.string().optional(),
  isVerified: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerFilterInput = z.infer<typeof customerFilterSchema>;
