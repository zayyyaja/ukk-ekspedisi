"use client";

import { ArrowRight, PackageSearch, Calculator, Inbox, Package, Clock, CreditCard, ExternalLink, ShieldCheck, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CustomerTracker } from "@/components/customer/customer-tracker";
import { BentoHeader } from "@/components/customer/bento-header";
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
    <div className="w-full font-body">
      {/* TRUE ENTERPRISE BENTO WORKSPACE */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 pb-12">

        {/* ROW 1: EMBEDDED BENTO HEADER (Col 1-12) */}
        <BentoHeader />

        {/* ROW 2: PRIMARY WORKFLOW BALANCE */}

        {/* 2A: COMPACT SAAS HERO (Col 1-8) */}
        <Card className="md:col-span-4 lg:col-span-8 bg-surface border border-border/40 shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[180px]">
          {/* Subtle Accent Glow */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

          <CardContent className="p-6 md:p-8 relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-ink">
                Good morning, <span className="capitalize">{customerName}</span>
              </h1>
              <p className="mt-1 text-sm text-muted max-w-md leading-relaxed">
                You have <strong className="text-ink">1 active shipment</strong> out for delivery.
                Ready to send something new today?
              </p>
            </div>
            <div className="shrink-0">
              <Button asChild className="w-full sm:w-auto rounded-xl shadow-sm px-6 h-11">
                <Link href="/customer/buat-pesanan">
                  <PackageSearch className="mr-2 h-4 w-4" />
                  Buat pengiriman
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 2B: ACCOUNT STATUS / RESIDUAL WIDGET (Col 9-12) */}
        <Card className="md:col-span-4 lg:col-span-4 bg-surface border border-border/40 shadow-sm flex flex-col">
          <CardHeader className="p-5 pb-0">
            <CardTitle className="text-[11px] text-muted uppercase tracking-wider font-semibold">Ringkasan akun</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-4 flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger/10 text-danger shrink-0">
                <CreditCard size={20} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xl font-medium tracking-tight text-ink">Rp 45.000</p>
                <p className="text-[11px] text-muted font-medium mt-0.5">1 Invoice belum dibayar</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full mt-5 rounded-lg border-border/60 hover:bg-slate-50 transition-colors h-9 text-xs">
              <Link href="/customer/pembayaran">Bayar sekarang</Link>
            </Button>
          </CardContent>
        </Card>

        {/* ROW 3: HIGH-DENSITY OPERATIONS */}

        {/* 3A: ACTIVE SHIPMENTS & TRACKING (Col 1-8) */}
        <Card className="md:col-span-4 lg:col-span-8 bg-surface border border-border/40 shadow-sm flex flex-col min-h-[300px]">
          <CardHeader className="p-5 border-b border-border/40 bg-slate-50/50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-ink flex items-center gap-2">
                <Clock size={16} className="text-primary" /> Pengiriman aktif
              </CardTitle>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/5 rounded-lg -mr-2">
              <Link href="/customer/lacak-resi">
                Lihat semua <ArrowRight size={14} className="ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-5 flex-1 bg-background/30">
            {/* Highly compressed CustomerTracker component injected here */}
            <CustomerTracker />
          </CardContent>
        </Card>

        {/* 3B: CONTEXTUAL WIDGETS COLUMN (Col 9-12) */}
        <div className="md:col-span-4 lg:col-span-4 flex flex-col gap-6">

          {/* Quick Actions (Compact List) */}
          <Card className="bg-surface border border-border/40 shadow-sm">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-[11px] text-muted uppercase tracking-wider font-semibold">Aksi cepat</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 flex flex-col gap-1">
              <Link href="/rates" className="group flex items-center justify-between p-2 rounded-lg hover:bg-background transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-info/10 text-info">
                    <Calculator size={16} />
                  </div>
                  <span className="text-sm font-medium text-ink">Cek tarif</span>
                </div>
                <ArrowRight size={14} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <Link href="/customer/inbox" className="group flex items-center justify-between p-2 rounded-lg hover:bg-background transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-warning/10 text-warning">
                    <Inbox size={16} />
                  </div>
                  <span className="text-sm font-medium text-ink">Inbox</span>
                </div>
                <ArrowRight size={14} className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </CardContent>
          </Card>

          {/* Shipping Tips / Support Shortcut */}
          <Card className="bg-primary/5 border border-primary/20 shadow-sm flex-1 flex flex-col justify-center p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="text-primary shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-semibold text-ink">Butuh bantuan?</h4>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Tim dukungan kami tersedia 24/7 untuk membantu kebutuhan logistik Anda.
                </p>
                <Button variant="ghost" className="px-0 h-auto text-primary text-xs font-semibold mt-2 hover:bg-transparent hover:no-underline">
                  Hubungi dukungan <ArrowRight size={12} className="ml-1" />
                </Button>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
