import { CreditCard, MapPinned, Radar, Truck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    title: "Drop Off",
    description:
      "Customer datang ke cabang terdekat dan menyerahkan paket secara langsung.",
    icon: MapPinned,
  },
  {
    title: "Pickup",
    description:
      "Kurir mengambil paket ke alamat customer setelah pembayaran berhasil.",
    icon: Truck,
  },
  {
    title: "Pembayaran Online",
    description:
      "Mendukung pembayaran QRIS, E-Wallet, dan Virtual Account melalui Midtrans.",
    icon: CreditCard,
  },
  {
    title: "Tracking Realtime",
    description:
      "Pantau perjalanan paket mulai dari cabang asal hingga diterima penerima.",
    icon: Radar,
  },
];

export function ServicesSection() {
  return (
    <section className="bg-background px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase text-blue-600">Layanan Kami</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            Satu sistem untuk semua kebutuhan pengiriman.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.title}>
                <CardContent className="space-y-4 p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-950">{service.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {service.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
