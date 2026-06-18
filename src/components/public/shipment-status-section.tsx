import { StatusBadge } from "@/components/shared/status-badge";

const statuses = [
  {
    status: "pending",
    title: "Pending",
    description: "Shipment baru dibuat dan menunggu proses awal.",
  },
  {
    status: "picked_up",
    title: "Picked Up",
    description: "Paket sudah diambil kurir dari alamat customer.",
  },
  {
    status: "in_transit",
    title: "In Transit",
    description: "Paket sedang dalam perjalanan antar cabang.",
  },
  {
    status: "arrived_at_branch",
    title: "Arrived At Branch",
    description: "Paket tiba di cabang tujuan dan siap diproses.",
  },
  {
    status: "out_for_delivery",
    title: "Out For Delivery",
    description: "Kurir sedang mengantar paket ke penerima.",
  },
  {
    status: "delivered",
    title: "Delivered",
    description: "Paket sudah diterima oleh penerima.",
  },
];

export function ShipmentStatusSection() {
  return (
    <section className="bg-background px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase text-blue-600">
            Status Pengiriman
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            Bahasa status yang sama untuk customer, kurir, dan cabang.
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {statuses.map((item) => (
            <article
              className="rounded-lg border border-border bg-card p-5"
              key={item.status}
            >
              <StatusBadge status={item.status} />
              <h3 className="mt-4 font-bold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
