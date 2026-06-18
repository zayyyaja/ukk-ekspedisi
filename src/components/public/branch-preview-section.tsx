"use client";

import { MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { fallbackBranches, type PublicBranch } from "@/components/public/public-types";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiGet } from "@/lib/api-client";

export function BranchPreviewSection() {
  const [branches, setBranches] = useState<PublicBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiGet<PublicBranch[]>("/api/v1/public/branches", { limit: 4 })
      .then((response) => setBranches(response.data.slice(0, 4)))
      .catch(() => {
        setError(true);
        setBranches(fallbackBranches.slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase text-blue-600">
              Preview Cabang
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              Cabang aktif untuk pickup dan drop off.
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/cabang">Lihat Semua Cabang</Link>
          </Button>
        </div>

        {loading ? <LoadingState title="Memuat cabang" /> : null}
        {!loading && error ? (
          <div className="mb-4">
            <ErrorState
              description="Menampilkan data fallback sementara karena API cabang belum dapat diakses."
              title="Data cabang fallback"
            />
          </div>
        ) : null}
        {!loading && !branches.length ? <EmptyState title="Belum ada cabang" /> : null}
        {!loading && branches.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {branches.map((branch) => (
              <Card key={branch.id}>
                <CardContent className="space-y-3 p-5">
                  <h3 className="font-bold text-slate-950">{branch.name}</h3>
                  <p className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    {branch.city} - {branch.address}
                  </p>
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-blue-600" />
                    {branch.phone}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
