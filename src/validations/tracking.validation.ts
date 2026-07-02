import { z } from "zod";

export const trackingFilterSchema = z.object({
  shipmentId: z.coerce.number().int().positive().optional(),
  status: z
    .enum([
      "picked_up",
      "in_transit",
      "arrived_at_branch",
      "delivered",
      "cancelled",
    ])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type TrackingFilterInput = z.infer<typeof trackingFilterSchema>;
