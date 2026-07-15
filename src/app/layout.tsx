import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Memastikan halaman selalu dirender dinamis di server
export const dynamic = "force-dynamic";

// Inisialisasi konfigurasi font dengan penamaan variabel baru
const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"],
  display: "swap",
});

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"],
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

// Pembersihan fallback URL menggunakan operator Nullish Coalescing (??)
const siteUrl = process.env.APP_URL ?? "http://localhost:3000";

// Objek Metadata dengan penambahan sistem Favicon otomatis bawaan Next.js
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Danish Ekspedisi | Cek Resi & Logistik",
    template: "%s | Danish Ekspedisi",
  },
  description: "Sistem Informasi Ekspedisi Online untuk pengiriman barang antar cabang secara cepat dan transparan.",
  keywords: ["ekspedisi online", "sistem informasi ekspedisi", "tracking resi", "pengiriman barang", "logistik"],
  manifest: "/manifest.json",
  
  // FIX DISINI: Mendaftarkan logo.png sebagai favicon resmi aplikasi lu
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  
  openGraph: {
    title: "Danish Ekspedisi",
    description: "Sistem Informasi Ekspedisi Online untuk pengiriman barang antar cabang secara cepat dan transparan.",
    url: "/",
    siteName: "Danish Ekspedisi",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Danish Ekspedisi",
    description: "Sistem Informasi Ekspedisi Online untuk pengiriman barang antar cabang secara cepat dan transparan.",
  },
  appleWebApp: {
    capable: true,
    title: "Danish Ekspedisi",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbbf24", // sinkronisasi warna tema Amber-400
};

// Mengubah tipe properti children ke dalam bentuk Interface eksplisit
interface RootLayoutProps {
  children: React.ReactNode;
}

// Mengubah gaya penulisan komponen menjadi Arrow Function Component
const RootLayout = ({ children }: RootLayoutProps) => {
  // Menggabungkan seluruh CSS Variable font menggunakan metode Array Join
  const coreFontVariables = [
    fontDisplay.variable, 
    fontBody.variable, 
    fontMono.variable
  ].join(" ");

  return (
    <html lang="id" className={coreFontVariables}>
      <head />
      <body className="w-full min-h-screen m-0 p-0 overflow-x-hidden bg-slate-100 text-slate-900 font-mono antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;