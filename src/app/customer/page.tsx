"use client";

import { ArrowRight, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CustomerNavbarShell } from "@/components/customer/customer-navbar-shell";
import { RateSection } from "@/components/public/rate-section";
import { CustomerTracker } from "@/components/customer/customer-tracker";
import { CtaSection } from "@/components/public/cta-section";
import { PublicFooter } from "@/components/layout/public-footer";
import { getCurrentUser } from "@/lib/auth-client";

export default function CustomerHomePage() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((res) => {
        if (mounted) setUser(res.data as Record<string, unknown>);
      })
      .catch(() => null);
    return () => {
      mounted = false;
    };
  }, []);

  const customerName = user?.name ? String(user.name) : (user?.email ? String(user.email).split("@")[0] : "Customer");

  return (
    <CustomerNavbarShell fullWidth>
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden w-full flex items-center justify-start bg-black min-h-[calc(100vh-64px)]">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/images/BG.png"
            alt="Shipping port with containers"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        </div>

        {/* Kontainer Utama Content */}
        <div className="relative mx-auto w-full max-w-7xl px-6 py-20 lg:px-10 flex items-center z-10">
          <div className="max-w-3xl w-full text-left">
            <h1 className="font-space text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Hi, <span className="text-orange-500 capitalize">{customerName}</span>
              <br />
              <span className="text-white mt-2 block text-3xl sm:text-4xl lg:text-5xl">
                Siap mengirim paket hari ini?
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/100 sm:text-lg">
              Solusi logistik terpadu untuk pengiriman kargo internasional.
              Kelola pengiriman, lacak paket, dan bayar secara online dalam satu platform.
            </p>

            {/* Sesi Tombol Aksi */}
            <div className="mt-10 flex flex-col items-stretch justify-start gap-4 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="bg-orange-500 text-white hover:bg-orange-600 px-8 font-medium shadow-lg shadow-orange-500/20">
                <Link href="/customer/lacak-paket">
                  <Search className="mr-2 h-4 w-4 text-white" />
                  Cari Paket
                </Link>
              </Button>

              <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100 px-8 font-medium shadow-md">
                <Link href="/customer/buat-pesanan">
                  Kirim Paket
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. RATE CHECKER */}
      <RateSection />

      {/* 3. PACKAGE TRACKER LIST */}
      <CustomerTracker />

      {/* 4. CTA SECTION */}
      <CtaSection
        primaryLink="/customer/buat-pesanan"
        primaryText="Buat Pesanan Sekarang"
        secondaryLink="/customer/lacak-paket"
        secondaryText="Cari Paket"
      />

      {/* 5. FOOTER */}
      <PublicFooter />
    </CustomerNavbarShell>
  );
}
