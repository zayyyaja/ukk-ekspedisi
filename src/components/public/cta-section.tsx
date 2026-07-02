import { ArrowRight } from "lucide-react";
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
  primaryText = "Daftar Sekarang",
  secondaryLink = "/customer/login",
  secondaryText = "Login",
}: CtaSectionProps) {
  return (
    <section className="relative bg-background py-24">
      <div className="relative mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-slate-950 shadow-xl">
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src="/images/BG.png"
              alt="CTA Background"
              className="h-full w-full object-cover object-center opacity-60"
            />

            <div className="absolute inset-0 bg-black/60" />
          </div>

          {/* Content */}
          <div className="relative z-10 grid min-h-[380px] items-center gap-12 px-8 py-12 sm:px-12 lg:grid-cols-2 lg:px-16">
            {/* Left */}
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
                Mulai Pengiriman
              </p>

              <h2 className="mt-4 font-space text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Siap Mengirim Paket
                <br />
                Bersama Anterin?
              </h2>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-orange-500 px-8 text-white hover:bg-orange-600"
                >
                  <Link href={primaryLink}>
                    {primaryText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white bg-white/10 px-8 text-white backdrop-blur-sm hover:bg-white hover:text-slate-950"
                >
                  <Link href={secondaryLink}>
                    {secondaryText}
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right - Negative Space */}
            <div />
          </div>
        </div>
      </div>
    </section>
  );
}