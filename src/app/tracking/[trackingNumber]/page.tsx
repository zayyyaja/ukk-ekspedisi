import type { Metadata } from "next";
import Link from "next/link";

type TrackingPageProps = {
  params: Promise<{ trackingNumber: string }>;
};

export async function generateMetadata({
  params,
}: TrackingPageProps): Promise<Metadata> {
  const { trackingNumber } = await params;

  return {
    title: `Tracking ${trackingNumber}`,
    description: `Cek status pengiriman dengan nomor resi ${trackingNumber}.`,
  };
}

export default async function PublicTrackingPage({ params }: TrackingPageProps) {
  const { trackingNumber } = await params;

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand-mark">Ekspedisi Online</div>
        <h1 className="title">Tracking {trackingNumber}</h1>
        <p className="subtitle">
          Masuk ke portal customer untuk melihat detail tracking dan timeline
          terakhir.
        </p>
        <Link className="button primary" href="/customer/lacak-resi">
          Buka tracking
        </Link>
      </section>
    </main>
  );
}
