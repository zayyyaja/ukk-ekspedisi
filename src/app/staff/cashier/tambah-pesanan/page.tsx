"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { PackagePlus, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { createCashierOrder } from "@/components/cashier/cashier-api";
import { CashierQueryProvider } from "@/components/cashier/cashier-query-provider";
import { CashierShell } from "@/components/cashier/cashier-shell";
import { apiGet } from "@/lib/api-client";
import { formatCurrency } from "@/lib/customer-format";
import type { Branch } from "@/types/customer-portal";

const allPaymentMethods = ["cash", "qris", "gopay", "shopeepay", "bca_va", "bni_va", "bri_va", "mandiri_va"] as const;

type FormState = {
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderAddress: string;
  senderCity: string;
  receiverName: string;
  receiverEmail: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverCity: string;
  itemName: string;
  weight: string;
  originBranchId: string;
  destinationBranchId: string;
  paymentMethod: string;
};

const initialForm: FormState = {
  senderName: "",
  senderEmail: "",
  senderPhone: "",
  senderAddress: "",
  senderCity: "",
  receiverName: "",
  receiverEmail: "",
  receiverPhone: "",
  receiverAddress: "",
  receiverCity: "",
  itemName: "",
  weight: "",
  originBranchId: "",
  destinationBranchId: "",
  paymentMethod: "cash",
};

