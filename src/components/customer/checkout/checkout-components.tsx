"use client";

import { CheckCircle2, Circle, UploadCloud, X, MapPin, PackageSearch, User, Calculator, Truck, FileText, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Branch } from "@/types/customer-portal";

// --- Base Wrapper ---
export function CustomerFormSection({ 
  title, 
  description, 
  icon: Icon, 
  step, 
  isActive, 
  isCompleted, 
  children 
}: { 
  title: string; 
  description: string; 
  icon: React.ElementType; 
  step: number; 
  isActive: boolean; 
  isCompleted: boolean; 
  children: React.ReactNode; 
}) {
  return (
    <Card className={cn(
      "border border-border/40 bg-surface shadow-sm transition-all duration-300 relative overflow-hidden",
      isActive ? "ring-2 ring-primary/20 border-primary/40 shadow-md" : "opacity-70 grayscale-[20%]",
      !isActive && !isCompleted && "pointer-events-none select-none opacity-50"
    )}>
      {isCompleted && (
        <div className="absolute right-4 top-4 text-primary">
          <CheckCircle2 size={24} />
        </div>
      )}
      <CardHeader className="border-b border-border/40 bg-slate-50/50 p-5 flex flex-row items-center gap-4">
        <div className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-semibold shadow-sm",
          isActive ? "bg-primary text-primary-foreground" : isCompleted ? "bg-primary/20 text-primary" : "bg-muted/20 text-muted"
        )}>
          {step}
        </div>
        <div className="flex-1">
          <CardTitle className="text-base font-semibold text-ink tracking-tight flex items-center gap-2">
            <Icon size={18} className="text-muted" /> {title}
          </CardTitle>
          <CardDescription className="text-xs font-medium text-muted mt-0.5">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className={cn("p-6 transition-all duration-500", isActive || isCompleted ? "block" : "hidden")}>
        {children}
      </CardContent>
    </Card>
  );
}

// --- Upload Component ---
export function CustomerUploadSection({
  photoFile,
  photoPreview,
  onFileChange,
  onRemove,
  error
}: {
  photoFile: File | null;
  photoPreview: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  error?: string;
}) {
  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold text-ink">Package Photo (Required)</label>
      <input type="file" accept="image/*" className="hidden" id="package-photo" onChange={onFileChange} />
      
      {!photoPreview ? (
        <label 
          htmlFor="package-photo"
          className="group flex flex-col items-center justify-center border-2 border-dashed border-border/60 bg-surface/50 h-[180px] rounded-xl cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud size={24} />
          </div>
          <span className="text-sm font-semibold text-ink">Drag & Drop or Click to Upload</span>
          <span className="text-xs font-medium text-muted mt-1">Supported formats: JPG, PNG (Max 5MB)</span>
        </label>
      ) : (
        <div className="relative overflow-hidden border border-border/60 rounded-xl h-[180px] bg-black">
          <Image src={photoPreview} alt="Preview" fill className="object-cover opacity-90 transition-opacity hover:opacity-100" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none" />
          <Button
            type="button"
            variant="danger"
            size="icon"
            className="absolute right-3 top-3 h-8 w-8 rounded-lg shadow-sm"
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
          >
            <X size={16} />
          </Button>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white min-w-0">
              <ImageIcon size={14} className="shrink-0" />
              <span className="text-xs font-medium truncate">{photoFile?.name}</span>
            </div>
            <span className="text-[10px] font-semibold text-white/80 bg-black/40 px-2 py-1 rounded-md shrink-0">
              {((photoFile?.size ?? 0) / 1024 / 1024).toFixed(1)} MB
            </span>
          </div>
        </div>
      )}
      {error && <span className="text-xs font-semibold text-danger">{error}</span>}
    </div>
  );
}

// --- Shipment Details ---
export function CustomerShipmentSection({ register, errors, isActive, isCompleted }: any) {
  return (
    <CustomerFormSection step={1} title="Shipment Details" description="Define the package contents and weight." icon={PackageSearch} isActive={isActive} isCompleted={isCompleted}>
      <div className="grid gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink">Package Name</label>
            <input 
              className="flex h-11 w-full rounded-lg border border-border/60 bg-surface px-4 text-sm font-medium transition-all placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20" 
              placeholder="e.g. Corporate Documents" 
              {...register("itemName")} 
            />
            {errors.itemName && <span className="text-xs font-semibold text-danger">{errors.itemName.message}</span>}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink">Material Category</label>
            <input 
              className="flex h-11 w-full rounded-lg border border-border/60 bg-surface px-4 text-sm font-medium transition-all placeholder:text-muted/70 focus:border-primary focus:ring-2 focus:ring-primary/20" 
              placeholder="e.g. Archives / Electronics" 
              {...register("itemType")} 
            />
            {errors.itemType && <span className="text-xs font-semibold text-danger">{errors.itemType.message}</span>}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink">Gross Weight (KG)</label>
          <div className="relative max-w-[200px]">
            <input 
              type="number" step="0.1"
              className="flex h-11 w-full rounded-lg border border-border/60 bg-surface pl-4 pr-12 text-sm font-semibold transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" 
              placeholder="0.0" 
              {...register("weight")} 
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">KG</span>
          </div>
          {errors.weight && <span className="text-xs font-semibold text-danger">{errors.weight.message}</span>}
        </div>
      </div>
    </CustomerFormSection>
  );
}

