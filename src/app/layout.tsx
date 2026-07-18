import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/config/env";
import "./globals.css";

// Memastikan halaman selalu dirender dinamis di server
export const dynamic = "force-dynamic";

// Inisialisasi konfigurasi font dengan penamaan variabel baru
const fontDisplay = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  display: "swap",
});

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

// Pembersihan fallback URL menggunakan operator Nullish Coalescing (??)
const siteUrl = env.APP_URL;

// Objek Metadata dengan penambahan sistem Favicon otomatis bawaan Next.js
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DRG-EKSPEDISI | Cek Resi & Logistik",
    template: "%s | DRG-EKSPEDISI",
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
    title: "DRG-EKSPEDISI",
    description: "Sistem Informasi Ekspedisi Online untuk pengiriman barang antar cabang secara cepat dan transparan.",
    url: "/",
    siteName: "DRG-EKSPEDISI",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "DRG-EKSPEDISI",
    description: "Sistem Informasi Ekspedisi Online untuk pengiriman barang antar cabang secara cepat dan transparan.",
  },
  appleWebApp: {
    capable: true,
    title: "DRG-EKSPEDISI",
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

import { PwaProvider } from "@/components/pwa-provider";

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
      <body suppressHydrationWarning className="w-full min-h-screen m-0 p-0 overflow-x-hidden antialiased">
        <PwaProvider />
        {children}
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;