"use client";

import { toast } from "sonner";
import { apiPost } from "./api-client";

export interface OfflineUpdate {
  id: string; // Unique ID (e.g. timestamp + trackingNumber)
  trackingNumber: string;
  newStatus: string;
  timestamp: number;
}

const DB_NAME = "drg_ekspedisi_pwa";
const STORE_NAME = "offline_shipment_updates";
const DB_VERSION = 1;

// Initialize IndexedDB
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("IndexedDB is not available on server"));
    }
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // We use 'id' as the keyPath. We also create an index on timestamp for sequential processing.
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("trackingNumber", "trackingNumber", { unique: false });
      }
    };
  });
}

// Add update to queue
export async function addUpdateToQueue(update: Omit<OfflineUpdate, "id" | "timestamp">) {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const timestamp = Date.now();
    
    const item: OfflineUpdate = {
      ...update,
      id: `${timestamp}_${update.trackingNumber}`,
      timestamp,
    };

    const request = store.add(item);
    request.onsuccess = () => {
      window.dispatchEvent(new Event("pwa-queue-updated"));
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

// Get all queued updates, ordered by timestamp
export async function getQueuedUpdates(): Promise<OfflineUpdate[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("timestamp");
    const request = index.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// Get pending updates for a specific tracking number
export async function getPendingUpdatesForTracking(trackingNumber: string): Promise<OfflineUpdate[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("trackingNumber");
    const request = index.getAll(trackingNumber);

    request.onsuccess = () => {
      // Sort by timestamp
      const results: OfflineUpdate[] = request.result || [];
      results.sort((a, b) => a.timestamp - b.timestamp);
      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

// Remove an update from the queue
export async function removeUpdateFromQueue(id: string) {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      window.dispatchEvent(new Event("pwa-queue-updated"));
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

// Sync flag to prevent concurrent syncs
let isSyncing = false;

// Process the queue sequentially
export async function syncQueue() {
  if (isSyncing || typeof window === "undefined" || !navigator.onLine) return;
  
  try {
    isSyncing = true;
    const updates = await getQueuedUpdates();
    
    if (updates.length === 0) {
      isSyncing = false;
      return;
    }

    // Process sequentially (FIFO)
    for (const update of updates) {
      // Only proceed if still online
      if (!navigator.onLine) {
        break;
      }

      try {
        await apiPost("/api/v2/staff/shipments/update-status", {
          trackingNumber: update.trackingNumber,
          status: update.newStatus,
        });

        // Scenario (a): Success -> Remove from queue
        await removeUpdateFromQueue(update.id);
        
      } catch (error: any) {
        // Scenario (c): 400 Bad Request (Validation Conflict) -> Remove and notify
        if (error?.status === 400) {
          await removeUpdateFromQueue(update.id);
          toast.error(`Gagal sinkronisasi resi ${update.trackingNumber}`, {
            description: "Status pesanan telah berubah atau diloncati oleh pengguna lain.",
            duration: 8000,
          });
        }
        // Scenario (b): Network failure or timeout -> Keep in queue, break sync loop to try later
        else {
          console.warn(`Sync failed for ${update.trackingNumber}, keeping in queue for next retry.`, error);
          break; // Stop processing further items until network is definitely stable
        }
      }
    }
    
    // If we finished and there are listeners, we could dispatch a custom event to tell UI to refresh
    window.dispatchEvent(new Event("pwa-sync-completed"));
    window.dispatchEvent(new Event("pwa-queue-updated"));
    
  } finally {
    isSyncing = false;
  }
}

// Hook to setup automatic syncing
export function setupOfflineSyncListeners() {
  if (typeof window === "undefined") return;

  // 1. Online event
  window.addEventListener("online", () => {
    syncQueue();
  });

  // 2. Visibility change event (for iOS fallback and coming back to app)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && navigator.onLine) {
      syncQueue();
    }
  });
}
