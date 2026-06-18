import type { Metadata, Viewport } from "next";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: {
    default: "Ekspedisi Online",
    template: "%s | Ekspedisi Online",
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
    title: "Ekspedisi Online",
    description:
      "Sistem Informasi Ekspedisi Online untuk pengiriman barang antar cabang secara cepat dan transparan.",
    url: "/",
    siteName: "Ekspedisi Online",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Ekspedisi Online",
    description:
      "Sistem Informasi Ekspedisi Online untuk pengiriman barang antar cabang secara cepat dan transparan.",
  },
  appleWebApp: {
    capable: true,
    title: "Ekspedisi",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#12352b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link href="/manifest.json" rel="manifest" />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
