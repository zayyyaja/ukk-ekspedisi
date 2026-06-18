const stats = [
  { value: "10+", label: "Cabang" },
  { value: "1000+", label: "Shipment" },
  { value: "500+", label: "Customer" },
  { value: "98%", label: "Tingkat Pengiriman Berhasil" },
];

export function StatsSection() {
  return (
    <section className="bg-background px-4 py-14">
      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <article className="rounded-lg border border-border bg-card p-6" key={stat.label}>
            <strong className="block text-3xl font-black text-slate-950">
              {stat.value}
            </strong>
            <span className="mt-2 block text-sm text-slate-600">{stat.label}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
