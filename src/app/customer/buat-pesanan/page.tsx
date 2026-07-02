"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { UploadCloud, Image as ImageIcon, X, MapPin, Package, CreditCard, Banknote, ShieldCheck } from "lucide-react";
import Image from "next/image";

import { CustomerNavbarShell } from "@/components/customer/customer-navbar-shell";
import { apiGet, apiPost, ApiClientError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/customer-format";
import type { Branch, Shipment } from "@/types/customer-portal";

const onlinePaymentMethods = ["qris", "gopay", "shopeepay", "bca_va", "bni_va", "bri_va", "mandiri_va"] as const;
const paymentMethods = ["cash", ...onlinePaymentMethods] as const;

const orderSchema = z.object({
  itemName: z.string().min(2, "Nama Paket wajib diisi minimal 2 karakter"),
  itemType: z.string().min(1, "Jenis Barang wajib diisi"),
  weight: z.coerce.number({ message: "Berat Paket wajib diisi" }).positive("Berat Paket wajib diisi"),
  originBranchId: z.coerce.number().int().positive("Dikirim Dari wajib dipilih"),
  destinationBranchId: z.coerce.number().int().positive("Kota Tujuan wajib dipilih"),
  receiverName: z.string().min(2, "Nama Penerima wajib diisi minimal 2 karakter"),
  receiverPhone: z.string().optional(),
  receiverEmail: z.string().email("Email penerima tidak valid").optional().or(z.literal("")),
  receiverAddress: z.string().min(1, "Detail Alamat Tujuan wajib diisi"),
  receiverNote: z.string().optional(),
  handoverMethod: z.enum(["drop_off", "pickup"]),
  paymentMethod: z.enum(paymentMethods, { message: "Metode Pembayaran wajib dipilih" }),
}).refine((data) => data.handoverMethod === "drop_off" || data.paymentMethod !== "cash", {
  message: "Cash hanya tersedia untuk metode Datang ke Cabang.",
  path: ["paymentMethod"],
});

type OrderInput = z.input<typeof orderSchema>;
type OrderOutput = z.output<typeof orderSchema>;
type MidtransPaymentResponse = {
  redirectUrl?: string | null;
};
type RateResult = {
  id: string;
  price_per_kg: string;
  estimated_days: number;
};

export default function CustomerBuatPesananPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [rate, setRate] = useState<RateResult | null>(null);
  const [rateLoading, setRateLoading] = useState(false);

  const { handleSubmit, register, setValue, watch, formState: { errors } } = useForm<OrderInput, unknown, OrderOutput>({
    resolver: zodResolver(orderSchema),
    defaultValues: { paymentMethod: "qris", handoverMethod: "drop_off" },
  });
  const values = watch();
  const handoverMethod = values.handoverMethod;
  const availablePaymentMethods = handoverMethod === "pickup" ? onlinePaymentMethods : paymentMethods;
  const originBranch = branches.find((branch) => Number(branch.id) === Number(values.originBranchId));
  const destinationBranch = branches.find((branch) => Number(branch.id) === Number(values.destinationBranchId));

  useEffect(() => {
    apiGet<Branch[]>("/api/v1/public/branches?limit=100")
      .then((response) => setBranches(response.data))
      .catch((currentError) => setError(currentError instanceof Error ? currentError.message : "Gagal memuat cabang."));
  }, []);

  useEffect(() => {
    if (handoverMethod === "pickup" && values.paymentMethod === "cash") {
      setValue("paymentMethod", "qris");
    }
  }, [handoverMethod, setValue, values.paymentMethod]);

  useEffect(() => {
    if (!originBranch?.city || !destinationBranch?.city) {
      setRate(null);
      return;
    }

    setRateLoading(true);
    apiGet<RateResult[]>("/api/v1/public/rates/check", {
      originCity: originBranch.city,
      destinationCity: destinationBranch.city,
      limit: 1,
    })
      .then((response) => setRate(response.data[0] ?? null))
      .catch(() => setRate(null))
      .finally(() => setRateLoading(false));
  }, [originBranch?.city, destinationBranch?.city]);

  const estimatedPrice = useMemo(() => {
    const weight = Number(values.weight || 0);
    const pricePerKg = Number(rate?.price_per_kg ?? 0);
    const pickupFee = handoverMethod === "pickup" ? 10000 : 0;
    return weight > 0 && pricePerKg > 0 ? weight * pricePerKg + pickupFee : pickupFee;
  }, [values.weight, handoverMethod, rate?.price_per_kg]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("File harus berupa gambar (JPG, PNG, dll)");
        return;
      }
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      setError("");
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function onSubmit(input: OrderOutput) {
    if (!photoFile) {
      setError("Foto Paket wajib diunggah.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setError("");
    
    try {
      // 1. Upload Photo
      const formData = new FormData();
      formData.append("file", photoFile);
      
      const uploadRes = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) {
        throw new Error(uploadData.message || "Gagal mengunggah foto");
      }
      
      const photoUrl = uploadData.data.url;

      // 2. Create Shipment
      const response = await apiPost<Shipment>("/api/v1/customer/shipments", {
        originBranchId: input.originBranchId,
        destinationBranchId: input.destinationBranchId,
        receiver: {
          name: input.receiverName,
          phone: input.receiverPhone || "",
          email: input.receiverEmail || "",
          address: input.receiverAddress,
          note: input.receiverNote || "",
        },
        handoverMethod: input.handoverMethod,
        paymentMethod: input.paymentMethod,
        items: [{ itemName: input.itemName, itemType: input.itemType, quantity: 1, weight: input.weight, photo: photoUrl }],
      });
      
      if (input.paymentMethod === "cash") {
        router.replace(`/customer/pesanan/${response.data.id}`);
        return;
      }

      // 3. Request Payment
      const paymentResponse = await apiPost<MidtransPaymentResponse>(
        `/api/v1/customer/shipments/${response.data.id}/payments/online`,
        { paymentMethod: input.paymentMethod },
      );

      if (paymentResponse.data.redirectUrl) {
        window.location.href = paymentResponse.data.redirectUrl;
        return;
      }

      router.replace(`/customer/pembayaran/${response.data.id}?method=${input.paymentMethod}`);
    } catch (currentError) {
      if (currentError instanceof ApiClientError && Object.keys(currentError.errors).length > 0) {
        const errorMessages = Object.entries(currentError.errors)
          .map(([key, msg]) => {
            if (Array.isArray(msg)) return `${key}: ${msg.join(", ")}`;
            return `${key}: ${msg}`;
          })
          .join(" | ");
        setError(`Validasi gagal: ${errorMessages}`);
      } else {
        setError(currentError instanceof Error ? currentError.message : "Gagal membuat pesanan.");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CustomerNavbarShell>
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Buat Pesanan Baru</h1>
          <p className="mt-2 text-lg text-slate-500">Lengkapi detail paket dan pengiriman di bawah ini.</p>
        </header>

        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800 shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Kiri: Form Input */}
            <div className="space-y-8 lg:col-span-2">
              
              {/* Seksi 1: Detail Paket */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    <Package size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Informasi Paket</h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Nama/Isi Paket</label>
                    <input 
                      className="flex h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-colors placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                      placeholder="Contoh: Pakaian, Dokumen, Sepatu" 
                      {...register("itemName")} 
                    />
                    {errors.itemName && <span className="text-xs font-medium text-red-500">{errors.itemName.message}</span>}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Jenis Barang</label>
                    <input
                      className="flex h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-colors placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      placeholder="Contoh: Dokumen, Elektronik, Fashion"
                      {...register("itemType")}
                    />
                    {errors.itemType && <span className="text-xs font-medium text-red-500">{errors.itemType.message}</span>}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Berat Paket (kg)</label>
                    <div className="relative">
                      <input 
                        className="flex h-12 w-full rounded-lg border border-slate-300 bg-white pl-4 pr-12 py-2 text-sm transition-colors placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                        step="0.1" 
                        type="number" 
                        placeholder="0.0"
                        {...register("weight")} 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">KG</span>
                    </div>
                    {errors.weight && <span className="text-xs font-medium text-red-500">{errors.weight.message}</span>}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Foto Paket</label>
                    
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={handleFileChange}
                    />

                    {!photoPreview ? (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-10 transition-colors hover:border-orange-500 hover:bg-orange-50"
                      >
                        <div className="mb-3 rounded-full bg-white p-3 shadow-sm group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                          <UploadCloud size={24} className="text-slate-400 group-hover:text-orange-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-700 group-hover:text-orange-700">Klik untuk unggah foto paket</p>
                        <p className="mt-1 text-xs text-slate-400">JPG, PNG, maksimal 5MB</p>
                      </div>
                    ) : (
                      <div className="relative overflow-hidden rounded-xl border border-slate-200">
                        <div className="relative aspect-video w-full sm:aspect-[21/9]">
                          <Image src={photoPreview} alt="Preview Foto Paket" fill className="object-cover" />
                        </div>
                        <div className="absolute right-3 top-3">
                          <button 
                            type="button" 
                            onClick={removePhoto}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm backdrop-blur-sm hover:bg-red-50 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center gap-2">
                          <ImageIcon size={16} className="text-slate-400" />
                          <span className="text-sm font-medium text-slate-700 truncate">{photoFile?.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    <Package size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Data Penerima</h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Nama Penerima</label>
                    <input className="flex h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" {...register("receiverName")} />
                    {errors.receiverName && <span className="text-xs font-medium text-red-500">{errors.receiverName.message}</span>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Nomor HP Penerima (Opsional)</label>
                    <input className="flex h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" {...register("receiverPhone")} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Email Penerima (Opsional)</label>
                    <input className="flex h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" placeholder="Jika diisi, paket masuk ke inbox akun penerima." type="email" {...register("receiverEmail")} />
                    {errors.receiverEmail && <span className="text-xs font-medium text-red-500">{errors.receiverEmail.message}</span>}
                  </div>
                </div>
              </section>

              {/* Seksi 2: Pengiriman */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    <MapPin size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Rute Pengiriman</h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Dikirim Dari (Cabang)</label>
                    <select 
                      className="flex h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                      {...register("originBranchId")}
                    >
                      <option value="">Pilih cabang asal...</option>
                      {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name} - {branch.city}</option>)}
                    </select>
                    {errors.originBranchId && <span className="text-xs font-medium text-red-500">{errors.originBranchId.message}</span>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Kota Tujuan</label>
                    <select 
                      className="flex h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                      {...register("destinationBranchId")}
                    >
                      <option value="">Pilih kota tujuan...</option>
                      {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.city}</option>)}
                    </select>
                    {errors.destinationBranchId && <span className="text-xs font-medium text-red-500">{errors.destinationBranchId.message}</span>}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Detail Alamat Tujuan</label>
                    <textarea 
                      className="flex min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm transition-colors placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-y" 
                      placeholder="Masukkan alamat lengkap pengiriman (Jalan, RT/RW, Patokan)..." 
                      {...register("receiverAddress")} 
                    />
                    {errors.receiverAddress && <span className="text-xs font-medium text-red-500">{errors.receiverAddress.message}</span>}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Catatan (Opsional)</label>
                    <textarea
                      className="flex min-h-[84px] w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm transition-colors placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      placeholder="Patokan, instruksi penerimaan, atau catatan khusus."
                      {...register("receiverNote")}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Kanan: Ringkasan & Pembayaran */}
            <div className="space-y-8">
              <section className="sticky top-28 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-slate-950 px-6 py-4 text-white">
                  <h3 className="text-lg font-bold">Ringkasan Pesanan</h3>
                </div>
                
                <div className="p-6">
                  <div className="mb-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <MapPin size={16} className="text-slate-400" />
                        Metode Penyerahan
                      </label>
                      <select 
                        className="flex h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                        {...register("handoverMethod")}
                      >
                        <option value="drop_off">Datang ke Cabang</option>
                        <option value="pickup">Jemput Paket</option>
                      </select>
                    </div>

                    <div className="flex items-start gap-3 rounded-lg border border-orange-100 bg-orange-50 p-4">
                      <ShieldCheck className="mt-0.5 text-orange-500" size={18} />
                      <div>
                        {handoverMethod === "drop_off" ? (
                          <>
                            <p className="text-sm font-semibold text-orange-800">Datang ke Cabang</p>
                            <p className="mt-1 text-xs leading-relaxed text-orange-600">Anda perlu mengantar paket ini langsung ke cabang asal yang dipilih.</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-orange-800">Jemput Paket</p>
                            <p className="mt-1 text-xs leading-relaxed text-orange-600">Kurir akan mengambil paket di alamat Anda (Tambahan Biaya Rp 10.000). Hanya menerima pembayaran online via Midtrans.</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <CreditCard size={16} className="text-slate-400" />
                      Metode Pembayaran
                    </label>
                    <select 
                      className="flex h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                      {...register("paymentMethod")}
                    >
                      {availablePaymentMethods.map((method) => {
                        return <option key={method} value={method}>{method.toUpperCase().replace("_", " ")}</option>
                      })}
                    </select>
                    {errors.paymentMethod && <span className="text-xs font-medium text-red-500">{errors.paymentMethod.message}</span>}
                  </div>

                  <div className="border-t border-dashed border-slate-200 pt-6">
                    <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Estimasi Biaya</p>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <div className="flex justify-between"><span>Tarif per kg</span><strong>{rateLoading ? "Memuat..." : rate ? formatCurrency(rate.price_per_kg) : "-"}</strong></div>
                      <div className="flex justify-between"><span>Berat</span><strong>{Number(values.weight || 0)} kg</strong></div>
                      <div className="flex justify-between"><span>Biaya pickup</span><strong>{handoverMethod === "pickup" ? formatCurrency(10000) : formatCurrency(0)}</strong></div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-slate-900">{formatCurrency(estimatedPrice)}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                      Harga di atas adalah estimasi sementara berdasarkan berat paket dan rute aktif.
                    </p>
                  </div>

                  <div className="mt-8">
                    <button 
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 disabled:opacity-70 disabled:cursor-not-allowed" 
                      disabled={submitting} 
                      type="submit"
                    >
                      {submitting ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <Banknote size={18} />
                          Buat Pesanan Sekarang
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </form>
      </div>
    </CustomerNavbarShell>
  );
}
