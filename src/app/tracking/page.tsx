import type { Metadata } from "next";
import { Suspense } from "react";

import { PublicShell } from "@/components/public/public-shell";
import { TrackingPortal } from "@/components/public/tracking-portal";
import { LoadingState } from "@/components/shared/loading-state";

export const metadata: Metadata = {
  title: "Tracking Paket - Ekspedisi Online",
  description: "Lacak status paket Ekspedisi Online tanpa login.",
};

export default function TrackingPage() {
  return (
    <PublicShell>
      <Suspense
        fallback={
          <main className="px-4 py-16">
            <LoadingState title="Memuat tracking" />
          </main>
        }
      >
        <TrackingPortal />
      </Suspense>
    </PublicShell>
  );
}
