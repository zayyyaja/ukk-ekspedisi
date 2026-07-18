import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { PublicShell } from "@/components/public/public-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "Kontak - Ekspedisi Online",
  description: "Hubungi Ekspedisi Online untuk informasi pengiriman dan cabang.",
};

const contacts = [
  { label: "Email", value: "support@ekspedisi-online.test", icon: Mail },
  { label: "Nomor Telepon", value: "021-555-0199", icon: Phone },
  { label: "Alamat", value: "Jl. Logistik Raya No. 10, Jakarta", icon: MapPin },
  { label: "Jam Operasional", value: "Senin - Sabtu, 08.00 - 17.00", icon: Clock },
];

export default function KontakPage() {
  return (
    <PublicShell>
      <main className="bg-background px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <section>
            <p className="text-sm font-semibold uppercase text-primary">Kontak</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950">
              Ada pertanyaan tentang pengiriman?
            </h1>
            <p className="mt-4 leading-7 text-slate-600">
              Tim kami siap membantu informasi cabang, estimasi ongkir, dan
              status pengiriman. Form ini hanya tampilan UI untuk FE-2.
            </p>
            <div className="mt-8 grid gap-3">
              {contacts.map((contact) => {
                const Icon = contact.icon;
                return (
                  <Card key={contact.label}>
                    <CardContent className="flex gap-4 p-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {contact.label}
                        </p>
                        <p className="text-sm text-slate-600">{contact.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
          <Card>
            <CardContent className="space-y-4 p-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">Kirim Pesan</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Isi data berikut untuk kebutuhan tampilan kontak publik.
                </p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold" htmlFor="name">
                  Nama
                </label>
                <Input id="name" placeholder="Nama lengkap" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold" htmlFor="email">
                  Email
                </label>
                <Input id="email" placeholder="nama@email.com" type="email" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold" htmlFor="message">
                  Pesan
                </label>
                <Textarea id="message" placeholder="Tulis pesan Anda" />
              </div>
              <Button className="w-full" type="button">
                Kirim Pesan
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </PublicShell>
  );
}