// --- Receiver Details ---
export function CustomerReceiverSection({ register, errors, isActive, isCompleted }: any) {
  return (
    <CustomerFormSection step={2} title="Receiver Information" description="Who is receiving this package?" icon={User} isActive={isActive} isCompleted={isCompleted}>
      <div className="grid gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink">Full Name</label>
            <input className="flex h-11 w-full rounded-lg border border-border/60 bg-surface px-4 text-sm font-medium transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" {...register("receiverName")} />
            {errors.receiverName && <span className="text-xs font-semibold text-danger">{errors.receiverName.message}</span>}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink">Phone Number (Active)</label>
            <input className="flex h-11 w-full rounded-lg border border-border/60 bg-surface px-4 text-sm font-medium transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" {...register("receiverPhone")} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink">Notification Email (Optional)</label>
          <input type="email" className="flex h-11 w-full rounded-lg border border-border/60 bg-surface px-4 text-sm font-medium transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="For tracking updates" {...register("receiverEmail")} />
          {errors.receiverEmail && <span className="text-xs font-semibold text-danger">{errors.receiverEmail.message}</span>}
        </div>
      </div>
    </CustomerFormSection>
  );
}

// --- Service & Routing ---
export function CustomerServiceSection({ register, errors, branches, isActive, isCompleted }: any) {
  return (
    <CustomerFormSection step={3} title="Delivery Route" description="Select origin and destination branches." icon={MapPin} isActive={isActive} isCompleted={isCompleted}>
      <div className="grid gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink">Origin Branch</label>
            <select className="flex h-11 w-full appearance-none rounded-lg border border-border/60 bg-surface px-4 text-sm font-medium transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer" style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px' }} {...register("originBranchId")}>
              <option value="">Select Origin...</option>
              {branches.map((b: Branch) => <option key={b.id} value={b.id}>{b.city}</option>)}
            </select>
            {errors.originBranchId && <span className="text-xs font-semibold text-danger">{errors.originBranchId.message}</span>}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink">Destination Branch</label>
            <select className="flex h-11 w-full appearance-none rounded-lg border border-border/60 bg-surface px-4 text-sm font-medium transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer" style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px' }} {...register("destinationBranchId")}>
              <option value="">Select Destination...</option>
              {branches.map((b: Branch) => <option key={b.id} value={b.id}>{b.city}</option>)}
            </select>
            {errors.destinationBranchId && <span className="text-xs font-semibold text-danger">{errors.destinationBranchId.message}</span>}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink">Detailed Address & Instructions</label>
          <input className="flex h-11 w-full rounded-lg border border-border/60 bg-surface px-4 text-sm font-medium transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="Street name, District, Postal Code" {...register("receiverAddress")} />
          {errors.receiverAddress && <span className="text-xs font-semibold text-danger">{errors.receiverAddress.message}</span>}
          <input className="flex h-10 w-full rounded-lg border border-border/40 bg-slate-50/50 px-4 text-xs font-medium transition-all mt-2 placeholder:text-muted/60 focus:border-primary" placeholder="Additional delivery notes (Optional)" {...register("receiverNote")} />
        </div>
      </div>
    </CustomerFormSection>
  );
}

// --- Summary Sidebar ---
export function CustomerSummarySidebar({ 
  estimatedPrice, 
  weight, 
  rateLoading,
  submitting,
  register,
  availablePaymentMethods,
  isReadyToSubmit
}: any) {
  const formattedTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(estimatedPrice);
  
  return (
    <Card className="border border-border/40 bg-surface shadow-md sticky top-6 overflow-hidden flex flex-col">
      <CardHeader className="border-b border-border/40 bg-slate-900 p-6 text-white">
        <CardTitle className="text-sm font-semibold tracking-wide flex items-center gap-2">
          <FileText size={16} className="text-primary" /> Checkout Summary
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="p-6 space-y-6 flex-1">
          {/* Methods */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">Handover Method</label>
              <select className="flex h-10 w-full appearance-none rounded-lg border border-border/60 bg-surface px-3 text-xs font-semibold transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer" style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '28px' }} {...register("handoverMethod")}>
                <option value="drop_off">Drop Off at Branch</option>
                <option value="pickup">Courier Pickup</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted">Payment Gateway</label>
              <select className="flex h-10 w-full appearance-none rounded-lg border border-border/60 bg-surface px-3 text-xs font-semibold transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer" style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '28px' }} {...register("paymentMethod")}>
                {availablePaymentMethods.map((method: string) => (
                  <option key={method} value={method}>{method.toUpperCase().replace("_", " ")}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-px w-full bg-border/40" />

          {/* Ledger */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-medium text-muted">
              <span>Base Rate (x{weight || 0} KG)</span>
              <span>{rateLoading ? "Calculating..." : "-"}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-muted">
              <span>Pickup Fee</span>
              <span>-</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-muted">
              <span>Insurance & Tax</span>
              <span>Rp 0</span>
            </div>
          </div>
        </div>

        {/* Grand Total */}
        <div className="border-t border-border/40 bg-slate-50 p-6">
          <div className="flex items-end justify-between mb-6">
            <span className="text-xs font-semibold text-ink">Grand Total</span>
            <span className="text-xl font-bold tracking-tight text-primary">
              {rateLoading ? "..." : formattedTotal}
            </span>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0"
            disabled={submitting || !isReadyToSubmit}
          >
            {submitting ? "Processing Checkout..." : "Complete Checkout"}
          </Button>
          {!isReadyToSubmit && (
            <p className="text-[10px] text-center font-medium text-muted mt-3">
              Please complete all required sections first.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
