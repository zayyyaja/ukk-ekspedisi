"use client";

import Link from "next/link";

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/cek-ongkir", label: "Cek ongkir" },
  { href: "/tracking", label: "Lacak resi" },
  { href: "/cabang", label: "Cabang" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-white text-ink font-body select-none">
      
      {/* Kontainer Utama */}
      <div className="mx-auto grid max-w-7xl gap-x-16 gap-y-12 px-6 py-16 sm:grid-cols-3 lg:px-10">
        
        {/* Kolom 1: Profil Ekspedisi */}
        <section className="space-y-4">
          <h2 className="text-[14px] font-medium tracking-tight text-muted">
            Tentang kami
          </h2>
          <p className="text-[15px] font-normal text-muted leading-[1.8]">
            <span className="font-semibold text-ink">DRG-EKSPEDISI</span> adalah aplikasi penyedia jasa pengiriman paket logistik. Kami siap membantu mengirimkan barang Anda dengan aman, cek ongkir murah, serta pelacakan resi yang akurat.
          </p>
        </section>

        {/* Kolom 2: Layanan Utama (Gabungan Navigasi & Layanan) */}
        <section className="space-y-4">
          <h2 className="text-[14px] font-medium tracking-tight text-muted">
            Layanan utama
          </h2>
          <nav className="flex flex-col gap-y-3">
            {navItems.map((item) => (
              <Link 
                className="text-[15px] font-normal text-muted hover:text-[#0C447C] transition-colors w-fit" 
                href={item.href} 
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </section>

        {/* Kolom 3: Hubungi Kantor Hub */}
        <section className="space-y-4">
          <h2 className="text-[14px] font-medium tracking-tight text-muted">
            Kontak kantor
          </h2>
          <ul className="flex flex-col gap-y-4 text-[15px] font-normal text-muted">
            <li className="flex flex-col">
              <span className="text-ink text-[14px] font-medium">Email</span>
              <span className="mt-0.5 break-all">support@drgekspedisi.com</span>
            </li>
            <li className="flex flex-col">
              <span className="text-ink text-[14px] font-medium">Telepon</span>
              <span className="mt-0.5">021-555-0199</span>
            </li>
            <li className="flex flex-col">
              <span className="text-ink text-[14px] font-medium">Alamat kantor</span>
              <span className="mt-0.5 leading-[1.8]">Jl. Logistik Raya No. 10, Hub Utara, Jakarta</span>
            </li>
          </ul>
        </section>

      </div>

      {/* Baris Hak Cipta Terbawah */}
      <div className="border-t border-border/50 bg-transparent px-4 py-6 text-center sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row text-[13px] font-normal text-muted">
          <p>© 2026 DRG-EKSPEDISI. Hak cipta dilindungi undang-undang.</p>
          <p className="opacity-70">
            Versi aplikasi 2.0.4
          </p>
        </div>
      </div>
    </footer>
  );
}