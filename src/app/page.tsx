import type { Metadata } from "next";

import { CtaSection } from "@/components/public/cta-section";
import { HeroSection } from "@/components/public/hero-section";
import { PublicShell } from "@/components/public/public-shell";
import { RateSection } from "@/components/public/rate-section";

export const metadata: Metadata = {
  title: "Anterin",
  description:
    "Landing page Sistem Informasi Ekspedisi Online untuk drop off, pembayaran online, dan tracking paket realtime.",
};

export default function HomePage() {
  return (
    <PublicShell>
      <main>
        <HeroSection />
        <RateSection />
        <CtaSection />
      </main>
    </PublicShell>
  );
}
