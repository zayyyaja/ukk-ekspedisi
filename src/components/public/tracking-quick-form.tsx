"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TrackingQuickForm() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const resi = trackingNumber.trim();

    if (resi) {
      router.push(`/tracking?resi=${encodeURIComponent(resi)}`);
    }
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm sm:flex-row"
      onSubmit={handleSubmit}
    >
      <label className="sr-only" htmlFor="quick-resi">
        Nomor Resi
      </label>
      <Input
        id="quick-resi"
        onChange={(event) => setTrackingNumber(event.target.value)}
        placeholder="Masukkan nomor resi"
        value={trackingNumber}
      />
      <Button className="sm:w-auto" type="submit">
        <Search className="h-4 w-4" />
        Lacak Paket
      </Button>
    </form>
  );
}
