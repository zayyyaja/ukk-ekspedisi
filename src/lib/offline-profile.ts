"use client";

import { getEkspedisiDb, type OfflineCacheRecord } from "@/lib/indexeddb";
import type { CurrentUser } from "@/types/customer-portal";

const PROFILE_KEY = "current";

export async function saveProfile(profile: CurrentUser | Record<string, unknown>) {
  const db = await getEkspedisiDb();
  await db.put("profile", {
    id: PROFILE_KEY,
    data: profile,
    savedAt: new Date().toISOString(),
  });
}

export async function getCachedProfile() {
  const db = await getEkspedisiDb();
  return (await db.get("profile", PROFILE_KEY)) as
    | OfflineCacheRecord<CurrentUser | Record<string, unknown>>
    | undefined;
}

export async function clearProfile() {
  const db = await getEkspedisiDb();
  await db.clear("profile");
}
