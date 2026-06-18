"use client";

import { getEkspedisiDb, type OfflineCacheRecord } from "@/lib/indexeddb";
import type { Payment, Shipment } from "@/types/customer-portal";

const DASHBOARD_KEY = "latest";

export type OfflineDashboardData = {
  shipments: Shipment[];
  payments: Payment[];
  summary: {
    total: number;
    pending: number;
    delivered: number;
    unpaid: number;
  };
};

export async function saveDashboard(data: OfflineDashboardData) {
  const db = await getEkspedisiDb();
  await db.put("dashboard", {
    id: DASHBOARD_KEY,
    data,
    savedAt: new Date().toISOString(),
  });
}

export async function getDashboard() {
  const db = await getEkspedisiDb();
  return (await db.get("dashboard", DASHBOARD_KEY)) as
    | OfflineCacheRecord<OfflineDashboardData>
    | undefined;
}

export async function clearDashboard() {
  const db = await getEkspedisiDb();
  await db.clear("dashboard");
}
