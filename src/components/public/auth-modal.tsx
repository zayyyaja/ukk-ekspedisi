"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AuthModal({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      {/* DialogContent - Panel Kotak Kokoh Bergaris Tebal Neo-Brutalist */}
      <DialogContent className="sm:max-w-md bg-white border-4 border-slate-900 text-slate-900 p-0 rounded-sm shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] font-mono overflow-hidden">
        
        {/* Strip Atas Corak Hazard Kuning Hitam Khas Sektor Kargo */}
        <div className="h-3 w-full bg-[linear-gradient(-45deg,#0f172a_25%,#fbbf24_25%,#fbbf24_50%,#0f172a_50%,#0f172a_75%,#fbbf24_75%,#fbbf24)] bg-[size:16px_16px] border-b-2 border-slate-900" />
        
        {/* Pembungkus Konten Utama Dalam */}
        <div className="p-6">
          <DialogHeader className="border-b-2 border-slate-100 pb-4">
            
            {/* Penanda Konteks Sistem Keamanan */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-5 bg-rose-500 border-2 border-slate-900 rounded-sm flex items-center justify-center text-white">
                <ShieldAlert size={12} className="stroke-[3]" />
              </div>
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                // PERLU AKSES MASUK
              </span>
            </div>
            
            {/* Judul Modal - Sangat Jelas dan To The Point */}
            <DialogTitle className="text-left text-lg font-black uppercase tracking-tight text-slate-900">
              Harus Masuk Akun Dulu, Bro!
            </DialogTitle>
            
            {/* Deskripsi - Bahasanya dibikin mengalir dan santai */}
            <DialogDescription className="text-left text-2xs font-bold uppercase leading-relaxed text-slate-500 mt-2 normal-case">
              Fitur lacak paket dan buat pesanan kargo baru hanya bisa diakses kalau kamu sudah terdaftar di sistem. Silakan pilih menu di bawah ini buat melanjutkan.
            </DialogDescription>
          </DialogHeader>

          {/* Blok Tombol Aksi - Gaya Tekan Kotak 3D Kaku */}
          <div className="flex flex-col gap-3 mt-5">
            
            {/* Tombol Utama: Login (Aksen Kuning) */}
            <Button 
              asChild 
              size="lg" 
              className="w-full h-11 border-2 border-slate-900 bg-amber-400 text-slate-950 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] text-2xs font-black uppercase tracking-wider transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] rounded-sm cursor-pointer"
            >
              <Link href="/customer/login">
                Saya Sudah Punya Akun (Login)
              </Link>
            </Button>
            
            {/* Tombol Kedua: Daftar Baru (Aksen Putih Bersih) */}
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="w-full h-11 border-2 border-slate-900 bg-white text-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] text-2xs font-black uppercase tracking-wider transition-all hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] rounded-sm cursor-pointer hover:bg-slate-50 hover:text-slate-900"
            >
              <Link href="/customer/register">
                Saya Belum Punya Akun (Daftar)
              </Link>
            </Button>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}