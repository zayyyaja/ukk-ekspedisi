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
    apiGet<Branch[]>("/api/v2/public/branches?limit=100")
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
    apiGet<RateResult[]>("/api/v2/public/rates/check", {
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
      const formData = new FormData();
      formData.append("file", photoFile);
      
      const uploadRes = await fetch("/api/v2/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) {
        throw new Error(uploadData.message || "Gagal mengunggah foto");
      }
      
      const photoUrl = uploadData.data.url;

      const response = await apiPost<Shipment>("/api/v2/customer/shipments", {
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

      const paymentResponse = await apiPost<MidtransPaymentResponse>(
        `/api/v2/customer/shipments/${response.data.id}/payments/online`,
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
      <div className="mx-auto max-w-5xl font-mono select-none pb-12">
        {/* Header Section */}
        <header className="mb-8 border-b-4 border-slate-900 pb-6">
          <p className="text-2xs font-black uppercase tracking-[0.2em] text-amber-600">// DEPLOY_NEW_MANIFEST</p>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-wide text-slate-900 sm:text-4xl">ENTRI PESANAN BARU</h1>
          <p className="mt-2 text-xs font-bold text-slate-500">Formulir linear satu arah untuk pemrosesan muatan logistik kilat.</p>
        </header>

        {error && (
          <div className="mb-8 border-4 border-slate-900 bg-rose-100 p-4 text-xs font-black uppercase tracking-wider text-rose-950 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] rounded-sm">
            [ ERROR_SYSTEM ]: {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* SEKSI 1: Lebar Penuh untuk Data Utama Paket */}
          <section className="border-4 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] rounded-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3 border-b-2 border-dashed border-slate-200 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-slate-900 bg-amber-400 text-slate-900 rounded-sm">
                <Package size={18} className="stroke-[2.5]" />
              </div>
              <span className="text-2xs font-black bg-slate-900 text-white px-2 py-0.5 rounded-xs">STAGE_01</span>
              <h2 className="text-md font-black uppercase tracking-wide text-slate-900">KARAKTERISTIK_MUATAN</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-2xs font-black uppercase tracking-wider text-slate-700">NAMA / DESKRIPSI BARANG</label>
                    <input 
                      className="flex h-11 w-full border-2 border-slate-900 bg-white px-4 py-2 text-2xs font-bold uppercase tracking-wide placeholder:text-slate-400 focus:outline-none rounded-sm" 
                      placeholder="Contoh: DOKUMEN PERUSAHAAN" 
                      {...register("itemName")} 
                    />
                    {errors.itemName && <span className="text-3xs font-black text-rose-600 uppercase tracking-wide">[! {errors.itemName.message}]</span>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-2xs font-black uppercase tracking-wider text-slate-700">KATEGORI MATERIAL</label>
                    <input
                      className="flex h-11 w-full border-2 border-slate-900 bg-white px-4 py-2 text-2xs font-bold uppercase tracking-wide placeholder:text-slate-400 focus:outline-none rounded-sm"
                      placeholder="Contoh: ARSIP / BERKAS"
                      {...register("itemType")}
                    />
                    {errors.itemType && <span className="text-3xs font-black text-rose-600 uppercase tracking-wide">[! {errors.itemType.message}]</span>}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-2xs font-black uppercase tracking-wider text-slate-700">MASSA UNIT (BRUTO)</label>
                  <div className="relative">
                    <input 
                      className="flex h-11 w-full border-2 border-slate-900 bg-white pl-4 pr-12 py-2 text-2xs font-bold focus:outline-none rounded-sm" 
                      step="0.1" 
                      type="number" 
                      placeholder="0.0"
                      {...register("weight")} 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xs font-black text-slate-900">KG</span>
                  </div>
                  {errors.weight && <span className="text-3xs font-black text-rose-600 uppercase tracking-wide">[! {errors.weight.message}]</span>}
                </div>
              </div>

              {/* Kompartemen Upload Gambar Kanan */}
              <div className="space-y-2">
                <label className="text-2xs font-black uppercase tracking-wider text-slate-700">LAMPIRAN VISUAL (WAJIB)</label>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

                {!photoPreview ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex h-[168px] cursor-pointer flex-col items-center justify-center border-2 border-dashed border-slate-400 bg-slate-50 text-center p-4 transition-colors hover:border-amber-500 hover:bg-amber-50/20 rounded-sm"
                  >
                    <UploadCloud size={22} className="text-slate-900 stroke-[2.5] mb-2" />
                    <p className="text-3xs font-black text-slate-900 uppercase tracking-wide">AMBIL / UNGHAH FOTO</p>
                  </div>
                ) : (
                  <div className="relative overflow-hidden border-2 border-slate-900 rounded-sm h-[168px]">
                    <Image src={photoPreview} alt="Preview" fill className="object-cover grayscale" />
                    <button 
                      type="button" 
                      onClick={removePhoto}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center border-2 border-slate-900 bg-white text-rose-600 shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] rounded-sm"
                    >
                      <X size={12} className="stroke-[3]" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xs px-2 py-1 text-[9px] font-bold uppercase text-white truncate">
                      {photoFile?.name}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SEKSI 2 & 3: Disejajarkan Berdampingan (Split Grid Horisontal) */}
          <div className="grid gap-8 md:grid-cols-2">
            
            {/* Bagian Penerima */}
            <section className="border-4 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] rounded-sm">
              <div className="mb-6 flex items-center gap-3 border-b-2 border-dashed border-slate-200 pb-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-slate-900 bg-slate-900 text-white rounded-sm">
                  <span className="text-3xs font-black">S_02</span>
                </div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">IDENTITAS_PENERIMA</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-2xs font-black uppercase tracking-wider text-slate-700">NAMA LENGKAP</label>
                  <input className="flex h-11 w-full border-2 border-slate-900 bg-white px-4 py-2 text-2xs font-bold uppercase tracking-wide focus:outline-none rounded-sm" {...register("receiverName")} />
                  {errors.receiverName && <span className="text-3xs font-black text-rose-600 uppercase tracking-wide">[! {errors.receiverName.message}]</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-2xs font-black uppercase tracking-wider text-slate-700">NOMOR TELEPON (AKTIF)</label>
                  <input className="flex h-11 w-full border-2 border-slate-900 bg-white px-4 py-2 text-2xs font-bold focus:outline-none rounded-sm" {...register("receiverPhone")} />
                </div>
                <div className="space-y-2">
                  <label className="text-2xs font-black uppercase tracking-wider text-slate-700">EMAIL REGISTRASI (OPSIONAL)</label>
                  <input className="flex h-11 w-full border-2 border-slate-900 bg-white px-4 py-2 text-2xs font-bold focus:outline-none rounded-sm" placeholder="NOTIFIKASI OTOMATIS" type="email" {...register("receiverEmail")} />
                  {errors.receiverEmail && <span className="text-3xs font-black text-rose-600 uppercase tracking-wide">[! {errors.receiverEmail.message}]</span>}
                </div>
              </div>
            </section>

            {/* Bagian Rute Logistik */}
            <section className="border-4 border-slate-900 bg-white p-6 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] rounded-sm">
              <div className="mb-6 flex items-center gap-3 border-b-2 border-dashed border-slate-200 pb-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-slate-900 bg-slate-900 text-white rounded-sm">
                  <span className="text-3xs font-black">S_03</span>
                </div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">PEMETAAN_RUTE</h2>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-2xs font-black uppercase tracking-wider text-slate-700">ORIGIN BRANCH</label>
                    <select className="flex h-11 w-full border-2 border-slate-900 bg-white px-2 text-3xs font-black uppercase focus:outline-none rounded-sm cursor-pointer" {...register("originBranchId")}>
                      <option value="">[ PILIH CABANG ]</option>
                      {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.city}</option>)}
                    </select>
                    {errors.originBranchId && <span className="text-3xs font-black text-rose-600 uppercase tracking-wide">[! {errors.originBranchId.message}]</span>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-2xs font-black uppercase tracking-wider text-slate-700">DESTINATION</label>
                    <select className="flex h-11 w-full border-2 border-slate-900 bg-white px-2 text-3xs font-black uppercase focus:outline-none rounded-sm cursor-pointer" {...register("destinationBranchId")}>
                      <option value="">[ PILIH KOTA ]</option>
                      {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.city}</option>)}
                    </select>
                    {errors.destinationBranchId && <span className="text-3xs font-black text-rose-600 uppercase tracking-wide">[! {errors.destinationBranchId.message}]</span>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-2xs font-black uppercase tracking-wider text-slate-700">ALAMAT DETAIL & CATATAN</label>
                  <input className="flex h-11 w-full border-2 border-slate-900 bg-white px-4 py-2 text-2xs font-bold uppercase tracking-wide focus:outline-none rounded-sm" placeholder="NAMA JALAN, RT/RW, KECAMATAN" {...register("receiverAddress")} />
                  {errors.receiverAddress && <span className="text-3xs font-black text-rose-600 uppercase tracking-wide">[! {errors.receiverAddress.message}]</span>}
                  <input className="flex h-9 w-full border-2 border-slate-200 bg-slate-50/50 px-4 py-1 text-3xs font-medium uppercase focus:outline-none rounded-sm mt-1" placeholder="INSTRUKSI TAMBAHAN / PATOKAN (OPTIONAL)" {...register("receiverNote")} />
                </div>
              </div>
            </section>

          </div>

          {/* SEKSI 4: RE-DESIGN TOTAL RINGKASAN & PEMBAYARAN (Horizontal Full Width Manifest) */}
          <section className="border-4 border-slate-900 bg-slate-950 p-6 text-white shadow-[6px_6px_0px_0px_rgba(251,191,36,1)] rounded-sm">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
              <span className="text-3xs font-black bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-xs">FINAL_STAGE</span>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">// KONTROL_TRANSAKSI_DAN_METODE</h3>
            </div>

            <div className="grid gap-6 lg:grid-cols-12 items-start">
              {/* Dropdowns Konfigurasi (Kiri - 5 Kolom) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">HANDOVER METHOD</label>
                    <select className="flex h-10 w-full border-2 border-slate-700 bg-slate-900 px-2 text-3xs font-black uppercase text-white focus:border-amber-400 focus:outline-none rounded-sm" {...register("handoverMethod")}>
                      <option value="drop_off">DROP OFF CABANG</option>
                      <option value="pickup">PICKUP KURIR</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">PAYMENT GATEWAY</label>
                    <select className="flex h-10 w-full border-2 border-slate-700 bg-slate-900 px-2 text-3xs font-black uppercase text-white focus:border-amber-400 focus:outline-none rounded-sm" {...register("paymentMethod")}>
                      {availablePaymentMethods.map((method) => (
                        <option key={method} value={method}>{method.toUpperCase().replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border border-slate-800 bg-slate-900/50 p-2.5 rounded-xs flex gap-2">
                  <ShieldCheck size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold uppercase text-slate-400 leading-normal">
                    {handoverMethod === "drop_off" 
                      ? "MANIFES DROP OFF: ANTAR MUATAN SECARA MANDIRI KE GUDANG NODE ASAL." 
                      : "MANIFES PICKUP: ARMADA AKAN DATANG MENJEMPUT (+RP 10.000). WAJIB GERBANG ONLINE."
                    }
                  </p>
                </div>
              </div>

              {/* Rincian Finansial (Tengah - 4 Kolom) */}
              <div className="lg:col-span-4 border-l-0 lg:border-l border-dashed border-slate-800 pl-0 lg:pl-6 py-2">
                <div className="space-y-1 text-[10px] font-black uppercase text-slate-400">
                  <div className="flex justify-between"><span>TARIF BASE / KG :</span><span className="text-white">{rateLoading ? "CALC..." : rate ? formatCurrency(rate.price_per_kg) : "N/A"}</span></div>
                  <div className="flex justify-between"><span>TOTAL MUATAN   :</span><span className="text-white">{Number(values.weight || 0)} KG</span></div>
                  <div className="flex justify-between"><span>BIAYA AMBIL    :</span><span className="text-white">{handoverMethod === "pickup" ? formatCurrency(10000) : formatCurrency(0)}</span></div>
                </div>
                <div className="mt-3 border-t border-slate-800 pt-2 flex items-baseline justify-between">
                  <span className="text-3xs font-black text-amber-400 uppercase tracking-wider">AGGREGATE TOTAL:</span>
                  <span className="text-xl font-black tracking-tight text-white">{formatCurrency(estimatedPrice)}</span>
                </div>
              </div>

              {/* Tombol Eksekusi Final (Kanan - 3 Kolom) */}
              <div className="lg:col-span-3 h-full flex items-center pt-2 lg:pt-0">
                <button 
                  className="flex w-full h-14 items-center justify-center gap-2 border-2 border-slate-950 bg-amber-400 font-black text-slate-950 shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] hover:bg-amber-300 active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] text-2xs uppercase tracking-widest transition-all rounded-sm disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={submitting} 
                  type="submit"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin border-2 border-slate-950 border-t-transparent rounded-full" />
                      SUBMITTING...
                    </>
                  ) : (
                    <>
                      <Banknote size={14} className="stroke-[2.5]" />
                      PROSES PESANAN
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

        </form>
      </div>
    </CustomerNavbarShell>
  );
}