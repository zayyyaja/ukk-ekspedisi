"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { apiGet, apiPost } from "@/lib/api-client";
import { formatCurrency } from "@/lib/customer-format";
import type { Branch, Rate, Shipment } from "@/types/customer-portal";

const paymentMethods = [
  "cash",
  "qris",
  "gopay",
  "shopeepay",
  "bca_va",
  "bni_va",
  "bri_va",
  "mandiri_va",
] as const;

const shipmentFormSchema = z
  .object({
    receiverId: z.coerce.number().int().positive("Receiver ID wajib diisi."),
    originBranchId: z.coerce.number().int().positive("Origin branch wajib diisi."),
    destinationBranchId: z.coerce.number().int().positive("Destination branch wajib diisi."),
    rateId: z.coerce.number().int().positive("Rate wajib dipilih."),
    handoverMethod: z.enum(["drop_off", "pickup"]),
    paymentMethod: z.enum(paymentMethods),
    items: z
      .array(
        z.object({
          itemName: z.string().min(2, "Nama item minimal 2 karakter."),
          quantity: z.coerce.number().int().min(1),
          weight: z.coerce.number().positive(),
          photo: z.string().url("URL foto tidak valid.").optional().or(z.literal("")),
        }),
      )
      .min(1),
  })
  .refine((data) => data.handoverMethod === "drop_off" || data.paymentMethod !== "cash", {
    message: "Pickup wajib menggunakan online payment.",
    path: ["paymentMethod"],
  });

type ShipmentFormInput = z.input<typeof shipmentFormSchema>;
type ShipmentFormOutput = z.output<typeof shipmentFormSchema>;

const steps = ["Receiver", "Route", "Items", "Handover", "Payment", "Review"];

