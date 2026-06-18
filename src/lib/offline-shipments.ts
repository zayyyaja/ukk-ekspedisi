"use client";

import { getEkspedisiDb, type OfflineCacheRecord } from "@/lib/indexeddb";
import type { Shipment } from "@/types/customer-portal";

const SHIPMENTS_KEY = "latest";

export async function saveShipments(shipments: Shipment[]) {
  const db = await getEkspedisiDb();
  await db.put("shipments", {
    id: SHIPMENTS_KEY,
    data: shipments,
    savedAt: new Date().toISOString(),
  });
}

export async function getCachedShipments() {
  const db = await getEkspedisiDb();
  return (await db.get("shipments", SHIPMENTS_KEY)) as
    | OfflineCacheRecord<Shipment[]>
    | undefined;
}

export async function clearShipments() {
  const db = await getEkspedisiDb();
  await db.clear("shipments");
}
