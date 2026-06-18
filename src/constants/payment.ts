export const PAYMENT_METHODS = {
  cash: "cash",
  qris: "qris",
  gopay: "gopay",
  shopeepay: "shopeepay",
  bcaVa: "bca_va",
  bniVa: "bni_va",
  briVa: "bri_va",
  mandiriVa: "mandiri_va",
} as const;

export const PAYMENT_STATUSES = {
  pending: "pending",
  paid: "paid",
  failed: "failed",
} as const;

export const ONLINE_PAYMENT_METHODS = [
  PAYMENT_METHODS.qris,
  PAYMENT_METHODS.gopay,
  PAYMENT_METHODS.shopeepay,
  PAYMENT_METHODS.bcaVa,
  PAYMENT_METHODS.bniVa,
  PAYMENT_METHODS.briVa,
  PAYMENT_METHODS.mandiriVa,
] as const;

export type PaymentMethod =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

export function isOnlinePaymentMethod(method: PaymentMethod) {
  return method !== PAYMENT_METHODS.cash;
}

export function isPaymentMethodAllowedForHandover(
  handoverMethod: "drop_off" | "pickup",
  paymentMethod: PaymentMethod,
) {
  if (handoverMethod === "pickup") {
    return isOnlinePaymentMethod(paymentMethod);
  }

  return true;
}
