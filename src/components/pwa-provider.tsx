"use client";

import { useEffect, useState } from "react";
import { setupOfflineSyncListeners } from "@/lib/offline-queue";
import { toast } from "sonner";
import { X, Download } from "lucide-react";

export function PwaProvider() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Setup listeners for Courier Offline Queue
    setupOfflineSyncListeners();

    // Setup Installability Prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Optional: don't show automatically, or show after some time
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white border border-gray-200 shadow-xl p-4 rounded-xl z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-ink">Install Aplikasi</h3>
        <button 
          onClick={() => setShowInstallBanner(false)}
          className="text-muted hover:text-ink transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      <p className="text-sm text-muted mb-4 leading-snug">
        Install DRG Ekspedisi untuk akses offline, performa lebih cepat, dan pengalaman layar penuh layaknya aplikasi native.
      </p>
      <button 
        onClick={handleInstallClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        <Download size={16} />
        Install Sekarang
      </button>
    </div>
  );
}
