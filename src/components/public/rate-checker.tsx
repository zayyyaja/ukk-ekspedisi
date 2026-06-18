"use client";

import { Calculator } from "lucide-react";
import { useState } from "react";

import { type PublicRate } from "@/components/public/public-types";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/api-client";

export function RateChecker() {
  const [originCity, setOriginCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [weight, setWeight] = useState("1");
  const [rate, setRate] = useState<PublicRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [error, setError] = useState(false);

  const total = rate ? Number(rate.price_per_kg) * Number(weight || 0) : 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
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
      .finally(() => setLoading(false));
  }

  return (
    <main className="bg-background px-4 py-16">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section>
          <p className="text-sm font-semibold uppercase text-blue-600">Cek Ongkir</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950">
            Hitung estimasi biaya sebelum membuat shipment.
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            Masukkan kota asal, kota tujuan, dan berat paket. Tarif diambil dari
            data public rates yang tersedia di sistem.
          </p>
        </section>
        <Card>
          <CardContent className="space-y-5 p-6">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <label className="text-sm font-semibold" htmlFor="origin">
                  Kota Asal
                </label>
                <Input
                  id="origin"
                  onChange={(event) => setOriginCity(event.target.value)}
                  placeholder="Depok"
                  required
                  value={originCity}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold" htmlFor="destination">
                  Kota Tujuan
                </label>
                <Input
                  id="destination"
                  onChange={(event) => setDestinationCity(event.target.value)}
                  placeholder="Bogor"
                  required
                  value={destinationCity}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold" htmlFor="weight">
                  Berat
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
              <Button type="submit">
                <Calculator className="h-4 w-4" />
                Cek Ongkir
              </Button>
            </form>

            {loading ? <LoadingState title="Menghitung ongkir" /> : null}
            {empty ? <EmptyState title="Tarif rute belum tersedia." /> : null}
            {error ? <ErrorState title="Gagal mengecek ongkir" /> : null}
            {rate ? (
              <div className="grid gap-3 rounded-lg border border-blue-100 bg-blue-50 p-5">
                <div>
                  <p className="text-sm text-blue-700">Harga</p>
                  <strong className="text-3xl text-slate-950">
                    Rp {total.toLocaleString("id-ID")}
                  </strong>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <p className="rounded-md bg-white p-3 text-sm">
                    Estimasi Hari: <strong>{rate.estimated_days} hari</strong>
                  </p>
                  <p className="rounded-md bg-white p-3 text-sm">
                    Harga Per KG:{" "}
                    <strong>Rp {Number(rate.price_per_kg).toLocaleString("id-ID")}</strong>
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
