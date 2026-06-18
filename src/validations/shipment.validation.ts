import { z } from "zod";

import { PAYMENT_METHODS } from "@/constants/payment";
import { SHIPMENT_STATUS } from "@/constants/shipment-status";

const paymentMethodValues = [
  PAYMENT_METHODS.cash,
  PAYMENT_METHODS.qris,
  PAYMENT_METHODS.gopay,
  PAYMENT_METHODS.shopeepay,
  PAYMENT_METHODS.bcaVa,
  PAYMENT_METHODS.bniVa,
  PAYMENT_METHODS.briVa,
  PAYMENT_METHODS.mandiriVa,
] as const;

const updatableShipmentStatuses = [
  SHIPMENT_STATUS.pickedUp,
  SHIPMENT_STATUS.inTransit,
  SHIPMENT_STATUS.arrivedAtBranch,
  SHIPMENT_STATUS.outForDelivery,
  SHIPMENT_STATUS.delivered,
  SHIPMENT_STATUS.cancelled,
] as const;

export const createShipmentSchema = z
  .object({
    receiverId: z.coerce.number().int().positive(),
    originBranchId: z.coerce.number().int().positive(),
    destinationBranchId: z.coerce.number().int().positive(),
    rateId: z.coerce.number().int().positive(),
    handoverMethod: z.enum(["drop_off", "pickup"]),
    paymentMethod: z.enum(paymentMethodValues),
    items: z
      .array(
        z.object({
          itemName: z.string().min(2),
          quantity: z.coerce.number().int().min(1),
          weight: z.coerce.number().positive(),
          photo: z.string().url().optional().nullable(),
        }),
      )
      .min(1),
  })
  .refine(
    (data) =>
      data.handoverMethod === "drop_off" || data.paymentMethod !== "cash",
    {
      message: "Pickup shipments require online payment.",
      path: ["paymentMethod"],
    },
  );

export const updateShipmentStatusSchema = z.object({
  status: z.enum(updatableShipmentStatuses),
  location: z.string().min(1),
  description: z.string().min(1),
});

export const assignCourierSchema = z.object({
  courierId: z.coerce.number().int().positive(),
});

export const shipmentListQuerySchema = z.object({
  status: z.enum([
    SHIPMENT_STATUS.pending,
    SHIPMENT_STATUS.pickedUp,
    SHIPMENT_STATUS.inTransit,
    SHIPMENT_STATUS.arrivedAtBranch,
    SHIPMENT_STATUS.outForDelivery,
    SHIPMENT_STATUS.delivered,
    SHIPMENT_STATUS.cancelled,
  ]).optional(),
  branchId: z.coerce.number().int().positive().optional(),
  courierId: z.coerce.number().int().positive().optional(),
  handoverMethod: z.enum(["drop_off", "pickup"]).optional(),
  fromDate: z.string().date().optional(),
  toDate: z.string().date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type UpdateShipmentStatusInput = z.infer<
  typeof updateShipmentStatusSchema
>;
export type AssignCourierInput = z.infer<typeof assignCourierSchema>;
export type ShipmentListQuery = z.infer<typeof shipmentListQuerySchema>;
