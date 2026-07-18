import type { Metadata } from "next";

import { CtaSection } from "@/components/public/cta-section";
import { HeroSection } from "@/components/public/hero-section";
import { PublicShell } from "@/components/public/public-shell";
import { RateSection } from "@/components/public/rate-section";

// Mengubah metadata ke bahasa yang lebih membumi dan jelas fungsinya
export const metadata: Metadata = {
  title: "DRG-EKSPEDISI | Cek Resi & Kirim Paket Logistik",
  description:
    "Aplikasi pengiriman kargo dan paket logistik domestik. Cek ongkir murah, buat pesanan mudah, dan pantau resi real-time.",
};

export default function HomePage() {
  return (
    <PublicShell>
      {/* Tag <main> dobel dihapus, langsung panggil section-section utama */}
      <HeroSection />
      <RateSection />
      <CtaSection />
    </PublicShell>
  );
}