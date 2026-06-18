"use client";

import { WifiOff } from "lucide-react";

import { useOnlineStatus } from "@/hooks/use-online-status";

export function OfflineBanner() {
  const online = useOnlineStatus();

  if (online) {
    return null;
  }

  return (
    <div className="offline-banner">
      <WifiOff size={17} />
      <span>Anda sedang offline. Menampilkan data terakhir yang tersimpan.</span>
    </div>
  );
}