export default function CreateShipmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShipmentFormInput, unknown, ShipmentFormOutput>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      receiverId: 2,
      originBranchId: 1,
      destinationBranchId: 2,
      rateId: 1,
      handoverMethod: "drop_off",
      paymentMethod: "cash",
      items: [{ itemName: "", quantity: 1, weight: 1, photo: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const formValues = watch();

  useEffect(() => {
    Promise.all([
      apiGet<Branch[]>("/api/v1/public/branches?limit=100"),
      apiGet<Rate[]>("/api/v1/public/rates/check?limit=100"),
    ])
      .then(([branchResponse, rateResponse]) => {
        setBranches(branchResponse.data);
        setRates(rateResponse.data);
        if (branchResponse.data[0]) {
          setValue("originBranchId", Number(branchResponse.data[0].id));
        }
        if (branchResponse.data[1]) {
          setValue("destinationBranchId", Number(branchResponse.data[1].id));
        }
        if (rateResponse.data[0]) {
          setValue("rateId", Number(rateResponse.data[0].id));
        }
      })
      .catch((currentError) =>
        setError(currentError instanceof Error ? currentError.message : "Gagal memuat pilihan."),
      )
      .finally(() => setLoadingOptions(false));
  }, [setValue]);

  useEffect(() => {
    if (formValues.handoverMethod === "pickup" && formValues.paymentMethod === "cash") {
      setValue("paymentMethod", "qris");
    }
  }, [formValues.handoverMethod, formValues.paymentMethod, setValue]);

  const selectedRate = rates.find((rate) => Number(rate.id) === Number(formValues.rateId));
  const totalWeight = useMemo(
    () =>
      formValues.items.reduce(
        (sum, item) => sum + Number(item.weight || 0) * Number(item.quantity || 0),
        0,
      ),
    [formValues.items],
  );
  const estimatedPrice = totalWeight * Number(selectedRate?.price_per_kg ?? 0);

  async function onSubmit(input: ShipmentFormOutput) {
    setSubmitting(true);
    setError("");
    try {
      const response = await apiPost<Shipment>("/api/v1/customer/shipments", {
        ...input,
        items: input.items.map((item) => ({
          ...item,
          photo: item.photo || null,
        })),
      });
      router.replace(`/customer/dashboard/shipments/${response.data.id}`);
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Gagal membuat shipment.");
    } finally {
      setSubmitting(false);
    }
  }

  function nextStep() {
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function previousStep() {
    setStep((current) => Math.max(current - 1, 0));
  }

  return (
    <section className="content">
      <div className="page-head">
        <div>
          <h1>Buat shipment</h1>
          <p className="subtitle">Isi data paket bertahap lalu review sebelum submit.</p>
        </div>
      </div>

      <form className="shipment-stepper" onSubmit={handleSubmit(onSubmit)}>
        <div className="step-tabs">
          {steps.map((item, index) => (
            <button
              className={step === index ? "active" : ""}
              key={item}
              onClick={() => setStep(index)}
              type="button"
            >
              {index + 1}. {item}
            </button>
          ))}
        </div>

        {loadingOptions && <div className="alert">Memuat data cabang dan tarif...</div>}
        {error && <div className="alert error">{error}</div>}

        {step === 0 && (
          <section className="form-grid">
            <div className="field">
              <label>Receiver ID</label>
              <input className="input" type="number" {...register("receiverId")} />
              <span className="muted">Sementara gunakan ID customer penerima yang sudah ada.</span>
              {errors.receiverId && <span className="muted">{errors.receiverId.message}</span>}
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="form-grid">
            <div className="field">
              <label>Origin branch</label>
              <select className="select" {...register("originBranchId")}>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name} - {branch.city}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Destination branch</label>
              <select className="select" {...register("destinationBranchId")}>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name} - {branch.city}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Rate</label>
              <select className="select" {...register("rateId")}>
                {rates.map((rate) => (
                  <option key={rate.id} value={rate.id}>
                    {rate.origin_city} ke {rate.destination_city} - {formatCurrency(rate.price_per_kg)}/kg
                  </option>
                ))}
              </select>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="form-grid">
            {fields.map((field, index) => (
              <div className="panel" key={field.id}>
                <div className="grid" style={{ gridTemplateColumns: "1.5fr 120px 120px 1fr" }}>
                  <div className="field">
                    <label>Item name</label>
                    <input className="input" {...register(`items.${index}.itemName`)} />
                  </div>
                  <div className="field">
                    <label>Quantity</label>
                    <input className="input" type="number" {...register(`items.${index}.quantity`)} />
                  </div>
                  <div className="field">
                    <label>Weight</label>
                    <input className="input" step="0.1" type="number" {...register(`items.${index}.weight`)} />
                  </div>
                  <div className="field">
                    <label>Photo URL</label>
                    <input className="input" {...register(`items.${index}.photo`)} />
                  </div>
                </div>
                {fields.length > 1 && (
                  <button className="button danger" onClick={() => remove(index)} type="button">
                    Hapus item
                  </button>
                )}
              </div>
            ))}
            <button
              className="button secondary"
              onClick={() => append({ itemName: "", quantity: 1, weight: 1, photo: "" })}
              type="button"
            >
              Tambah item
            </button>
          </section>
        )}

        {step === 3 && (
          <section className="form-grid">
            <div className="field">
              <label>Handover method</label>
              <select className="select" {...register("handoverMethod")}>
                <option value="drop_off">Drop off</option>
                <option value="pickup">Pickup</option>
              </select>
            </div>
            <div className="alert">Pickup wajib menggunakan online payment.</div>
          </section>
        )}

        {step === 4 && (
          <section className="form-grid">
            <div className="field">
              <label>Payment method</label>
              <select className="select" {...register("paymentMethod")}>
                {paymentMethods.map((method) => (
                  <option
                    disabled={formValues.handoverMethod === "pickup" && method === "cash"}
                    key={method}
                    value={method}
                  >
                    {method}
                  </option>
                ))}
              </select>
              {errors.paymentMethod && <span className="muted">{errors.paymentMethod.message}</span>}
            </div>
          </section>
        )}

        {step === 5 && (
          <section className="panel">
            <h2>Review shipment</h2>
            <p><strong>Receiver ID:</strong> {String(formValues.receiverId ?? "-")}</p>
            <p><strong>Route:</strong> {selectedRate?.origin_city ?? "-"} ke {selectedRate?.destination_city ?? "-"}</p>
            <p><strong>Total weight:</strong> {totalWeight} kg</p>
            <p><strong>Estimated price:</strong> {formatCurrency(estimatedPrice)}</p>
            <p><strong>Handover:</strong> {String(formValues.handoverMethod ?? "-")}</p>
            <p><strong>Payment:</strong> {String(formValues.paymentMethod ?? "-")}</p>
            <p><strong>Items:</strong> {formValues.items.length}</p>
          </section>
        )}

        <div className="page-head" style={{ marginTop: 18 }}>
          <button className="button secondary" disabled={step === 0} onClick={previousStep} type="button">
            Sebelumnya
          </button>
          {step < steps.length - 1 ? (
            <button className="button primary" onClick={nextStep} type="button">
              Lanjut
            </button>
          ) : (
            <button className="button primary" disabled={submitting} type="submit">
              {submitting ? "Membuat shipment..." : "Submit shipment"}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