function CashierCreateOrderContent() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const branches = useQuery({
    queryKey: ["cashier-create-order-branches"],
    queryFn: async () => {
      const response = await apiGet<Branch[]>("/api/v2/public/branches?limit=100");
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      let photoUrl: string | null = null;

      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        const uploadRes = await fetch("/api/v2/staff/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.message || "Gagal mengunggah foto paket.");
        }
        photoUrl = uploadData.data.url as string;
      }

      return createCashierOrder({
        sender: {
          name: form.senderName,
          email: form.senderEmail || undefined,
          phone: form.senderPhone,
          address: form.senderAddress,
          city: form.senderCity,
        },
        receiver: {
          name: form.receiverName,
          email: form.receiverEmail || undefined,
          phone: form.receiverPhone,
          address: form.receiverAddress,
          city: form.receiverCity,
        },
        originBranchId: Number(form.originBranchId),
        destinationBranchId: Number(form.destinationBranchId),
        handoverMethod: "drop_off",
        paymentMethod: form.paymentMethod,
        items: [
          {
            itemName: form.itemName,
            quantity: 1,
            weight: Number(form.weight),
            photo: photoUrl,
          },
        ],
      });
    },
    onSuccess: (shipment) => {
      toast.success(`Pesanan dikonfirmasi. Resi: ${shipment.tracking_number} (status: dijemput)`);
      setForm(initialForm);
      setPhotoFile(null);
      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Gagal membuat pesanan."),
  });

  const estimatedPrice = useMemo(
    () => Number(form.weight || 0) * 8000,
    [form.weight],
  );

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  function patch(next: Partial<FormState>) {
    setForm((current) => ({ ...current, ...next }));
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function removePhoto() {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <CashierShell>
      <div className="grid gap-6">
        <header className="flex flex-col justify-between gap-4 rounded-3xl border border-border/50 bg-surface/80 backdrop-blur-xl p-8 text-ink shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold tracking-tight uppercase text-primary">Pelanggan datang langsung</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Tambah Pesanan</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-muted">
              Buat order langsung dari loket kasir. Pesanan langsung terkonfirmasi dengan status dijemput (metode antar langsung).
            </p>
          </div>
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <PackagePlus className="h-8 w-8" />
          </div>
        </header>

        <form
          className="grid gap-8 items-start lg:grid-cols-[1fr_320px]"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          {/* Kiri: Field Form */}
          <div className="flex flex-col gap-6">
            <FormPanel title="Data Pengirim">
              <TextField label="Nama" required value={form.senderName} onChange={(value) => patch({ senderName: value })} />
              <TextField label="Email (Opsional)" type="email" value={form.senderEmail} onChange={(value) => patch({ senderEmail: value })} />
              <TextField label="Nomor HP" required value={form.senderPhone} onChange={(value) => patch({ senderPhone: value })} />
              <TextField label="Kota" required value={form.senderCity} onChange={(value) => patch({ senderCity: value })} />
              <TextField label="Alamat" required wide value={form.senderAddress} onChange={(value) => patch({ senderAddress: value })} />
            </FormPanel>

            <FormPanel title="Data Penerima">
              <TextField label="Nama" required value={form.receiverName} onChange={(value) => patch({ receiverName: value })} />
              <TextField label="Email (Opsional)" type="email" value={form.receiverEmail} onChange={(value) => patch({ receiverEmail: value })} />
              <TextField label="Nomor HP" required value={form.receiverPhone} onChange={(value) => patch({ receiverPhone: value })} />
              <TextField label="Kota Tujuan" required value={form.receiverCity} onChange={(value) => patch({ receiverCity: value })} />
              <TextField label="Alamat Lengkap" required wide value={form.receiverAddress} onChange={(value) => patch({ receiverAddress: value })} />
            </FormPanel>

            <FormPanel title="Data Paket">
              <TextField label="Nama Paket" required value={form.itemName} onChange={(value) => patch({ itemName: value })} />
              <TextField label="Berat (kg)" required step="0.1" type="number" value={form.weight} onChange={(value) => patch({ weight: value })} />
              <div className="md:col-span-2">
                <span className="text-sm font-semibold text-ink">Foto Paket</span>
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  type="file"
                />
                {!photoPreview ? (
                  <button
                    className="mt-2 flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-border/40 bg-transparent py-8 transition-all hover:border-primary hover:bg-primary/5 cursor-pointer shadow-sm"
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                  >
                    <UploadCloud className="mb-2 h-6 w-6 text-primary/70" />
                    <p className="text-sm font-medium text-ink">Klik untuk unggah foto paket</p>
                    <p className="mt-1 text-xs text-muted">JPG, PNG (maks. 5MB)</p>
                  </button>
                ) : (
                  <div className="relative mt-2 overflow-hidden rounded-xl border border-border/40 shadow-sm">
                    <div className="relative aspect-video w-full">
                      <Image alt="Preview foto paket" className="object-cover" fill src={photoPreview} unoptimized />
                    </div>
                    <button
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface text-destructive shadow-sm hover:bg-slate-50 transition-all active:scale-95 cursor-pointer"
                      onClick={removePhoto}
                      type="button"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </FormPanel>

            <FormPanel title="Pengiriman & Pembayaran">
              <SelectField label="Cabang Asal" required value={form.originBranchId} onChange={(value) => patch({ originBranchId: value })}>
                <option value="">Pilih cabang asal</option>
                {(branches.data ?? []).map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name} - {branch.city}</option>
                ))}
              </SelectField>
              <SelectField label="Cabang Tujuan" required value={form.destinationBranchId} onChange={(value) => patch({ destinationBranchId: value })}>
                <option value="">Pilih cabang tujuan</option>
                {(branches.data ?? []).map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name} - {branch.city}</option>
                ))}
              </SelectField>
              <SelectField label="Metode Pembayaran" value={form.paymentMethod} onChange={(value) => patch({ paymentMethod: value })}>
                {allPaymentMethods.map((method) => (
                  <option key={method} value={method}>{method.toUpperCase().replace("_", " ")}</option>
                ))}
              </SelectField>
              <div className="grid gap-2">
                <span className="text-sm font-semibold text-ink">Metode Penyerahan</span>
                <div className="flex h-10 items-center rounded-xl border border-border/40 bg-slate-50 px-3 text-sm font-medium text-muted cursor-not-allowed shadow-sm">
                  Drop Off (Datang ke Cabang)
                </div>
              </div>
            </FormPanel>
          </div>

          {/* Kanan: Sticky Summary */}
          <div className="relative">
            <div className="sticky top-24 flex flex-col gap-6 rounded-2xl border border-border/40 bg-surface p-6 shadow-sm">
              <div className="border-b border-border/40 pb-4">
                <h2 className="text-base font-semibold tracking-tight text-ink">Ringkasan Pesanan</h2>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted font-medium">Asal</span>
                  <span className="text-ink font-semibold">{form.originBranchId ? branches.data?.find(b => b.id.toString() === form.originBranchId)?.city : '-'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted font-medium">Tujuan</span>
                  <span className="text-ink font-semibold">{form.destinationBranchId ? branches.data?.find(b => b.id.toString() === form.destinationBranchId)?.city : '-'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted font-medium">Berat Barang</span>
                  <span className="text-ink font-semibold">{form.weight ? `${form.weight} kg` : '-'}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-border/40 pb-4">
                  <span className="text-muted font-medium">Metode Pembayaran</span>
                  <span className="text-ink font-semibold uppercase">{form.paymentMethod === "cash" ? "TUNAI" : form.paymentMethod.replace("_", " ")}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-ink">Total Estimasi</span>
                  <span className="text-xl font-bold tracking-tight text-primary">
                    {formatCurrency(estimatedPrice)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  className="flex w-full h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:bg-[var(--fill-disabled)] disabled:text-[var(--text-disabled)] disabled:shadow-none disabled:cursor-not-allowed"
                  disabled={mutation.isPending || branches.isLoading || !form.senderName || !form.receiverName || !form.weight}
                  type="submit"
                >
                  {mutation.isPending ? "Menyimpan..." : "Konfirmasi Pesanan"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </CashierShell>
  );
}

function FormPanel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-border/40 bg-surface p-6 shadow-sm">
      <div className="border-b border-border/40 pb-4">
        <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

function TextField({
  label,
  onChange,
  required,
  step,
  type = "text",
  value,
  wide,
}: {
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  step?: string;
  type?: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <label className={`grid gap-2 ${wide ? "md:col-span-2" : ""}`}>
      <span className="text-sm font-semibold text-ink">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <input
        className="h-10 rounded-xl border border-border/40 bg-transparent px-3 text-sm font-medium text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        step={step}
        type={type}
        value={value}
      />
    </label>
  );
}

function SelectField({
  children,
  label,
  onChange,
  required,
  value,
}: {
  children: React.ReactNode;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-ink">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      <select
        className="h-10 rounded-xl border border-border/40 bg-transparent px-3 text-sm font-medium text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all cursor-pointer"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        value={value}
      >
        {children}
      </select>
    </label>
  );
}

export default function CashierCreateOrderPage() {
  return (
    <CashierQueryProvider>
      <CashierCreateOrderContent />
    </CashierQueryProvider>
  );
}
