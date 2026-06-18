"use client";

import { getEkspedisiDb, type OfflineCacheRecord } from "@/lib/indexeddb";
import type { Shipment } from "@/types/customer-portal";

const TRACKING_KEY = "latest";

export async function saveTracking(tracking: Shipment) {
  const db = await getEkspedisiDb();
  await db.put("trackings", {
    id: TRACKING_KEY,
    data: tracking,
    savedAt: new Date().toISOString(),
  });
}

export async function getCachedTracking() {
  const db = await getEkspedisiDb();
  return (await db.get("trackings", TRACKING_KEY)) as
    | OfflineCacheRecord<Shipment>
    | undefined;
}

export async function clearTracking() {
  const db = await getEkspedisiDb();
  await db.clear("trackings");
}
