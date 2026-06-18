import { z } from "zod";

export const createBranchSchema = z.object({
  name: z.string().min(1).max(255),
  city: z.string().min(1).max(255),
  address: z.string().min(1).max(255),
  phone: z.string().min(1).max(25),
});

export const updateBranchSchema = createBranchSchema.partial();

export const branchFilterSchema = z.object({
  city: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
export type BranchFilterInput = z.infer<typeof branchFilterSchema>;
