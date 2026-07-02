import { ArrowRight, Search } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { AuthModal } from "./auth-modal";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen w-full flex items-center justify-start bg-black">
      {/* Background Image & Overlay menembus hingga ke tepi atas penuh */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/BG.png"
          alt="Shipping port with containers"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Overlay Gradien Hitam sesuai gambar: Lembut di kiri, memudar transparan ke kanan */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      </div>

      {/* Kontainer Utama Content */}
      <div className="relative mx-auto w-full max-w-7xl px-6 pt-24 pb-20 lg:px-10 flex items-center z-10">
        {/* Penempatan Teks Tetap di Sisi Kiri */}
        <div className="max-w-3xl w-full text-left">
          <h1 className="font-space text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Kirim paket anda
            <br />
            <span className="relative inline-flex items-center gap-3 text-orange-500 mt-1">
              Gunakan Anterin
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/100 sm:text-lg">
            Solusi logistik terpadu untuk pengiriman kargo internasional.
            Kelola pengiriman, lacak paket, dan bayar secara online dalam satu platform.
          </p>

          {/* Sesi Tombol Aksi */}
          <div className="mt-10 flex flex-col items-stretch justify-start gap-4 sm:flex-row sm:items-center">
            {/* Tombol Utama: Cari Paket (Oranye) */}
            <AuthModal>
              <Button size="lg" className="bg-orange-500 text-white hover:bg-orange-600 px-8 font-medium shadow-lg shadow-orange-500/20">
                <Search className="mr-2 h-4 w-4 text-white" />
                Cari Paket
              </Button>
            </AuthModal>

            {/* Tombol Kedua: Kirim Paket (Putih Solid) */}
            <AuthModal>
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 px-8 font-medium shadow-md">
                Kirim Paket
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </AuthModal>
          </div>
        </div>
      </div>
    </section>
  );
}