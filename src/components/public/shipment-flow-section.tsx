const steps = [
  "Buat Shipment",
  "Pilih Pickup atau Drop Off",
  "Bayar Pengiriman",
  "Paket Diproses Cabang",
  "Dalam Perjalanan",
  "Paket Diterima",
];

export function ShipmentFlowSection() {
  return (
    <section className="bg-slate-950 px-4 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase text-blue-300">
            Alur Pengiriman
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            Proses jelas dari input shipment sampai paket diterima.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              className="rounded-lg border border-slate-800 bg-slate-900 p-5"
              key={step}
            >
              <span className="font-mono text-sm font-bold text-blue-300">
                STEP {index + 1}
              </span>
              <h3 className="mt-3 text-lg font-semibold">{step}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
