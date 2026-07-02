import type { Metadata, Viewport } from "next";
import { Montserrat, Roboto } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

export const dynamic = "force-dynamic";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

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
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${montserrat.variable} ${roboto.variable}`} lang="id">
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
