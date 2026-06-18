import {
  BarChart3,
  Building2,
  CreditCard,
  Eye,
  Radar,
  Truck,
} from "lucide-react";

const benefits = [
  { title: "Multi Cabang", icon: Building2 },
  { title: "Tracking Transparan", icon: Eye },
  { title: "Pembayaran Aman", icon: CreditCard },
  { title: "Pickup Kurir", icon: Truck },
  { title: "Monitoring Realtime", icon: Radar },
  { title: "Laporan Digital", icon: BarChart3 },
];

export function BenefitsSection() {
  return (
    <section className="bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase text-blue-600">
            Keunggulan
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            Dirancang untuk operasional ekspedisi modern.
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-5 shadow-sm"
                key={benefit.title}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-bold text-slate-950">{benefit.title}</h3>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
