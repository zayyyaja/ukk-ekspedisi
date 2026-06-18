import type { Metadata } from "next";

import { BranchDirectory } from "@/components/public/branch-directory";
import { PublicShell } from "@/components/public/public-shell";

export const metadata: Metadata = {
  title: "Daftar Cabang - Ekspedisi Online",
  description: "Temukan cabang Ekspedisi Online untuk pickup dan drop off paket.",
};

export default function CabangPage() {
  return (
    <PublicShell>
      <BranchDirectory />
    </PublicShell>
  );
}
