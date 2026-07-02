"use client";

import { Calculator, MapPin, Scale } from "lucide-react";
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
    <section className="relative bg-background py-20">
      <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-10 z-10">
        <div className="grid items-center gap-24 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Sisi Kiri: Deskripsi & Informasi */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">Cek Ongkir</p>
            <h2 className="mt-3 font-space text-4xl font-bold leading-tight text-slate-950">
              Hitung estimasi biaya pengiriman Anda dengan mudah.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Masukkan cabang asal pengiriman, tujuan, serta berat paket Anda. Sistem kami akan mencari tarif terbaik secara real-time langsung dari database.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-950">Pilihan Cabang Resmi</h4>
                  <p className="text-sm text-slate-600">Tersebar di berbagai kota besar di Indonesia.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-950">Biaya Akurat</h4>
                  <p className="text-sm text-slate-600">Kalkulasi biaya otomatis berdasarkan berat paket aktual.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Form Cek Ongkir */}
          <div className="flex justify-end">
            <Card className="w-full max-w-lg border border-slate-200/80 shadow-lg">
              <CardContent className="space-y-6 p-4 sm:p-6">
                {loadingBranches ? (
                  <LoadingState title="Memuat data cabang..." />
                ) : (
                  <form className="grid gap-5" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-slate-700" htmlFor="origin">
                        Cabang Asal (Kota Pengiriman)
                      </label>
                      <select
                        id="origin"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={originCity}
                        onChange={(e) => setOriginCity(e.target.value)}
                        required
                      >
                        {branches.map((branch) => (
                          <option key={`origin-${branch.id}`} value={branch.city}>
                            {branch.name} ({branch.city})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-slate-700" htmlFor="destination">
                        Cabang Tujuan (Kota Penerima)
                      </label>
                      <select
                        id="destination"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={destinationCity}
                        onChange={(e) => setDestinationCity(e.target.value)}
                        required
                      >
                        {branches.map((branch) => (
                          <option key={`dest-${branch.id}`} value={branch.city}>
                            {branch.name} ({branch.city})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-semibold text-slate-700" htmlFor="weight">
                        Berat Paket (kg)
                      </label>
                      <Input
                        id="weight"
                        min="1"
                        onChange={(event) => setWeight(event.target.value)}
                        placeholder="1"
                        required
                        type="number"
                        value={weight}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-orange-500 text-white hover:bg-orange-600">
                      <Calculator className="mr-2 h-4 w-4" />
                      Cek Ongkir
                    </Button>
                  </form>
                )}

                {loadingRate ? <LoadingState title="Menghitung ongkir..." /> : null}
                {empty ? <EmptyState title="Tarif rute belum tersedia." /> : null}
                {error ? <ErrorState title="Gagal mengecek ongkir" /> : null}

                {rate && (
                  <div className="animate-in fade-in rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-8 text-center shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">
                      Total Ongkos Kirim
                    </p>

                    <h3 className="mt-3 text-4xl font-black text-slate-900">
                      Rp {total.toLocaleString("id-ID")}
                    </h3>

                    <p className="mt-3 text-sm text-slate-500">
                      Tarif dihitung berdasarkan kota asal, kota tujuan,
                      dan berat paket yang Anda masukkan.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
