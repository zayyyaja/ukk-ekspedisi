"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { PackagePlus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { createCashierOrder } from "@/components/cashier/cashier-api";
import { CashierQueryProvider } from "@/components/cashier/cashier-query-provider";
import { CashierShell } from "@/components/cashier/cashier-shell";
import { apiGet } from "@/lib/api-client";
import { formatCurrency } from "@/lib/customer-format";
import type { Branch } from "@/types/customer-portal";

type FormState = {
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  senderAddress: string;
  senderCity: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverCity: string;
  itemName: string;
  weight: string;
  photo: string;
  originBranchId: string;
  destinationBranchId: string;
  handoverMethod: "drop_off" | "pickup";
  paymentMethod: string;
};

const initialForm: FormState = {
  senderName: "",
  senderEmail: "",
  senderPhone: "",
  senderAddress: "",
  senderCity: "",
  receiverName: "",
  receiverPhone: "",
  receiverAddress: "",
  receiverCity: "",
  itemName: "",
  weight: "",
  photo: "",
  originBranchId: "",
  destinationBranchId: "",
  handoverMethod: "drop_off",
  paymentMethod: "cash",
};

function CashierCreateOrderContent() {
  const [form, setForm] = useState<FormState>(initialForm);
  const branches = useQuery({
    queryKey: ["cashier-create-order-branches"],
    queryFn: async () => {
      const response = await apiGet<Branch[]>("/api/v1/public/branches?limit=100");
      return response.data;
    },
  });
  const mutation = useMutation({
    mutationFn: () =>
      createCashierOrder({
        sender: {
          name: form.senderName,
          email: form.senderEmail || undefined,
          phone: form.senderPhone,
          address: form.senderAddress,
          city: form.senderCity,
        },
        receiver: {
          name: form.receiverName,
          phone: form.receiverPhone,
          address: form.receiverAddress,
          city: form.receiverCity,
        },
        originBranchId: Number(form.originBranchId),
        destinationBranchId: Number(form.destinationBranchId),
        handoverMethod: form.handoverMethod,
        paymentMethod: form.paymentMethod,
        items: [
          {
            itemName: form.itemName,
            quantity: 1,
            weight: Number(form.weight),
            photo: form.photo || null,
          },
        ],
      }),
    onSuccess: (shipment) => {
      toast.success(`Pesanan dibuat. Resi: ${shipment.tracking_number}`);
      setForm(initialForm);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Gagal membuat pesanan."),
  });

  const estimatedPrice = useMemo(() => {
    return Number(form.weight || 0) * 8000;
  }, [form.weight]);

  function patch(next: Partial<FormState>) {
    setForm((current) => {
      return { ...current, ...next, handoverMethod: "drop_off", paymentMethod: "cash" };
    });
  }

  return (
    <CashierShell>
      <div className="grid gap-6">
        <header className="flex flex-col justify-between gap-4 rounded-3xl bg-slate-950 p-6 text-white md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-orange-300">Walk-in Customer</p>
            <h1 className="mt-2 text-3xl font-bold">Tambah Pesanan</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Buat order langsung dari loket kasir. Email pengirim boleh kosong untuk customer walk-in.
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
            <TextField label="Nomor HP" required value={form.receiverPhone} onChange={(value) => patch({ receiverPhone: value })} />
            <TextField label="Kota Tujuan" required value={form.receiverCity} onChange={(value) => patch({ receiverCity: value })} />
            <TextField label="Alamat Lengkap" required wide value={form.receiverAddress} onChange={(value) => patch({ receiverAddress: value })} />
          </FormPanel>

          <FormPanel title="Data Paket">
            <TextField label="Nama Paket" required value={form.itemName} onChange={(value) => patch({ itemName: value })} />
            <TextField label="Berat (kg)" required step="0.1" type="number" value={form.weight} onChange={(value) => patch({ weight: value })} />
            <TextField label="Foto Paket (URL)" wide value={form.photo} onChange={(value) => patch({ photo: value })} />
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
              <SelectField label="Metode Penyerahan" value={form.handoverMethod} onChange={(value) => patch({ handoverMethod: value as FormState["handoverMethod"] })}>
                <option value="drop_off">Datang ke Cabang</option>
              </SelectField>
              <SelectField label="Metode Pembayaran" value={form.paymentMethod} onChange={(value) => patch({ paymentMethod: value })}>
                <option value="cash">CASH</option>
              </SelectField>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl bg-orange-50 p-4 text-orange-800 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold">Estimasi biaya</p>
                <p className="text-sm">Pesanan dari kasir hanya menerima pembayaran cash di cabang.</p>
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
              {mutation.isPending ? "Menyimpan..." : "Simpan Pesanan"}
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
