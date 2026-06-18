import crypto from "node:crypto";

import midtransClient from "midtrans-client";

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

function isProduction() {
  return process.env.MIDTRANS_IS_PRODUCTION === "true";
}

export function getMidtransSnap() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const clientKey = process.env.MIDTRANS_CLIENT_KEY;

  if (!serverKey || !clientKey) {
    throw new Error("Midtrans credentials are not configured");
  }

  return new midtransClient.Snap({
    isProduction: isProduction(),
    serverKey,
    clientKey,
  });
}

export async function createSnapTransaction(payload: SnapTransactionPayload) {
  if (
    process.env.NODE_ENV !== "production" &&
    (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_CLIENT_KEY)
  ) {
    const orderId = payload.transaction_details.order_id;

    return {
      token: `dev-snap-token-${orderId}`,
      redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${orderId}`,
    };
  }

  return getMidtransSnap().createTransaction(payload);
}

export function verifyMidtransSignature(payload: MidtransNotificationPayload) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;

  if (!serverKey) {
    if (process.env.NODE_ENV !== "production") {
      return true;
    }

    throw new Error("MIDTRANS_SERVER_KEY is not configured");
  }

  const signature = crypto
    .createHash("sha512")
    .update(
      `${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`,
    )
    .digest("hex");

  return signature === payload.signature_key;
}
