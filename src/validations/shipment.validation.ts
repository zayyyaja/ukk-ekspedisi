import { z } from "zod";

import { PAYMENT_METHODS, isPaymentMethodAllowedForHandover } from "@/constants/payment";
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
    receiverId: z.coerce.number().int().positive().optional(),
    receiverAddress: z.string().min(1).optional(),
    receiver: z.object({
      name: z.string().min(2).max(50),
      email: z.string().trim().email().optional().or(z.literal("")),
      phone: z.string().max(15).optional().or(z.literal("")),
      address: z.string().min(1),
      note: z.string().max(500).optional().or(z.literal("")),
    }).optional(),
    originBranchId: z.coerce.number().int().positive(),
    destinationBranchId: z.coerce.number().int().positive(),
    rateId: z.coerce.number().int().positive().optional(),
    handoverMethod: z.enum(["drop_off", "pickup"]).default("drop_off"),
    paymentMethod: z.enum(paymentMethodValues),
    items: z
      .array(
        z.object({
          itemName: z.string().min(2),
          itemType: z.string().max(100).optional().or(z.literal("")),
          quantity: z.coerce.number().int().min(1),
          weight: z.coerce.number().positive(),
          photo: z.string().optional().nullable(),
        }),
      )
      .min(1),
  })
  .refine((data) => isPaymentMethodAllowedForHandover(data.handoverMethod, data.paymentMethod), {
    message: "Cash hanya tersedia untuk metode Datang ke Cabang.",
    path: ["paymentMethod"],
  });

export const createCashierOrderSchema = z
  .object({
    sender: z.object({
      name: z.string().min(2).max(50),
      email: z.string().trim().email().optional().or(z.literal("")),
      phone: z.string().min(1).max(15),
      address: z.string().min(1),
      city: z.string().min(1).max(255),
    }),
    receiver: z.object({
      name: z.string().min(2).max(50),
      phone: z.string().min(1).max(15),
      address: z.string().min(1),
      city: z.string().min(1).max(255),
    }),
    originBranchId: z.coerce.number().int().positive(),
    destinationBranchId: z.coerce.number().int().positive(),
    rateId: z.coerce.number().int().positive().optional(),
    handoverMethod: z.enum(["drop_off", "pickup"]).default("drop_off"),
    paymentMethod: z.enum(paymentMethodValues),
    items: z
      .array(
        z.object({
          itemName: z.string().min(2),
          quantity: z.coerce.number().int().min(1),
          weight: z.coerce.number().positive(),
          photo: z.string().optional().nullable(),
        }),
      )
      .min(1),
  })
  .refine((data) => isPaymentMethodAllowedForHandover(data.handoverMethod, data.paymentMethod), {
    message: "Cash hanya tersedia untuk metode Datang ke Cabang.",
    path: ["paymentMethod"],
  });

export const updateShipmentStatusSchema = z.object({
  status: z.enum(updatableShipmentStatuses),
  location: z.string().min(1),
  description: z.string().min(1),
  photo: z.string().optional(),
});

export const assignCourierSchema = z.object({
  courierCode: z.string().trim().regex(/^\d{5}$/, "ID Kurir harus menggunakan format BBBKK, contoh 00101."),
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
export type CreateCashierOrderInput = z.infer<typeof createCashierOrderSchema>;
export type UpdateShipmentStatusInput = z.infer<
  typeof updateShipmentStatusSchema
>;
export type AssignCourierInput = z.infer<typeof assignCourierSchema>;
export type ShipmentListQuery = z.infer<typeof shipmentListQuerySchema>;
