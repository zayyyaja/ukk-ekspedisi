"use client";

import { Building2, MapPin, Phone, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { apiGet } from "@/lib/api-client";
import type { PublicBranch } from "@/components/public/public-types";
import { fallbackBranches } from "@/components/public/public-types";

export function BranchDirectory() {
  const [branches, setBranches] = useState<PublicBranch[]>(fallbackBranches);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet<PublicBranch[]>("/api/v1/public/branches", { limit: 100 })
      .then((response) => {
        setBranches(response.data.length > 0 ? response.data : fallbackBranches);
        setError("");
      })
      .catch((currentError) => {
        setError(currentError instanceof Error ? currentError.message : "Gagal memuat cabang.");
        setBranches(fallbackBranches);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredBranches = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return branches;

    return branches.filter((branch) =>
      [branch.name, branch.city, branch.address, branch.phone]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(keyword)),
    );
  }, [branches, query]);

  return (
    <main className="section-spacing">
      <div className="page-container space-y-8">
        <header className="max-w-3xl">
          <span className="text-sm font-bold uppercase tracking-wide text-orange-600">Cabang Anterin</span>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">Temukan cabang terdekat</h1>
          <p className="mt-3 text-base text-slate-600">
            Cari lokasi drop off, kontak cabang, dan kota tujuan operasional pengiriman.
          </p>
        </header>

        <section className="panel space-y-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-12"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama cabang, kota, alamat, atau nomor telepon"
              type="search"
              value={query}
            />
          </div>

          {error && <div className="alert error">{error}</div>}
          {loading && <div className="loading-state">Memuat daftar cabang...</div>}

          {!loading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBranches.map((branch) => (
                <article className="card-surface p-5" key={branch.id}>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-950">{branch.name}</h2>
                  <p className="mt-1 font-semibold text-orange-700">{branch.city}</p>
                  <div className="mt-4 grid gap-3 text-sm text-slate-600">
                    <p className="flex gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />
                      <span>{branch.address}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-orange-600" />
                      <span>{branch.phone}</span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && filteredBranches.length === 0 && (
            <div className="empty-state">
              <strong>Cabang tidak ditemukan</strong>
              <span className="muted">Coba gunakan kata kunci kota atau nama jalan lain.</span>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
