"use client";

import { Search, Truck, Box, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { apiGet } from "@/lib/api-client";
import { labels } from "@/components/status-badge";
import { cn } from "@/lib/utils";

type TrackingResult = {
  trackingNumber: string;
  status: string;
  originBranch: { name: string; city: string };
  destinationBranch: { name: string; city: string };
  shipmentDate: string;
  sender: { name: string; city: string };
  receiver: { name: string; city: string };
  trackings: {
    status: string;
    location: string;
    description: string;
    trackedAt: string;
  }[];
};

export function HeroSection() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackingResult | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await apiGet<TrackingResult>(
        `/api/v2/public/tracking/${trackingNumber}`
      );
      setResult(response.data);
    } catch (err: any) {
      setError(err.message || "Resi tidak ditemukan.");
    } finally {
      setLoading(false);
    }
  }

  // Tracking data to display
  const displayTrackings = result?.trackings?.length
    ? result.trackings.slice(0, 2)
    : [];

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center pt-24 pb-16 lg:py-32 font-body select-none">
      {/* Neo-Minimalist Glow Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[800px] w-[1000px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <div className="page-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          {/* KOLOM KIRI: Editorial Typography */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 border border-border bg-surface px-3 py-1.5 text-xs font-semibold uppercase tracking-tight text-muted rounded-full shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>DRG-EKSPEDISI Logistics</span>
            </div>

            <h1 className="text-5xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              Pengiriman modern, <br />
              <span className="text-primary">Disederhanakan.</span>
            </h1>

            <p className="max-w-xl text-lg text-muted leading-relaxed">
              Rasakan era baru logistik. Harga transparan, pelacakan akurat
              secara real-time, dan kemudahan manajemen pesanan langsung dari
              meja Anda.
            </p>

            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-border/60 bg-surface/80 p-1.5 shadow-sm backdrop-blur-md transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center text-primary/70">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Masukkan nomor resi..."
                className="h-12 w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-muted"
                required
              />
              <Button type="submit" className="h-12 rounded-xl px-6" disabled={loading}>
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Lacak"}
              </Button>
            </form>

            {error && (
              <p className="text-sm font-medium text-red-500">{error}</p>
            )}
          </div>

          {/* KOLOM KANAN: Floating Bento Widget */}
          <div className="lg:col-span-6 w-full order-1 lg:order-2 flex justify-center lg:justify-end relative">
            <div className="relative w-full max-w-md">
              {/* Main Card */}
              <div className="relative z-20 border border-border/50 bg-surface/80 backdrop-blur-xl p-8 shadow-[0_20px_60px_rgb(0,0,0,0.08)] rounded-3xl overflow-hidden min-h-[260px] flex flex-col justify-center">
                {result ? (
                  <div className="space-y-6">
                    {/* Status Header */}
                    <div className="flex justify-between items-center pb-4 border-b border-border/50">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold tracking-tight text-muted uppercase">
                          Lacak langsung
                        </p>
                        <p className="text-sm font-semibold text-ink uppercase">
                          {result.trackingNumber}
                        </p>
                      </div>
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Navigation size={18} className="rotate-45" />
                      </div>
                    </div>

                    {/* Progress Timeline Mini */}
                    <div className="space-y-4 pt-2">
                      {displayTrackings.map((t, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex items-start gap-4",
                            i !== 0 && "opacity-50"
                          )}
                        >
                          <div className="flex flex-col items-center gap-2 mt-1">
                            {i === 0 ? (
                              <>
                                <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                {displayTrackings.length > 1 && (
                                  <div className="w-px h-10 bg-primary/30" />
                                )}
                              </>
                            ) : (
                              <div className="h-3 w-3 rounded-full border-2 border-muted" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-ink">
                              {labels[t.status?.toLowerCase()] || t.status}
                            </p>
                            <p className="text-xs text-muted mt-0.5">
                              {t.description || t.location}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4 text-center opacity-70">
                    <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
                      <Search size={24} className="text-slate-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-ink">Belum ada pencarian</p>
                      <p className="text-xs text-muted">Masukkan nomor resi di form <br/> untuk melacak pengiriman Anda.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Element 1 */}
              <div className="absolute -left-10 top-24 z-30 border border-border/50 bg-surface/90 backdrop-blur-xl p-4 shadow-[0_12px_40px_rgb(0,0,0,0.08)] rounded-2xl animate-in slide-in-from-bottom-8 duration-700 hidden sm:flex items-center gap-4">
                <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Box size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-tight text-muted uppercase">
                    Berat
                  </p>
                  <p className="text-sm font-semibold text-ink">
                    {result ? "Sesuai resi" : "- kg"}
                  </p>
                </div>
              </div>

              {/* Floating Element 2 */}
              <div className="absolute -right-8 -bottom-8 z-30 border border-border/50 bg-surface/90 backdrop-blur-xl p-4 shadow-[0_12px_40px_rgb(0,0,0,0.08)] rounded-2xl animate-in slide-in-from-bottom-12 duration-1000 hidden sm:flex items-center gap-4">
                <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Truck size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-tight text-muted uppercase">
                    Armada
                  </p>
                  <p className="text-sm font-semibold text-ink">
                    {result ? "Aktif" : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}