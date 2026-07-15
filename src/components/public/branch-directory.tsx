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
    <main className="min-h-screen bg-paper py-16 text-ink">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-10 space-y-10">
        
        {/* Header - Tipografi Manifes Kargo yang Tegas */}
        <header className="max-w-3xl border-l-4 border-ink pl-5 space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-steel">
            DIREKTORI CABANG // danishEkspedisi
          </span>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-ink sm:text-4xl">
            Temukan Hub &amp; Cabang Terdekat
          </h1>
          <p className="font-body text-sm leading-relaxed text-steel">
            Cari lokasi drop off resmi, kontak hub operasional, dan area jangkauan logistik pengiriman barang Anda secara transparan.
          </p>
        </header>

        {/* Section Utama Pembungkus Panel */}
        <section className="space-y-6">
          
          {/* Bar Pencarian - Desain Neo-Brutalist Border Tebal & Stamp Shadow */}
          <div className="relative h-14 w-full border-2 border-ink bg-paper rounded-app shadow-stamp-sm focus-within:shadow-stamp focus-within:-translate-x-px focus-within:-translate-y-px transition-all">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink stroke-[2.5]" />
            <input
              className="w-full h-full bg-transparent pl-12 pr-4 font-body text-xs font-bold uppercase tracking-wider text-ink outline-none placeholder:text-steel/50"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="CARI NAMA CABANG, KOTA OPERASIONAL, ALAMAT HUB, ATAU TELEPON..."
              type="search"
              value={query}
            />
          </div>

          {/* Alert Status Sistem - Error Box Khas Dokumen Industrial */}
          {error && (
            <div className="border-2 border-dashed border-red-600 bg-red-50 p-4 font-mono text-xs font-bold uppercase tracking-wide text-red-700 rounded-app">
              [SYSTEM ERROR]: {error}
            </div>
          )}
          
          {/* Loading State - Geometris Minimalis */}
          {loading && (
            <div className="flex items-center gap-3 border-2 border-ink border-dashed p-8 justify-center font-mono text-xs font-bold uppercase tracking-widest text-steel bg-ink/1 rounded-app">
              <div className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin" />
              Memuat manifes daftar cabang...
            </div>
          )}

          {/* Grid Manifest Kartu Cabang */}
          {!loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredBranches.map((branch) => (
                <article 
                  className="group relative border-2 border-ink bg-paper p-5 rounded-app shadow-stamp-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-stamp transition-all flex flex-col justify-between" 
                  key={branch.id}
                >
                  <div>
                    {/* Badge Icon - Kotak Cargo Amber Tebal */}
                    <div className="mb-4 flex h-11 w-11 items-center justify-center border-2 border-ink bg-cargo-amber text-ink rounded-app shadow-stamp-sm group-hover:scale-105 transition-transform">
                      <Building2 className="h-5 w-5 stroke-[2.5]" />
                    </div>
                    
                    {/* Nama dan Kota Cabang */}
                    <h2 className="font-display text-sm font-black uppercase tracking-tight text-ink">
                      {branch.name}
                    </h2>
                    <p className="mt-1 font-mono text-[10px] font-bold text-steel tracking-wide uppercase border-b border-ink/10 pb-3">
                      REGIO: {branch.city}
                    </p>
                    
                    {/* Detail Kontak Fisik Hub */}
                    <div className="mt-4 grid gap-3 font-body text-xs text-steel">
                      <p className="flex gap-2.5 items-start">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink stroke-[2.5]" />
                        <span className="leading-snug">{branch.address}</span>
                      </p>
                      <p className="flex items-center gap-2.5">
                        <Phone className="h-4 w-4 text-ink stroke-[2.5]" />
                        <span className="font-mono tracking-wide">{branch.phone}</span>
                      </p>
                    </div>
                  </div>

                  {/* Penanda Stamp Pojok Bawah Kartu */}
                  <div className="mt-5 border-t border-dashed border-ink/10 pt-3 flex justify-between items-center font-mono text-[9px] text-steel/60 uppercase tracking-widest">
                    <span>ID: #{branch.id}</span>
                    <span className="bg-ink/4 px-1.5 py-0.5 border border-ink/10 rounded-2px text-ink font-bold">Verified</span>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Tampilan Data Kosong / Tidak Ditemukan */}
          {!loading && filteredBranches.length === 0 && (
            <div className="border-2 border-dashed border-ink/20 bg-ink/1 p-12 text-center rounded-app space-y-2">
              <strong className="block font-display text-sm font-black uppercase tracking-wider text-ink">
                [!] KATA KUNCI CABANG TIDAK DIKENALI
              </strong>
              <span className="block font-body text-xs text-steel">
                Gunakan kata kunci pencarian yang lebih umum seperti nama kota besar atau nama jalan hub logistik.
              </span>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}