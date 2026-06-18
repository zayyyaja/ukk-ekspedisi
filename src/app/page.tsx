import type { Metadata } from "next";

import { BenefitsSection } from "@/components/public/benefits-section";
import { BranchPreviewSection } from "@/components/public/branch-preview-section";
import { CtaSection } from "@/components/public/cta-section";
import { HeroSection } from "@/components/public/hero-section";
import { PublicShell } from "@/components/public/public-shell";
import { ServicesSection } from "@/components/public/services-section";
import { ShipmentFlowSection } from "@/components/public/shipment-flow-section";
import { ShipmentStatusSection } from "@/components/public/shipment-status-section";
import { StatsSection } from "@/components/public/stats-section";

export const metadata: Metadata = {
  title: "Ekspedisi Online - Kirim Paket Lebih Mudah",
  description:
    "Landing page Sistem Informasi Ekspedisi Online untuk pickup, drop off, pembayaran, dan tracking paket realtime.",
};

export default function HomePage() {
  return (
    <PublicShell>
      <main>
        <HeroSection />
        <ServicesSection />
        <ShipmentFlowSection />
        <ShipmentStatusSection />
        <BenefitsSection />
        <StatsSection />
        <BranchPreviewSection />
        <CtaSection />
      </main>
    </PublicShell>
  );
}
