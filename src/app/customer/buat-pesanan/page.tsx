"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { BentoHeader } from "@/components/customer/bento-header";
import { 
  CustomerShipmentSection, 
  CustomerReceiverSection, 
  CustomerServiceSection, 
  CustomerUploadSection, 
  CustomerSummarySidebar 
} from "@/components/customer/checkout/checkout-components";
import { CustomerFormSection } from "@/components/customer/checkout/checkout-components";
import { Image as ImageIcon } from "lucide-react";

import { apiGet, apiPost, ApiClientError } from "@/lib/api-client";
import type { Branch, Shipment } from "@/types/customer-portal";

const onlinePaymentMethods = ["qris", "gopay", "shopeepay", "bca_va", "bni_va", "bri_va", "mandiri_va"] as const;
const paymentMethods = ["cash", ...onlinePaymentMethods] as const;

const orderSchema = z.object({
  itemName: z.string().min(2, "Required minimum 2 characters"),
  itemType: z.string().min(1, "Required"),
  weight: z.coerce.number({ message: "Required" }).positive("Required"),
  originBranchId: z.coerce.number().int().positive("Required"),
  destinationBranchId: z.coerce.number().int().positive("Required"),
  receiverName: z.string().min(2, "Required minimum 2 characters"),
  receiverPhone: z.string().optional(),
  receiverEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  receiverAddress: z.string().min(1, "Required"),
  receiverNote: z.string().optional(),
  handoverMethod: z.enum(["drop_off", "pickup"]),
  paymentMethod: z.enum(paymentMethods, { message: "Required" }),
}).refine((data) => data.handoverMethod === "drop_off" || data.paymentMethod !== "cash", {
  message: "Cash is only available for Drop Off.",
  path: ["paymentMethod"],
});

type OrderInput = z.input<typeof orderSchema>;
type OrderOutput = z.output<typeof orderSchema>;
type MidtransPaymentResponse = { redirectUrl?: string | null };
type RateResult = { id: string; price_per_kg: string; estimated_days: number };

export default function CustomerBuatPesananPage() {
  const router = useRouter();
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");

  const [rate, setRate] = useState<RateResult | null>(null);
  const [rateLoading, setRateLoading] = useState(false);

  const { handleSubmit, register, setValue, watch, formState: { errors } } = useForm<OrderInput, unknown, OrderOutput>({
    resolver: zodResolver(orderSchema),
    defaultValues: { paymentMethod: "qris", handoverMethod: "drop_off", weight: 0 },
    mode: "onChange",
  });
  
  const values = watch();
  const handoverMethod = values.handoverMethod;
  const availablePaymentMethods = handoverMethod === "pickup" ? onlinePaymentMethods : paymentMethods;
  const originBranch = branches.find((branch) => Number(branch.id) === Number(values.originBranchId));
  const destinationBranch = branches.find((branch) => Number(branch.id) === Number(values.destinationBranchId));

  // --- Progressive Disclosure Logic ---
  const isStep1Valid = Boolean(values.itemName && values.itemName.length >= 2 && values.itemType && Number(values.weight) > 0 && photoFile);
  const isStep2Valid = Boolean(isStep1Valid && values.receiverName && values.receiverName.length >= 2 && (!values.receiverEmail || values.receiverEmail.includes("@")));
  const isStep3Valid = Boolean(isStep2Valid && values.originBranchId && values.destinationBranchId && values.receiverAddress);
  const isReadyToSubmit = isStep3Valid;

  useEffect(() => {
    apiGet<Branch[]>("/api/v2/public/branches?limit=100")
      .then((response) => setBranches(response.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load branches."));
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
        setPhotoError("File must be an image (JPG, PNG)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError("File must be less than 5MB");
        return;
      }
      setPhotoFile(file);
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
      setPhotoError("");
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoError("");
  };

  async function onSubmit(input: OrderOutput) {
    if (!photoFile) {
      setPhotoError("Package photo is required.");
      return;
    }

    setSubmitting(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("file", photoFile);
      
      const uploadRes = await fetch("/api/v2/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) throw new Error(uploadData.message || "Failed to upload photo");
      
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
        items: [{ itemName: input.itemName, itemType: input.itemType, quantity: 1, weight: input.weight, photo: uploadData.data.url }],
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
    } catch (err) {
      if (err instanceof ApiClientError && Object.keys(err.errors).length > 0) {
        setError(`Validation Failed: ${Object.values(err.errors).join(" | ")}`);
      } else {
        setError(err instanceof Error ? err.message : "Failed to create shipment.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full font-body">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 mb-8">
        <BentoHeader />
      </div>

      <div className="pb-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Checkout Shipment</h1>
          <p className="mt-1 text-sm font-medium text-muted">Complete the workflow below to book your delivery.</p>
        </header>

        {error && (
          <div className="mb-8 rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm font-semibold text-danger shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* 8 + 4 Enterprise Bento Grid */}
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            
            {/* LEFT COLUMN: PROGRESSIVE WORKFLOW (8 Columns) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* STEP 1: Shipment Details & Upload */}
              <CustomerFormSection step={1} title="Package Information" description="Define the package contents and attach a photo." icon={ImageIcon} isActive={true} isCompleted={isStep1Valid}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-ink">Package Name</label>
                      <input className="flex h-11 w-full rounded-lg border border-border/60 bg-surface px-4 text-sm font-medium transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="e.g. Corporate Documents" {...register("itemName")} />
                      {errors.itemName && <span className="text-xs font-semibold text-danger">{errors.itemName.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-ink">Material Category</label>
                      <input className="flex h-11 w-full rounded-lg border border-border/60 bg-surface px-4 text-sm font-medium transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="e.g. Archives" {...register("itemType")} />
                      {errors.itemType && <span className="text-xs font-semibold text-danger">{errors.itemType.message}</span>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-ink">Gross Weight (KG)</label>
                      <div className="relative">
                        <input type="number" step="0.1" className="flex h-11 w-full rounded-lg border border-border/60 bg-surface pl-4 pr-12 text-sm font-semibold transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="0.0" {...register("weight")} />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">KG</span>
                      </div>
                      {errors.weight && <span className="text-xs font-semibold text-danger">{errors.weight.message}</span>}
                    </div>
                  </div>
                  <div>
                    <CustomerUploadSection photoFile={photoFile} photoPreview={photoPreview} onFileChange={handleFileChange} onRemove={removePhoto} error={photoError} />
                  </div>
                </div>
              </CustomerFormSection>

              {/* STEP 2: Receiver Info */}
              <CustomerReceiverSection register={register} errors={errors} isActive={isStep1Valid} isCompleted={isStep2Valid} />

              {/* STEP 3: Delivery Route */}
              <CustomerServiceSection register={register} errors={errors} branches={branches} isActive={isStep2Valid} isCompleted={isStep3Valid} />

            </div>

            {/* RIGHT COLUMN: STICKY CHECKOUT SIDEBAR (4 Columns) */}
            <div className="lg:col-span-4">
              <CustomerSummarySidebar 
                estimatedPrice={estimatedPrice}
                weight={values.weight}
                rateLoading={rateLoading}
                submitting={submitting}
                register={register}
                availablePaymentMethods={availablePaymentMethods}
                isReadyToSubmit={isReadyToSubmit}
              />
            </div>
            
          </div>
        </form>
      </div>
    </div>
  );
}