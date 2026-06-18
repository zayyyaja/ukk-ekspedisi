"use client";

import { CheckCircle2, RefreshCw, WifiOff } from "lucide-react";

import { useOnlineStatus } from "@/hooks/use-online-status";

export function SyncStatus({ syncing = false }: { syncing?: boolean }) {
  const online = useOnlineStatus();

  if (syncing) {
    return (
      <span className="sync-status">
        <RefreshCw size={15} />
        Menyinkronkan...
      </span>
    );
  }

  return (
    <span className="sync-status">
      {online ? <CheckCircle2 size={15} /> : <WifiOff size={15} />}
      {online ? "Sinkron" : "Offline"}
    </span>
  );
}
