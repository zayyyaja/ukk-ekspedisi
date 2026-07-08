"use client";

import Link from "next/link";

const navItems = [
  { href: "/", label: "BERANDA" },
  { href: "/tracking", label: "TRACKING" },
  { href: "/cek-ongkir", label: "CEK ONGKIR" },
  { href: "/cabang", label: "CABANG" },
  { href: "/tentang-kami", label: "TENTANG KAMI" },
  { href: "/kontak", label: "KONTAK" },
];

export function PublicFooter() {
  return (
    <footer className="border-t-4 border-slate-900 bg-white text-slate-900 font-mono select-none">
      
      {/* Kontainer Utama dengan gap-x-16 (Horizontal) dan gap-y-10 (Vertikal) */}
      <div className="mx-auto grid max-w-7xl gap-x-16 gap-y-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        
        {/* Kolom 1: Profil Ekspedisi */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-3 border-2 border-slate-900 bg-amber-400 rounded-sm shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]" />
            <h2 className="text-2xs font-black uppercase tracking-wider text-slate-900">
              Tentang Kami
            </h2>
          </div>
          <p className="text-3xs font-bold uppercase text-slate-500 leading-relaxed">
            <span className="font-black text-slate-900">Danish Ekspedisi</span> adalah aplikasi penyedia jasa pengiriman paket logistik. Kami siap membantu mengirimkan barang Anda dengan aman, cek ongkir murah, serta pelacakan resi yang akurat.
          </p>
        </section>

        {/* Kolom 2: Navigasi Menu Utama */}
        <section className="space-y-3">
          <h2 className="text-2xs font-black uppercase tracking-wider text-slate-900 pl-2 border-l-4 border-amber-400">
            Menu Navigasi
          </h2>
          <nav className="grid grid-cols-2 gap-2 text-3xs font-black tracking-wide">
            {navItems.map((item) => (
              <Link 
                className="text-slate-500 hover:text-slate-900 transition-colors w-fit uppercase" 
                href={item.href} 
                key={item.href}
              >
                // {item.label}
              </Link>
            ))}
          </nav>
        </section>

        {/* Kolom 3: Jenis Layanan Pengiriman */}
        <section className="space-y-3">
          <h2 className="text-2xs font-black uppercase tracking-wider text-slate-900 pl-2 border-l-4 border-amber-400">
            Layanan Utama
          </h2>
          <ul className="grid gap-2 text-3xs font-black tracking-wide text-slate-500 uppercase">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
              Kirim Barang Domestik
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
              Cek Resi Real-Time
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
              Hitung Ongkir Akurat
            </li>
          </ul>
        </section>

        {/* Kolom 4: Hubungi Kantor Hub */}
        <section className="space-y-3">
          <h2 className="text-2xs font-black uppercase tracking-wider text-slate-900 pl-2 border-l-4 border-amber-400">
            Kontak Kantor
          </h2>
          <ul className="grid gap-2 text-3xs font-bold text-slate-500 uppercase">
            <li className="flex flex-col">
              <span className="font-black text-slate-900">Email Hubungan</span>
              <span className="normal-case font-black text-slate-600 mt-0.5 break-all">support@danishekspedisi.com</span>
            </li>
            <li className="flex flex-col">
              <span className="font-black text-slate-900">Nomor Telepon</span>
              <span className="font-black text-slate-600 mt-0.5">021-555-0199</span>
            </li>
            <li className="flex flex-col">
              <span className="font-black text-slate-900">Alamat Pusat</span>
              <span className="font-black text-slate-600 mt-0.5 normal-case leading-normal">Jl. Logistik Raya No. 10, Hub Utara, Jakarta</span>
            </li>
          </ul>
        </section>

      </div>

      {/* Baris Hak Cipta Terbawah */}
      <div className="border-t-2 border-slate-200 bg-slate-50 px-4 py-4 text-center sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row text-3xs font-black text-slate-400 uppercase tracking-wider">
          <p>© 2026 Danish Ekspedisi. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="bg-slate-900 text-amber-400 px-2 py-0.5 rounded-sm text-[10px] font-black shadow-[2px_2px_0px_0px_rgba(244,63,94,1)]">
            APLIKASI LOGISTIK v2.0.4
          </p>
        </div>
      </div>
    </footer>
  );
}