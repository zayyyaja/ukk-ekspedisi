"use client";

import { PublicFooter } from "@/components/layout/public-footer";
import { PublicNavbar } from "@/components/layout/public-navbar";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-ink font-body antialiased selection:bg-primary/20">
      <PublicNavbar />
      
      {/* Konten halaman utama (seperti Hero Section dll) */}
      <main className="w-full">
        {children}
      </main>
      
      <PublicFooter />
    </div>
  );
}