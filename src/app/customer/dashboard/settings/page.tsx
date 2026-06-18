"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { clearDashboard, getDashboard } from "@/lib/offline-dashboard";
import { clearProfile, getCachedProfile } from "@/lib/offline-profile";
import { clearShipments, getCachedShipments } from "@/lib/offline-shipments";
import { clearTracking, getCachedTracking } from "@/lib/offline-tracking";

export default function CustomerSettingsPage() {
  const [lastSync, setLastSync] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  async function loadStatus() {
    const [dashboard, shipments, tracking, profile] = await Promise.all([
      getDashboard(),
      getCachedShipments(),
      getCachedTracking(),
      getCachedProfile(),
    ]);
    setLastSync(
      [
        dashboard && `Dashboard: ${dashboard.savedAt}`,
        shipments && `Shipments: ${shipments.savedAt}`,
        tracking && `Tracking: ${tracking.savedAt}`,
        profile && `Profile: ${profile.savedAt}`,
      ].filter(Boolean) as string[],
    );
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  async function clearOfflineData() {
    await Promise.all([
      clearShipments(),
      clearTracking(),
      clearProfile(),
      clearDashboard(),
    ]);
    setMessage("Data offline berhasil dihapus.");
    await loadStatus();
  }

  return (
    <section className="content">
      <div className="page-head">
        <div>
          <h1>Settings PWA</h1>
          <p className="subtitle">Kelola data offline yang tersimpan di perangkat ini.</p>
        </div>
      </div>

      <section className="panel">
        <h2>Storage Usage</h2>
        <p className="muted">
          Data offline disimpan di IndexedDB browser untuk dashboard, shipment,
          tracking, dan profile.
        </p>
      </section>

      <section className="panel">
        <h2>Last Sync</h2>
        {lastSync.length === 0 ? (
          <p className="muted">Belum ada data offline tersimpan.</p>
        ) : (
          <ul>
            {lastSync.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel form-grid">
        <h2>Clear Offline Data</h2>
        {message && <div className="alert success">{message}</div>}
        <button className="button danger" onClick={clearOfflineData} type="button">
          <Trash2 size={17} />
          Hapus Data Offline
        </button>
      </section>
    </section>
  );
}
