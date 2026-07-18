"use client";

import { Anchor, Calculator, Coins, Layers, MapPin, Scale, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

import { type PublicBranch, type PublicRate } from "@/components/public/public-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/api-client";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    apiGet<PublicBranch[]>("/api/v2/public/branches", { limit: 100 })
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

    apiGet<PublicRate[]>("/api/v2/public/rates/check", {
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
    <section className="relative py-24 font-body select-none">
      <div className="page-container relative z-10">
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-x-24">
          
          {/* SISI KIRI: Form Parameter Input */}
          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
            <Card className="w-full border border-border/50 bg-surface/80 backdrop-blur-xl shadow-[0_20px_60px_rgb(0,0,0,0.08)] rounded-3xl overflow-hidden">
              <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">Kalkulator tarif</span>
                <Layers size={16} className="text-muted" />
              </div>

              <CardContent className="p-6 sm:p-8 space-y-6">
                {loadingBranches ? (
                  <LoadingState title="Memuat cabang..." />
                ) : (
                  <form className="grid gap-6" onSubmit={handleSubmit}>
                    
                    {/* Input Cabang Asal */}
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5" htmlFor="origin">
                        <MapPin size={14} className="text-primary" />
                        Cabang asal
                      </label>
                      <Select
                        value={originCity}
                        onValueChange={(value) => setOriginCity(value)}
                        required
                      >
                        <SelectTrigger id="origin" className="h-11 shadow-sm">
                          <SelectValue placeholder="Pilih cabang asal" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={`origin-${branch.id}`} value={branch.city}>
                              {branch.name} ({branch.city.toUpperCase()})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Input Cabang Tujuan */}
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5" htmlFor="destination">
                        <Anchor size={14} className="text-primary" />
                        Cabang tujuan
                      </label>
                      <Select
                        value={destinationCity}
                        onValueChange={(value) => setDestinationCity(value)}
                        required
                      >
                        <SelectTrigger id="destination" className="h-11 shadow-sm">
                          <SelectValue placeholder="Pilih cabang tujuan" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={`dest-${branch.id}`} value={branch.city}>
                              {branch.name} ({branch.city.toUpperCase()})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Input Berat Muatan */}
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1.5" htmlFor="weight">
                        <Scale size={14} className="text-primary" />
                        Berat (KG)
                      </label>
                      <Input
                        id="weight"
                        min="1"
                        onChange={(event) => setWeight(event.target.value)}
                        placeholder="1"
                        required
                        type="number"
                        value={weight}
                        className="h-11 shadow-sm"
                      />
                    </div>

                    {/* Tombol Eksekusi */}
                    <Button 
                      type="submit" 
                      size="lg"
                      className="w-full mt-2"
                    >
                      <Calculator className="mr-2 h-4 w-4" />
                      Hitung Estimasi
                    </Button>
                  </form>
                )}

                {loadingRate ? <LoadingState title="Menghitung..." /> : null}
                {empty ? <EmptyState title="Rute tidak tersedia" /> : null}
                {error ? <ErrorState title="Terjadi kesalahan" /> : null}
              </CardContent>
            </Card>
          </div>

          {/* SISI KANAN: Copy & Output Box */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-10 order-1 lg:order-2">
            
            <div className="space-y-4 text-center lg:text-left">
              <h2 className="text-3xl font-semibold leading-tight text-ink tracking-tight sm:text-4xl lg:text-5xl">
                Tarif transparan. <br/> Tanpa biaya tersembunyi.
              </h2>
              <p className="max-w-xl mx-auto lg:mx-0 text-lg text-muted leading-relaxed">
                Dapatkan estimasi tarif instan untuk pengiriman domestik di seluruh jaringan logistik kami. Apa yang Anda lihat, itu yang Anda bayar.
              </p>
            </div>

            {/* Hasil Real-time (Neo-Minimalist Glass) */}
            <div className="w-full">
              {rate ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 border border-primary/20 bg-primary/5 p-8 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row items-center sm:justify-between gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <div className="space-y-2 text-center sm:text-left z-10">
                    <p className="text-sm font-semibold text-primary uppercase tracking-tight">
                      Estimasi Biaya
                    </p>
                    <h3 className="text-4xl font-bold text-ink tracking-tight">
                      Rp {total.toLocaleString("id-ID")}
                    </h3>
                  </div>

                  <div className="text-center sm:text-right sm:border-l border-primary/20 sm:pl-8 z-10">
                    <p className="text-sm font-medium text-muted">
                      Tarif dasar berlaku untuk <span className="text-ink font-semibold">{weight} kg</span>
                    </p>
                    <p className="text-xs text-primary mt-1 flex items-center justify-center sm:justify-end gap-1">
                      <CheckCircle2 size={14} /> Harga terjamin
                    </p>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-border bg-surface/50 p-8 text-center rounded-2xl backdrop-blur-sm">
                  <p className="text-lg font-medium text-muted">
                    Menunggu detail rute
                  </p>
                  <p className="text-sm text-muted mt-1">
                    Pilih cabang asal dan tujuan Anda untuk mendapatkan estimasi tarif instan.
                  </p>
                </div>
              )}
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
              <div className="flex flex-col gap-2">
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-1">
                  <ShieldCheck size={20} />
                </div>
                <h4 className="text-sm font-semibold text-ink">Asuransi Penuh</h4>
                <p className="text-sm text-muted leading-snug">Setiap pengiriman dilindungi oleh asuransi kargo komprehensif.</p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-1">
                  <Coins size={20} />
                </div>
                <h4 className="text-sm font-semibold text-ink">Tarif Tetap</h4>
                <p className="text-sm text-muted leading-snug">Harga konsisten di seluruh lokasi cabang strategis kami.</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}