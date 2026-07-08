"use client";

import { ArrowRight, KeyRound, UserPlus, Radio } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface CtaSectionProps {
  primaryLink?: string;
  primaryText?: string;
  secondaryLink?: string;
  secondaryText?: string;
}

export function CtaSection({
  primaryLink = "/customer/register",
  primaryText = "REGISTRASI CUSTOMER",
  secondaryLink = "/customer/login",
  secondaryText = "AKSES PORTAL UTAMA",
}: CtaSectionProps) {
  return (
    <section className="relative bg-slate-50 py-20 font-mono select-none overflow-hidden">
      {/* Garis Grid Latar Belakang Desain Industri */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:30px_30px] opacity-60" />

      <div className="relative mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Kontainer Utama Kotak Pejal Neo-Brutalist */}
        <div className="relative bg-white border-4 border-slate-900 p-8 sm:p-12 text-center shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-sm overflow-hidden">
          
          {/* Top Decorative Hazard Bar (Barikade Kargo Atas) */}
          <div className="absolute top-0 left-0 right-0 h-3 bg-[linear-gradient(-45deg,#0f172a_25%,#fbbf24_25%,#fbbf24_50%,#0f172a_50%,#0f172a_75%,#fbbf24_75%,#fbbf24)] bg-[size:15px_15px] border-b-2 border-slate-900" />
          
          {/* Header Text - Taktis & Padat */}
          <div className="max-w-2xl mx-auto mt-2">
            <div className="inline-flex items-center gap-2 bg-slate-950 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-400 rounded-xs">
              <Radio size={10} className="animate-pulse text-rose-500" />
              <span>TERMINAL_AKHIR // INTERKONEKSI PORTAL</span>
            </div>

            <h2 className="mt-5 text-2xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl uppercase tracking-tight">
              Inisiasi Manifes Baru & Distribusi Kargo
            </h2>

            <p className="mt-4 max-w-lg mx-auto text-2xs font-bold uppercase tracking-wide text-slate-400 leading-relaxed">
              Buka jalur pengiriman, pantau pergerakan armada secara presisi, dan akses kalkulasi tarif kargo domestik real-time dalam satu integrasi komando.
            </p>
          </div>

          {/* Tombol Aksi Taktis Gahar */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {/* Tombol Utama: Registrasi Kustomer (Amber) */}
            <Button
              asChild
              size="lg"
              className="
                w-full sm:w-auto h-12 bg-amber-400 text-slate-950 border-2 border-slate-900 
                shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all rounded-sm text-2xs font-black 
                uppercase tracking-wider px-8 cursor-pointer
                hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] 
                active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]
              "
            >
              <Link href={primaryLink}>
                <UserPlus className="mr-2 h-4 w-4 stroke-[2.5]" />
                {primaryText}
                <ArrowRight className="ml-2 h-3.5 w-3.5 stroke-[3]" />
              </Link>
            </Button>

            {/* Tombol Sekunder: Masuk Portal (Putih Semen) */}
            <Button
              asChild
              size="lg"
              className="
                w-full sm:w-auto h-12 bg-slate-100 text-slate-900 border-2 border-slate-900 
                shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all rounded-sm text-2xs font-black 
                uppercase tracking-wider px-8 cursor-pointer
                hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] 
                active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]
              "
            >
              <Link href={secondaryLink}>
                <KeyRound className="mr-2 h-4 w-4 stroke-[2.5]" />
                {secondaryText}
              </Link>
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}