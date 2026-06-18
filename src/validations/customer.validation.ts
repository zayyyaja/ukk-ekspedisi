import { z } from "zod";

export const updateCustomerSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).max(255).optional(),
  phone: z.string().min(1).max(15).optional(),
  photo: z.string().url().nullable().optional(),
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

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerFilterInput = z.infer<typeof customerFilterSchema>;
