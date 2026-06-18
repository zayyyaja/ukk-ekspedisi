import { z } from "zod";

import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/constants/payment";

const onlinePaymentMethods = [
  PAYMENT_METHODS.qris,
  PAYMENT_METHODS.gopay,
  PAYMENT_METHODS.shopeepay,
  PAYMENT_METHODS.bcaVa,
  PAYMENT_METHODS.bniVa,
  PAYMENT_METHODS.briVa,
  PAYMENT_METHODS.mandiriVa,
] as const;

const paymentMethods = [
  PAYMENT_METHODS.cash,
  ...onlinePaymentMethods,
] as const;

export const createOnlinePaymentSchema = z.object({
  paymentMethod: z.enum(onlinePaymentMethods),
});

export const verifyCashPaymentSchema = z.object({
  paidAmount: z.coerce.number().positive(),
  note: z.string().optional(),
});

export const paymentFilterSchema = z.object({
  paymentStatus: z
    .enum([
      PAYMENT_STATUSES.pending,
      PAYMENT_STATUSES.paid,
      PAYMENT_STATUSES.failed,
    ])
    .optional(),
  paymentMethod: z.enum(paymentMethods).optional(),
  branchId: z.coerce.number().int().positive().optional(),
  fromDate: z.string().date().optional(),
  toDate: z.string().date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateOnlinePaymentInput = z.infer<
  typeof createOnlinePaymentSchema
>;
export type VerifyCashPaymentInput = z.infer<typeof verifyCashPaymentSchema>;
export type PaymentFilterInput = z.infer<typeof paymentFilterSchema>;
