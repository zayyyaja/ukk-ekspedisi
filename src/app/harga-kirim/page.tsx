import type { Metadata } from "next";

import { RateChecker } from "@/components/public/rate-checker";
import { PublicShell } from "@/components/public/public-shell";

export const metadata: Metadata = {
  title: "Cek Ongkir - Ekspedisi Online",
  description: "Cek tarif pengiriman berdasarkan kota asal, kota tujuan, dan berat paket.",
};

export default function CekOngkirPage() {
  return (
    <PublicShell>
      <RateChecker />
    </PublicShell>
  );
}
