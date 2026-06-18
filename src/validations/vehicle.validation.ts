import { z } from "zod";

export const createVehicleSchema = z.object({
  plateNumber: z.string().min(1).max(255),
  type: z.enum(["motor", "mobil", "truck"]),
  courierId: z.coerce.number().int().positive().optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const assignCourierVehicleSchema = z.object({
  courierId: z.coerce.number().int().positive(),
});

export const vehicleFilterSchema = z.object({
  type: z.enum(["motor", "mobil", "truck"]).optional(),
  courierId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type AssignCourierVehicleInput = z.infer<
  typeof assignCourierVehicleSchema
>;
export type VehicleFilterInput = z.infer<typeof vehicleFilterSchema>;
