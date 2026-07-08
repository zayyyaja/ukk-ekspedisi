"use client";

import { PublicFooter } from "@/components/layout/public-footer";
import { PublicNavbar } from "@/components/layout/public-navbar";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    // Mengubah bg-paper & text-ink menjadi warna standar yang bersih dan anti-error
    <div className="min-h-screen bg-slate-100 text-slate-900 font-mono antialiased">
      <PublicNavbar />
      
      {/* Konten halaman utama (seperti Hero Section dll) */}
      <main className="w-full">
        {children}
      </main>
      
      <PublicFooter />
    </div>
  );
}