"use client";

import { Anchor, Calculator, Coins, Layers, MapPin, Scale, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { type PublicBranch, type PublicRate } from "@/components/public/public-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/api-client";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";

export function RateSection() {
  const [branches, setBranches] = useState<PublicBranch[]>([]);
  const [originCity, setOriginCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [weight, setWeight] = useState("1");
  const [rate, setRate] = useState<PublicRate | null>(null);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingRate, setLoadingRate] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiGet<PublicBranch[]>("/api/v1/public/branches", { limit: 100 })
      .then((response) => {
        setBranches(response.data);
        if (response.data.length > 0) {
          setOriginCity(response.data[0].city);
          setDestinationCity(response.data[0].city);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat data cabang", err);
      })
      .finally(() => setLoadingBranches(false));
  }, []);

  const total = rate ? Number(rate.price_per_kg) * Number(weight || 0) : 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!originCity || !destinationCity) return;

    setLoadingRate(true);
    setRate(null);
    setEmpty(false);
    setError(false);

    apiGet<PublicRate[]>("/api/v1/public/rates/check", {
      originCity,
      destinationCity,
      limit: 1,
    })
      .then((response) => {
        const firstRate = response.data[0];
        if (!firstRate) {
          setEmpty(true);
          return;
        }
        setRate(firstRate);
      })
      .catch(() => setError(true))
      .finally(() => setLoadingRate(false));
  }

  return (
    <section className="relative bg-slate-50 py-20 border-b-4 border-slate-900 font-mono select-none">
      {/* Pola Grid Latar Belakang Gudang Logistik */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-60" />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid items-stretch gap-12 lg:grid-cols-12 lg:gap-x-24">
          
          {/* SISI KIRI: Form Parameter Input Muatan (Beban Angkut) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <Card className="w-full border-4 border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-sm overflow-hidden">
              {/* Top Banner Penanda Form */}
              <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-3xs font-black uppercase tracking-widest">
                <span>[ PARAMETER_KONTROL_BIAYA ]</span>
                <Layers size={12} className="text-amber-400" />
              </div>

              <CardContent className="p-6 sm:p-8 space-y-5">
                {loadingBranches ? (
                  <LoadingState title="[ ENKRIPSI_CABANG ] Menghubungkan Terminal..." />
                ) : (
                  <form className="grid gap-5" onSubmit={handleSubmit}>
                    
                    {/* Input Cabang Asal */}
                    <div className="grid gap-1.5">
                      <label className="text-3xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1" htmlFor="origin">
                        <MapPin size={10} className="text-rose-500 shrink-0" />
                        TITIK DEPARTURE (STASIUN ASAL)
                      </label>
                      <select
                        id="origin"
                        className="flex h-11 w-full rounded-sm border-2 border-slate-900 bg-slate-50 px-3 text-2xs font-black uppercase tracking-wide text-slate-900 outline-none focus:bg-amber-50 cursor-pointer"
                        value={originCity}
                        onChange={(e) => setOriginCity(e.target.value)}
                        required
                      >
                        {branches.map((branch) => (
                          <option key={`origin-${branch.id}`} value={branch.city}>
                            HUB_{branch.city.toUpperCase()} // {branch.name.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Input Cabang Tujuan */}
                    <div className="grid gap-1.5">
                      <label className="text-3xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1" htmlFor="destination">
                        <Anchor size={10} className="text-blue-500 shrink-0" />
                        DESTINASI ARIVAL (SEKTOR TUJUAN)
                      </label>
                      <select
                        id="destination"
                        className="flex h-11 w-full rounded-sm border-2 border-slate-900 bg-slate-50 px-3 text-2xs font-black uppercase tracking-wide text-slate-900 outline-none focus:bg-amber-50 cursor-pointer"
                        value={destinationCity}
                        onChange={(e) => setDestinationCity(e.target.value)}
                        required
                      >
                        {branches.map((branch) => (
                          <option key={`dest-${branch.id}`} value={branch.city}>
                            HUB_{branch.city.toUpperCase()} // {branch.name.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Input Berat Muatan */}
                    <div className="grid gap-1.5">
                      <label className="text-3xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1" htmlFor="weight">
                        <Scale size={10} className="text-amber-500 shrink-0" />
                        BOBOT MASSA AKTUAL (KILOGRAM)
                      </label>
                      <Input
                        id="weight"
                        min="1"
                        onChange={(event) => setWeight(event.target.value)}
                        placeholder="1"
                        required
                        type="number"
                        value={weight}
                        className="h-11 border-2 border-slate-900 rounded-sm font-black text-2xs bg-slate-50 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-slate-900 focus-visible:bg-white"
                      />
                    </div>

                    {/* Tombol Eksekusi */}
                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] text-2xs font-black uppercase tracking-widest rounded-sm transition-all"
                    >
                      <Calculator className="mr-2 h-3.5 w-3.5 stroke-[2.5]" />
                      PROSES NOMINAL MANIFES
                    </Button>
                  </form>
                )}

                {loadingRate ? <LoadingState title="[ RE-KALKULASI POOL ] Menyusun Manifes..." /> : null}
                {empty ? <EmptyState title="RUTE DISTRIBUSI BELUM TERSEDIA DI LOG" /> : null}
                {error ? <ErrorState title="TRANSMISI JALUR PIPELINE ERROR" /> : null}
              </CardContent>
            </Card>
          </div>

          {/* SISI KANAN: Deskripsi Manifes & Output Box Hasil Real-time */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8 py-2">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-slate-900 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-400 rounded-xs">
                  PIPELINE TARIF // V.02
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">// SECURE TRANSMISSION</span>
              </div>

              <h2 className="text-3xl font-black leading-[1.1] text-slate-900 uppercase tracking-tight sm:text-4xl">
                Kalkulator Manifes Muatan & Logistik
              </h2>

              <p className="max-w-2xl text-2xs font-bold uppercase tracking-wide text-slate-500 leading-relaxed">
                Sistem transparansi pipa data untuk penaksiran nilai pengiriman kargo domestik. Setiap kalkulasi mengacu pada koordinat pangkalan operasional logistik secara presisi dan seketika.
              </p>
            </div>

            {/* Jika Ada Hasil: Box Output Pejal Neo-Brutalist Kuning Garis */}
            {rate ? (
              <div className="animate-in zoom-in-95 duration-200 border-4 border-slate-900 bg-amber-400 p-6 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-sm relative overflow-hidden flex flex-col sm:flex-row items-center sm:justify-between gap-6">
                {/* Arsiran Garis Industrial Tipis */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-[size:16px_16px] opacity-5 pointer-events-none" />
                
                <div className="space-y-1 relative z-10 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-slate-950/80 text-[10px] font-black uppercase tracking-widest">
                    <Coins size={12} className="stroke-[2.5]" />
                    <span>ESTIMASI TERMINAL BIAYA</span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-950 sm:text-4xl tracking-tight">
                    RP {total.toLocaleString("id-ID")}
                  </h3>
                </div>

                <div className="text-center sm:text-right border-t-2 sm:border-t-0 sm:border-l-2 border-slate-900/30 pt-4 sm:pt-0 sm:pl-6 max-w-xs relative z-10">
                  <p className="text-[10px] font-black text-slate-950/90 uppercase tracking-wide leading-normal">
                    // Lolos Regulasi Tarif Maksimum Berdasarkan Bobot {weight} Kg Aktual.
                  </p>
                </div>
              </div>
            ) : (
              /* Blok Kosong Sebelum Cek Tarif (Mengisi Layout Agar Seimbang) */
              <div className="border-4 border-dashed border-slate-300 p-8 text-center rounded-sm">
                <p className="text-3xl font-black text-slate-300 uppercase tracking-wider">
                  [ WAITING_INPUT_DATA ]
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                  Masukkan parameter muatan di sebelah kiri untuk merilis nominal manifes
                </p>
              </div>
            )}

            {/* Indikator Pangkalan Logistik */}
            <div className="grid grid-cols-2 gap-4 border-t-2 border-slate-900/10 pt-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 border-2 border-slate-900 bg-white p-1 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] rounded-xs shrink-0">
                  <ShieldCheck size={14} className="text-emerald-600 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-2xs font-black uppercase text-slate-900 tracking-wide">PENGAMANAN BERLAPIS</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-snug mt-0.5">Asuransi perlindungan penuh pada koridor distribusi resmi.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 border-2 border-slate-900 bg-white p-1 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] rounded-xs shrink-0">
                  <Coins size={14} className="text-blue-600 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-2xs font-black uppercase text-slate-900 tracking-wide">METRIKS REAL-TIME</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-snug mt-0.5">Sinkronisasi tarif antar stasiun terminal tanpa biaya siluman.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}