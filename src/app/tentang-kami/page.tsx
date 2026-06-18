import type { Metadata } from "next";
import { Building2, Eye, Network, ShieldCheck } from "lucide-react";

import { PublicShell } from "@/components/public/public-shell";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Tentang Kami - Ekspedisi Online",
  description: "Profil perusahaan, visi, misi, dan keunggulan Ekspedisi Online.",
};

const missions = [
  "Menyediakan proses pengiriman yang mudah dipantau dari awal sampai selesai.",
  "Menghubungkan cabang, customer, kasir, kurir, dan manager dalam satu sistem.",
  "Mendukung pembayaran digital yang aman dan mudah digunakan.",
];

const strengths = [
  { title: "Sistem Multi Cabang", icon: Network },
  { title: "Tracking Transparan", icon: Eye },
  { title: "Operasional Terukur", icon: Building2 },
  { title: "Pembayaran Aman", icon: ShieldCheck },
];

export default function TentangKamiPage() {
  return (
    <PublicShell>
      <main className="bg-background">
        <section className="px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-semibold uppercase text-blue-600">
              Tentang Kami
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-slate-950">
              Platform ekspedisi online untuk perusahaan pengiriman multi cabang.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
              Ekspedisi Online dirancang untuk membuat proses pengiriman lebih
              transparan: customer dapat membuat shipment, cabang memproses
              paket, kurir memperbarui status, dan manager memantau laporan.
            </p>
          </div>
        </section>
        <section className="bg-slate-50 px-4 py-16">
          <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-slate-950">Visi</h2>
                <p className="mt-3 leading-7 text-slate-600">
                  Menjadi sistem ekspedisi online yang membantu pengiriman barang
                  antar cabang berjalan cepat, akurat, dan mudah dipercaya.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-slate-950">Misi</h2>
                <ul className="mt-3 grid gap-3 text-sm leading-6 text-slate-600">
                  {missions.map((mission) => (
                    <li key={mission}>{mission}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
        <section className="px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-slate-950">Keunggulan</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {strengths.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title}>
                    <CardContent className="space-y-4 p-5">
                      <span className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="font-bold text-slate-950">{item.title}</h3>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
