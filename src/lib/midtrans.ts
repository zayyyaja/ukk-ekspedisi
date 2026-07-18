import crypto from "node:crypto";
import midtransClient from "midtrans-client";
import { env } from "@/config/env";

type SnapTransactionPayload = {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details?: Record<string, unknown>;
  item_details?: Record<string, unknown>[];
  enabled_payments?: string[];
  callbacks?: Record<string, unknown>;
  [key: string]: unknown;
};

type MidtransNotificationPayload = {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
};

// Singleton instances
let snapClient: InstanceType<typeof midtransClient.Snap> | null = null;
let coreApiClient: InstanceType<typeof midtransClient.CoreApi> | null = null;

export function getMidtransSnap() {
  if (!snapClient) {
    snapClient = new midtransClient.Snap({
      isProduction: env.MIDTRANS_IS_PRODUCTION,
      serverKey: env.MIDTRANS_SERVER_KEY,
      clientKey: env.MIDTRANS_CLIENT_KEY,
    });
  }
  return snapClient;
}

export function getMidtransCoreApi() {
  if (!coreApiClient) {
    coreApiClient = new midtransClient.CoreApi({
      isProduction: env.MIDTRANS_IS_PRODUCTION,
      serverKey: env.MIDTRANS_SERVER_KEY,
      clientKey: env.MIDTRANS_CLIENT_KEY,
    });
  }
  return coreApiClient;
}

export async function createSnapTransaction(payload: SnapTransactionPayload) {
  return getMidtransSnap().createTransaction(payload);
}

export function verifyMidtransSignature(payload: MidtransNotificationPayload) {
  const signature = crypto
    .createHash("sha512")
    .update(
      `${payload.order_id}${payload.status_code}${payload.gross_amount}${env.MIDTRANS_SERVER_KEY}`,
    )
    .digest("hex");

  return signature === payload.signature_key;
}

export async function getMidtransTransactionStatus(orderId: string) {
  return getMidtransCoreApi().transaction.status(orderId);
}
