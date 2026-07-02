import Link from "next/link";

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/tracking", label: "Tracking" },
  { href: "/cek-ongkir", label: "Cek Ongkir" },
  { href: "/cabang", label: "Cabang" },
  { href: "/tentang-kami", label: "Tentang Kami" },
  { href: "/kontak", label: "Kontak" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <section className="space-y-3">
          <h2 className="font-bold text-white">Perusahaan</h2>
          <p className="text-sm leading-6 text-slate-400">
            Ekspedisi Online membantu pengiriman antar cabang dengan proses
            drop off, tracking, dan pembayaran online yang transparan.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="font-bold text-white">Navigasi</h2>
          <nav className="grid gap-2 text-sm text-slate-400">
            {navItems.map((item) => (
              <Link className="hover:text-white" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </section>
        <section className="space-y-3">
          <h2 className="font-bold text-white">Layanan</h2>
          <ul className="grid gap-2 text-sm text-slate-400">
            <li>Drop Off</li>
            <li>Tracking</li>
            <li>Pembayaran Online</li>
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="font-bold text-white">Kontak</h2>
          <ul className="grid gap-2 text-sm text-slate-400">
            <li>Email: support@ekspedisi-online.test</li>
            <li>Telepon: 021-555-0199</li>
            <li>Alamat: Jl. Logistik Raya No. 10, Jakarta</li>
          </ul>
        </section>
      </div>
      <div className="border-t border-slate-800 px-4 py-5 text-center text-xs text-slate-500">
        Ekspedisi Online. Sistem Informasi Ekspedisi Online.
      </div>
    </footer>
  );
}
