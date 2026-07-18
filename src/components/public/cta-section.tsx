"use client";

import { ArrowRight, KeyRound, UserPlus, Radio, ArrowUpRight } from "lucide-react";
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
  primaryText = "Buat Akun",
  secondaryLink = "/customer/login",
  secondaryText = "Masuk Portal",
}: CtaSectionProps) {
  return (
    <section className="relative bg-[#0C447C] py-32 font-body select-none overflow-hidden">
      
      {/* Background Soft Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-white/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="page-container relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-tight text-white/90 rounded-full backdrop-blur-md">
            <Radio size={14} className="animate-pulse" />
            <span>Portal Klien Terpadu</span>
          </div>

          <h2 className="text-4xl font-semibold leading-[1.1] text-white sm:text-5xl lg:text-6xl tracking-tight">
            Siap mengoptimalkan <br /> logistik Anda?
          </h2>

          <p className="max-w-xl mx-auto text-lg text-white/80 leading-relaxed">
            Bergabunglah dengan ribuan bisnis yang telah mempercayakan manajemen rantai pasok dan pengiriman kargo domestik mereka bersama kami.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto h-12 shadow-[0_8px_30px_rgb(0,0,0,0.2)] px-8 bg-white text-[#0C447C] hover:bg-white/90"
            >
              <Link href={primaryLink}>
                <UserPlus className="mr-2 h-4 w-4" />
                {primaryText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur-md px-8"
            >
              <Link href={secondaryLink}>
                <KeyRound className="mr-2 h-4 w-4" />
                {secondaryText}
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}