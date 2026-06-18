import { z } from "zod";

const staffRoleSchema = z.enum(["admin", "cashier", "courier", "manager"]);

const userBaseSchema = z
  .object({
    name: z.string().min(1).max(255),
    email: z.string().email().max(255),
    password: z.string().min(8).optional(),
    role: staffRoleSchema,
    branchId: z.coerce.number().int().positive().nullable().optional(),
  });

export const createUserSchema = userBaseSchema
  .refine(
    (data) =>
      data.role === "admin" || data.role === "manager" || data.branchId != null,
    {
      message: "Cashier and courier must have branchId.",
      path: ["branchId"],
    },
  );

export const updateUserSchema = userBaseSchema.partial();

export const userFilterSchema = z.object({
  role: staffRoleSchema.optional(),
  branchId: z.coerce.number().int().positive().optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserFilterInput = z.infer<typeof userFilterSchema>;
