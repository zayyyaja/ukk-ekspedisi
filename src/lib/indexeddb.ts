"use client";

import { openDB, type DBSchema } from "idb";

type CachedRecord<T> = {
  id: string;
  data: T;
  savedAt: string;
};

interface EkspedisiDb extends DBSchema {
  shipments: {
    key: string;
    value: CachedRecord<unknown>;
  };
  trackings: {
    key: string;
    value: CachedRecord<unknown>;
  };
  profile: {
    key: string;
    value: CachedRecord<unknown>;
  };
  dashboard: {
    key: string;
    value: CachedRecord<unknown>;
  };
}

const DB_NAME = "ekspedisi-db";
const DB_VERSION = 1;

export function getEkspedisiDb() {
  return openDB<EkspedisiDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("shipments")) {
        db.createObjectStore("shipments", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("trackings")) {
        db.createObjectStore("trackings", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("profile")) {
        db.createObjectStore("profile", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("dashboard")) {
        db.createObjectStore("dashboard", { keyPath: "id" });
      }
    },
  });
}

export type OfflineCacheRecord<T> = CachedRecord<T>;
