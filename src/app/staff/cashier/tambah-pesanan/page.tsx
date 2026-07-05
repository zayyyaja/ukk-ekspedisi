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
      const response = await apiGet<Branch[]>("/api/v1/public/branches?limit=100");
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      let photoUrl: string | null = null;

      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        const uploadRes = await fetch("/api/v1/staff/upload", {
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
      toast.success(`Pesanan dikonfirmasi. Resi: ${shipment.tracking_number} (status: picked up)`);
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
        <header className="flex flex-col justify-between gap-4 rounded-3xl bg-slate-950 p-6 text-white md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-orange-300">Walk-in Customer</p>
            <h1 className="mt-2 text-3xl font-bold">Tambah Pesanan</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Buat order langsung dari loket kasir. Pesanan langsung terkonfirmasi dengan status picked up (metode drop off).
            </p>
          </div>
          <PackagePlus className="h-12 w-12 text-orange-300" />
        </header>

        <form
          className="grid gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <FormPanel title="Data Pengirim">
            <TextField label="Nama" required value={form.senderName} onChange={(value) => patch({ senderName: value })} />
            <TextField label="Email (Optional)" type="email" value={form.senderEmail} onChange={(value) => patch({ senderEmail: value })} />
            <TextField label="Nomor HP" required value={form.senderPhone} onChange={(value) => patch({ senderPhone: value })} />
            <TextField label="Kota" required value={form.senderCity} onChange={(value) => patch({ senderCity: value })} />
            <TextField label="Alamat" required wide value={form.senderAddress} onChange={(value) => patch({ senderAddress: value })} />
          </FormPanel>

          <FormPanel title="Data Penerima">
            <TextField label="Nama" required value={form.receiverName} onChange={(value) => patch({ receiverName: value })} />
            <TextField label="Email (Optional)" type="email" value={form.receiverEmail} onChange={(value) => patch({ receiverEmail: value })} />
            <TextField label="Nomor HP" required value={form.receiverPhone} onChange={(value) => patch({ receiverPhone: value })} />
            <TextField label="Kota Tujuan" required value={form.receiverCity} onChange={(value) => patch({ receiverCity: value })} />
            <TextField label="Alamat Lengkap" required wide value={form.receiverAddress} onChange={(value) => patch({ receiverAddress: value })} />
          </FormPanel>

          <FormPanel title="Data Paket">
            <TextField label="Nama Paket" required value={form.itemName} onChange={(value) => patch({ itemName: value })} />
            <TextField label="Berat (kg)" required step="0.1" type="number" value={form.weight} onChange={(value) => patch({ weight: value })} />
            <div className="md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Foto Paket</span>
              <input
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
                type="file"
              />
              {!photoPreview ? (
                <button
                  className="mt-2 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-10 transition-colors hover:border-orange-500 hover:bg-orange-50"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <UploadCloud className="mb-3 h-8 w-8 text-slate-400" />
                  <p className="text-sm font-medium text-slate-700">Klik untuk unggah foto paket</p>
                  <p className="mt-1 text-xs text-slate-400">JPG, PNG, maksimal 5MB</p>
                </button>
              ) : (
                <div className="relative mt-2 overflow-hidden rounded-xl border border-slate-200">
                  <div className="relative aspect-video w-full">
                    <Image alt="Preview foto paket" className="object-cover" fill src={photoPreview} unoptimized />
                  </div>
                  <button
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm"
                    onClick={removePhoto}
                    type="button"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </FormPanel>

          <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Pengiriman & Pembayaran</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              <div className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Metode Penyerahan</span>
                <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700">
                  Drop Off (Datang ke Cabang)
                </div>
              </div>
              <SelectField label="Metode Pembayaran" value={form.paymentMethod} onChange={(value) => patch({ paymentMethod: value })}>
                {allPaymentMethods.map((method) => (
                  <option key={method} value={method}>{method.toUpperCase().replace("_", " ")}</option>
                ))}
              </SelectField>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl bg-orange-50 p-4 text-orange-800 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">Estimasi biaya</p>
                <p className="text-sm">Metode drop off menerima semua metode pembayaran termasuk cash.</p>
              </div>
              <strong className="text-2xl">{formatCurrency(estimatedPrice)}</strong>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-orange-500 px-6 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 disabled:opacity-60"
              disabled={mutation.isPending || branches.isLoading}
              type="submit"
            >
              {mutation.isPending ? "Menyimpan..." : "Simpan & Konfirmasi Pesanan"}
            </button>
          </div>
        </form>
      </div>
    </CashierShell>
  );
}

function FormPanel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
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
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
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
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <select
        className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
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
