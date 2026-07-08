import { PublicFooter } from "@/components/layout/public-footer";
import { PublicNavbar } from "@/components/layout/public-navbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 font-mono text-slate-900 selection:bg-amber-400 selection:text-slate-950">
      {/* 1. Navigasi Komando Utama Publik */}
      <PublicNavbar />
      
      {/* 2. Container Konten Utama Operasional */}
      {/* Diberikan padding-top agar tidak tertutup navbar yang sticky/fixed, dan flex-grow agar footer tetap di bawah */}
      <main className="relative mx-auto min-h-[calc(100vh-14rem)] w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Aksen Garis Desain Kisi Industri Kaku (Opsional - Dekoratif Sisi Kiri Konten) */}
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 hidden w-1 bg-slate-900 md:block" />
        
        {/* Slot Halaman Internal (Landing Page, Cek Resi, Cek Tarif, dll.) */}
        <div className="relative z-10 w-full animate-in fade-in duration-300">
          {children}
        </div>
      </main>

      {/* 3. Manifes Footer Sektor Bawah */}
      <div className="mt-auto border-t-4 border-slate-900 bg-white">
        <PublicFooter />
      </div>
    </div>
  );
}