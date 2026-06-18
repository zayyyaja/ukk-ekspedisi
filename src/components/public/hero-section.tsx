import { ArrowRight, MapPin, PackageCheck, Timer } from "lucide-react";
import Link from "next/link";

import { TrackingQuickForm } from "@/components/public/tracking-quick-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HeroSection() {
  return (
    <section className="overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eff6ff_100%)]">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="space-y-8">
          <div className="space-y-5">
            <Badge variant="info">Pickup, drop off, tracking, dan pembayaran online</Badge>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
              Kirim Paket Lebih Mudah, Cepat, dan Transparan
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Sistem ekspedisi online untuk mengelola pengiriman, pembayaran,
              dan tracking paket antar cabang secara realtime.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/customer/register">
                Kirim Paket Sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/tracking">Lacak Paket</Link>
            </Button>
          </div>
          <TrackingQuickForm />
        </div>

        <div className="relative">
          <div className="absolute -left-5 top-10 hidden h-24 w-24 rounded-lg border border-blue-200 bg-blue-50 lg:block" />
          <Card className="relative overflow-hidden border-slate-200 shadow-2xl">
            <CardHeader className="bg-slate-950 text-white">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">Preview Shipment</CardTitle>
                <Badge variant="info">In Transit</Badge>
              </div>
              <p className="font-mono text-2xl font-bold tracking-normal">
                EXP-20260001
              </p>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-4 w-4" />
                    Cabang Asal
                  </div>
                  <strong className="mt-2 block text-slate-950">Depok</strong>
                </div>
                <div className="rounded-md bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <PackageCheck className="h-4 w-4" />
                    Cabang Tujuan
                  </div>
                  <strong className="mt-2 block text-slate-950">Bogor</strong>
                </div>
              </div>
              <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                  <Timer className="h-4 w-4" />
                  Estimasi tiba 1 hari
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-100">
                  <div className="h-full w-2/3 rounded-full bg-blue-600" />
                </div>
                <div className="mt-3 flex justify-between text-xs font-medium text-blue-700">
                  <span>Pending</span>
                  <span>In Transit</span>
                  <span>Delivered</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
