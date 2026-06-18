import { z } from "zod";

export const createRateSchema = z.object({
  originCity: z.string().min(1).max(255),
  destinationCity: z.string().min(1).max(255),
  pricePerKg: z.coerce.number().positive(),
  estimatedDays: z.coerce.number().int().positive(),
});

export const updateRateSchema = createRateSchema.partial();

export const rateFilterSchema = z.object({
  originCity: z.string().optional(),
  destinationCity: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateRateInput = z.infer<typeof createRateSchema>;
export type UpdateRateInput = z.infer<typeof updateRateSchema>;
export type RateFilterInput = z.infer<typeof rateFilterSchema>;
