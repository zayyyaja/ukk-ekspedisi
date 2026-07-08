import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

export const dynamic = "force-dynamic";

// Memasang Font Baru Sesuai Aturan Sistem Cargo Manifest
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: {
    default: "Danish Ekspedisi | Cek Resi & Logistik",
    template: "%s | Danish Ekspedisi",
  },
  description:
    "Sistem Informasi Ekspedisi Online untuk pengiriman barang antar cabang secara cepat dan transparan.",
  keywords: [
    "ekspedisi online",
    "sistem informasi ekspedisi",
    "tracking resi",
    "pengiriman barang",
    "logistik",
  ],
  manifest: "/manifest.json",
  openGraph: {
    title: "Danish Ekspedisi",
    description:
      "Sistem Informasi Ekspedisi Online untuk pengiriman barang antar cabang secara cepat dan transparan.",
    url: "/",
    siteName: "Danish Ekspedisi",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Danish Ekspedisi",
    description:
      "Sistem Informasi Ekspedisi Online untuk pengiriman barang antar cabang secara cepat dan transparan.",
  },
  appleWebApp: {
    capable: true,
    title: "Danish Ekspedisi",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbbf24", // disesuaikan ke amber-400 biar sinkron
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`} lang="id">
      <head>
        <link href="/manifest.json" rel="manifest" />
      </head>
      {/* DI SINI PERUBAHAN UTAMANYA: Bersihkan class gaib, buat width full h-full */}
      <body className="w-full min-h-screen bg-slate-100 text-slate-900 font-mono antialiased m-0 p-0 overflow-x-hidden">
        {children}
        <Toaster />
      </body>
    </html>
  );
}