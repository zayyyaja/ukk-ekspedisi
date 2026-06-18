"use client";

import { MapPin, Phone, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { fallbackBranches, type PublicBranch } from "@/components/public/public-types";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/api-client";

export function BranchDirectory() {
  const [branches, setBranches] = useState<PublicBranch[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiGet<PublicBranch[]>("/api/v1/public/branches", { limit: 100 })
      .then((response) => setBranches(response.data))
      .catch(() => {
        setBranches(fallbackBranches);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredBranches = useMemo(() => {
    const keyword = query.toLowerCase().trim();
    if (!keyword) {
      return branches;
    }

    return branches.filter(
      (branch) =>
        branch.name.toLowerCase().includes(keyword) ||
        branch.city.toLowerCase().includes(keyword),
    );
  }, [branches, query]);

  return (
    <main className="bg-background px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase text-blue-600">Cabang</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950">
            Temukan cabang terdekat untuk pickup dan drop off.
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            Cari berdasarkan nama cabang atau kota untuk melihat alamat dan
            nomor telepon cabang.
          </p>
        </section>

        <div className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-card p-3">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            className="border-0 focus-visible:ring-0"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama cabang atau kota"
            value={query}
          />
        </div>

        {loading ? <LoadingState title="Memuat daftar cabang" /> : null}
        {!loading && error ? (
          <div className="mb-4">
            <ErrorState
              description="Menampilkan data fallback sementara karena API cabang belum dapat diakses."
              title="Data cabang fallback"
            />
          </div>
        ) : null}
        {!loading && !filteredBranches.length ? (
          <EmptyState title="Cabang tidak ditemukan" />
        ) : null}
        {!loading && filteredBranches.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBranches.map((branch) => (
              <Card key={branch.id}>
                <CardContent className="space-y-3 p-5">
                  <div>
                    <h2 className="font-bold text-slate-950">{branch.name}</h2>
                    <p className="text-sm text-blue-700">{branch.city}</p>
                  </div>
                  <p className="flex items-start gap-2 text-sm leading-6 text-slate-600">
                    <MapPin className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
                    {branch.address}
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
    </main>
  );
}
