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
    apiGet<PublicBranch[]>("/api/v2/public/branches", { limit: 100 })
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
    <main className="min-h-screen bg-surface py-24 text-ink font-body">
      <div className="page-container space-y-12">
        
        {/* Header */}
        <header className="max-w-2xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-tight text-primary rounded-full">
            Network Directory
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Find your local hub.
          </h1>
          <p className="text-base leading-relaxed text-muted">
            Locate official drop-off points, operational hub contacts, and our transparent domestic logistics coverage area.
          </p>
        </header>

        {/* Section Utama Pembungkus Panel */}
        <section className="space-y-10 max-w-5xl mx-auto w-full">
          
          {/* Bar Pencarian */}
          <div className="relative h-16 w-full max-w-2xl mx-auto overflow-hidden rounded-xl border border-border bg-surface shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20">
            <Search className="absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-muted" />
            <input
              className="h-full w-full bg-transparent pl-16 pr-6 text-base font-medium text-ink outline-none placeholder:text-muted"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search branch name, city, or address..."
              type="search"
              value={query}
            />
          </div>

          {/* Alert Status Sistem */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 text-sm font-semibold text-red-800 shadow-sm">
              {error}
            </div>
          )}
          
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-border border-dashed bg-slate-50/50 p-12 text-sm font-semibold text-muted">
              <div className="h-5 w-5 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
              Memuat daftar cabang...
            </div>
          )}

          {/* Grid Manifest Kartu Cabang */}
          {!loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBranches.map((branch) => (
                <article 
                  className="group flex flex-col justify-between rounded-2xl border border-border/60 bg-surface p-6 shadow-sm transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5" 
                  key={branch.id}
                >
                  <div>
                    {/* Badge Icon */}
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Building2 className="h-6 w-6" />
                    </div>
                    
                    {/* Nama dan Kota Cabang */}
                    <h2 className="text-lg font-semibold tracking-tight text-ink">
                      {branch.name}
                    </h2>
                    <p className="mt-1 mb-5 border-b border-border/50 pb-5 text-[11px] font-bold text-primary uppercase tracking-wider">
                      Area: {branch.city}
                    </p>
                    
                    {/* Detail Kontak Fisik Hub */}
                    <div className="mt-5 grid gap-4 text-sm text-muted">
                      <p className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <span className="leading-snug">{branch.address}</span>
                      </p>
                      <p className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="font-medium text-ink">{branch.phone}</span>
                      </p>
                    </div>
                  </div>

                  {/* Footer Card */}
                  <div className="mt-8 flex items-center justify-between pt-4 text-[10px] font-bold uppercase tracking-tight text-muted/60">
                    <span>ID: #{branch.id}</span>
                    <span className="rounded-full bg-emerald-50 text-emerald-600 px-2.5 py-1">Verified</span>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Tampilan Data Kosong / Tidak Ditemukan */}
          {!loading && filteredBranches.length === 0 && (
            <div className="space-y-2 rounded-2xl border border-dashed border-border/60 bg-surface p-16 text-center shadow-sm">
              <strong className="block text-base font-semibold text-ink">
                No branches found
              </strong>
              <span className="block text-sm text-muted">
                Try searching with a broader keyword, like a major city or street name.
              </span>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}