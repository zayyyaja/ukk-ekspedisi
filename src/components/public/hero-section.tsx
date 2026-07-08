"use client";

import { ArrowRight, Search, Ship, Truck, Box } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { AuthModal } from "./auth-modal";

export function HeroSection() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center bg-slate-100 py-16 lg:py-24 font-mono select-none overflow-hidden">
      {/* Pola Garis Grid Latar Belakang Gudang Logistik */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:30px_30px] opacity-70" />

      {/* Main Container dengan Grid 2 Kolom */}
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* KOLOM KIRI: Teks Utama & Tombol Akses (Rata Kiri) */}
          <div className="lg:col-span-7 text-left space-y-6 order-2 lg:order-1">
            
            {/* Tag Pengenal Maskapai */}
            <div className="inline-flex items-center gap-2 border-2 border-slate-900 bg-amber-400 px-3 py-1 text-3xs font-black uppercase tracking-widest text-slate-900 rounded-sm shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
              <span className="h-2 w-2 bg-rose-600 rounded-full animate-pulse" />
              <span>DANISH EKSPEDISI // PORTAL UTAMA</span>
            </div>

            {/* Judul Gede Gahar Maksimal */}
            <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-7xl uppercase">
              KIRIM PAKET <br />
              <span className="bg-slate-900 text-amber-400 px-3 inline-block my-1 shadow-[4px_4px_0px_0px_rgba(244,63,94,1)]">
                TANPA RIBET
              </span>
            </h1>

            {/* Deskripsi Kalimat yang Lebih Sederhana */}
            <p className="max-w-xl text-2xs font-bold uppercase text-slate-500 leading-relaxed pt-2">
              Kirim paket barang ke mana saja jadi lebih mudah. Cek harga ongkir transparan, pantau posisi nomor resi paket, dan buat order pengiriman langsung dari rumah Anda.
            </p>

            {/* Grup Tombol Aksi (Tetap dibungkus AuthModal bawaan lu brayy) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              
              <AuthModal>
                <Button 
                  size="lg" 
                  className="h-12 bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] px-8 text-2xs font-black uppercase tracking-wider rounded-sm transition-all cursor-pointer"
                >
                  <Search className="mr-2 h-4 w-4 stroke-[3] text-slate-950" />
                  Lacak Paket Saya
                </Button>
              </AuthModal>

              <AuthModal>
                <Button 
                  size="lg" 
                  className="h-12 bg-white text-slate-900 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] px-8 text-2xs font-black uppercase tracking-wider rounded-sm transition-all cursor-pointer"
                >
                  Buat Pesanan Baru
                  <ArrowRight className="ml-2 h-4 w-4 stroke-[3]" />
                </Button>
              </AuthModal>

            </div>
          </div>

          {/* KOLOM KANAN: Panel Visual Neo-Brutalist Replika Manifes Kargo */}
          <div className="lg:col-span-5 w-full order-1 lg:order-2">
            <div className="relative border-4 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-sm overflow-hidden">
              
              {/* Garis Hazard Kuning Hitam Atas Kotak */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-[linear-gradient(-45deg,#0f172a_25%,#fbbf24_25%,#fbbf24_50%,#0f172a_50%,#0f172a_75%,#fbbf24_75%,#fbbf24)] bg-[size:16px_16px] border-b-2 border-slate-900" />
              
              {/* Isian Mockup Fitur Mini Dalam Kotak */}
              <div className="space-y-4 mt-3">
                
                {/* Baris Informasi 1 */}
                <div className="border-2 border-slate-900 bg-slate-50 p-3 rounded-sm flex items-center gap-3">
                  <div className="h-9 w-9 bg-rose-400 border-2 border-slate-900 rounded-sm flex items-center justify-center text-slate-900">
                    <Truck size={18} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-3xs font-black uppercase text-slate-400">STATUS PENGIRIMAN</div>
                    <div className="text-2xs font-black uppercase text-slate-900">Kurir Siap Jemput Paket</div>
                  </div>
                </div>

                {/* Baris Informasi 2 */}
                <div className="border-2 border-slate-900 bg-slate-50 p-3 rounded-sm flex items-center gap-3">
                  <div className="h-9 w-9 bg-amber-400 border-2 border-slate-900 rounded-sm flex items-center justify-center text-slate-900">
                    <Box size={18} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-3xs font-black uppercase text-slate-400">LAYANAN TIMBANG</div>
                    <div className="text-2xs font-black uppercase text-slate-900">Tarif Ongkir Pas & Akurat</div>
                  </div>
                </div>

                {/* Simulasi Widget Live Tracking Mini */}
                <div className="border-2 border-slate-900 bg-slate-950 p-4 rounded-sm text-white space-y-2.5">
                  <div className="flex justify-between items-center text-3xs font-black tracking-wider text-amber-400 uppercase">
                    <span>RESI: DNX-99812</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      LIVE_PETA
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full relative overflow-hidden">
                    <div className="absolute left-0 top-0 h-full w-3/4 bg-amber-400" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 leading-normal">
                    Paket kargo Anda berhasil dimuat ke truk dan sedang menuju gudang transit utama.
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}