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
      
      {/* DialogContent - Panel Elegan */}
      <DialogContent className="sm:max-w-md bg-surface border border-border text-ink p-0 rounded-2xl shadow-2xl font-body overflow-hidden">
        
        {/* Pembungkus Konten Utama Dalam */}
        <div className="p-6">
          <DialogHeader className="border-b border-border pb-4">
            
            {/* Penanda Konteks Sistem Keamanan */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                <ShieldAlert size={14} />
              </div>
              <span className="text-xs font-semibold tracking-tight text-muted uppercase">
                PERLU AKSES MASUK
              </span>
            </div>
            
            {/* Judul Modal - Sangat Jelas dan To The Point */}
            <DialogTitle className="text-left text-lg font-semibold tracking-tight text-ink">
              Harus Masuk Akun Terlebih Dahulu
            </DialogTitle>
            
            {/* Deskripsi - Bahasanya dibikin mengalir dan santai */}
            <DialogDescription className="text-left text-sm font-medium leading-relaxed text-muted mt-2 normal-case">
              Fitur lacak paket dan buat pesanan kargo baru hanya bisa diakses kalau kamu sudah terdaftar di sistem. Silakan pilih menu di bawah ini buat melanjutkan.
            </DialogDescription>
          </DialogHeader>

          {/* Blok Tombol Aksi - Gaya Tekan Kotak 3D Kaku */}
          <div className="flex flex-col gap-3 mt-5">
            
            {/* Tombol Utama: Login (Aksen Kuning) */}
            <Button 
              asChild 
              size="lg" 
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm text-sm font-medium rounded-md transition-all cursor-pointer"
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
              className="w-full h-11 bg-surface text-ink border border-border shadow-sm hover:bg-slate-50 text-sm font-medium rounded-md transition-all cursor-pointer"
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