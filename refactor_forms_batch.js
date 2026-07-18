const fs = require('fs');
const path = require('path');

function refactorStaffPages() {
  const filePath = path.join(__dirname, 'src', 'components', 'staff', 'staff-pages.tsx');
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Add imports
  if (!content.includes('import { FormSection, FormField }')) {
    content = content.replace(
      'import { ActionMenu } from "@/components/staff/action-menu";',
      'import { ActionMenu } from "@/components/staff/action-menu";\nimport { FormSection, FormField } from "@/components/ui/form-system";'
    );
  }

  // Refactor MasterForm
  const masterFormRegex = /function MasterForm\([\s\S]*?return \([\s\S]*?<\/form>\s*\);\s*\}/m;
  const masterFormMatch = content.match(masterFormRegex);

  if (masterFormMatch) {
    const newMasterForm = `function MasterForm({
  title,
  fields,
  onSubmit,
}: {
  title: string;
  fields: string[];
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSubmit(new FormData(event.currentTarget));
      event.currentTarget.reset();
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Gagal menyimpan data.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormSection title={title}>
        {fields.map((field) => (
          <FormField
            key={field}
            name={field}
            label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()}
            type={field.toLowerCase().includes("password") ? "password" : "text"}
            required
          />
        ))}
        {error && (
          <div className="md:col-span-2 border border-destructive/20 bg-destructive/5 p-3 text-sm font-medium text-destructive rounded-xl">
            {error}
          </div>
        )}
        <div className="md:col-span-2 flex justify-end pt-2">
          <button
            className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            disabled={busy}
            type="submit"
          >
            {busy ? "Menyimpan..." : "Simpan Data"}
          </button>
        </div>
      </FormSection>
    </form>
  );
}`;
    content = content.replace(masterFormRegex, newMasterForm);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Refactored staff-pages.tsx');
  }
}

function refactorBuatPesanan() {
  const filePath = path.join(__dirname, 'src', 'app', 'customer', 'buat-pesanan', 'page.tsx');
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Add imports
  if (!content.includes('import { FormLayout, FormSection, FormField, FormSelect, FormSummaryPanel }')) {
    content = content.replace(
      'import { CustomerNavbarShell } from "@/components/customer/customer-navbar-shell";',
      'import { CustomerNavbarShell } from "@/components/customer/customer-navbar-shell";\nimport { FormLayout, FormSection, FormField, FormSelect, FormSummaryPanel } from "@/components/ui/form-system";'
    );
  }

  // Replace form
  const formRegex = /<form onSubmit=\{handleSubmit\(onSubmit\)\} className="space-y-8">[\s\S]*?<\/form>/m;
  const formMatch = content.match(formRegex);

  if (formMatch) {
    const newForm = `<form onSubmit={handleSubmit(onSubmit)}>
          <FormLayout
            stickySummary={
              <FormSummaryPanel
                title="Summary & Payment"
                items={[
                  { label: "Rate per KG", value: rateLoading ? "Loading..." : rate ? formatCurrency(rate.price_per_kg) : "-" },
                  { label: "Total Weight", value: Number(values.weight || 0) + " KG" },
                  { label: "Pickup Fee", value: handoverMethod === "pickup" ? formatCurrency(10000) : formatCurrency(0) },
                ]}
                totalLabel="Total Price"
                totalValue={formatCurrency(estimatedPrice)}
                button={
                  <button 
                    className="flex w-full h-11 items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-sm shadow-sm transition-all hover:bg-primary/90 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed" 
                    disabled={submitting} 
                    type="submit"
                  >
                    {submitting ? "Processing..." : "Place Order"}
                  </button>
                }
              />
            }
          >
            <FormSection title="Package Details" description="Tell us about the package you are sending.">
              <FormField label="Item Name" placeholder="e.g. Document" required {...register("itemName")} error={errors.itemName?.message} />
              <FormField label="Material Type" placeholder="e.g. Paper" required {...register("itemType")} error={errors.itemType?.message} />
              <FormField label="Weight (KG)" type="number" step="0.1" placeholder="0.0" required {...register("weight")} error={errors.weight?.message} />
              
              <div className="grid gap-2 md:col-span-2">
                <span className="text-sm font-semibold text-ink">Photo (Required)</span>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

                {!photoPreview ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-32 cursor-pointer flex-col items-center justify-center border border-dashed border-border/60 bg-background/50 text-center p-4 transition-colors hover:border-primary hover:bg-primary/5 rounded-xl shadow-sm"
                  >
                    <UploadCloud size={24} className="text-muted mb-2 transition-colors" />
                    <p className="text-sm font-medium text-ink">Click to upload photo</p>
                    <p className="mt-1 text-xs text-muted">JPG, PNG (max. 5MB)</p>
                  </div>
                ) : (
                  <div className="relative overflow-hidden border border-border/40 rounded-xl h-48 shadow-sm">
                    <Image src={photoPreview} alt="Preview" fill className="object-cover" />
                    <button 
                      type="button" 
                      onClick={removePhoto}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center bg-surface/90 text-destructive shadow-sm rounded-full backdrop-blur-md hover:bg-surface transition-all cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </FormSection>

            <FormSection title="Receiver Identity" description="Who is receiving this package?">
              <FormField label="Full Name" required {...register("receiverName")} error={errors.receiverName?.message} />
              <FormField label="Phone Number" required {...register("receiverPhone")} error={errors.receiverPhone?.message} />
              <FormField label="Email (Optional)" type="email" placeholder="For automated updates" wrapperClassName="md:col-span-2" {...register("receiverEmail")} error={errors.receiverEmail?.message} />
            </FormSection>

            <FormSection title="Destination Route" description="Where should we send it?">
              <FormSelect label="Origin Branch" required {...register("originBranchId")} error={errors.originBranchId?.message}>
                <option value="">Select Branch</option>
                {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.city}</option>)}
              </FormSelect>
              <FormSelect label="Destination City" required {...register("destinationBranchId")} error={errors.destinationBranchId?.message}>
                <option value="">Select City</option>
                {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.city}</option>)}
              </FormSelect>
              
              <div className="grid gap-2 md:col-span-2">
                <span className="text-sm font-semibold text-ink">Full Address & Note</span>
                <input className="h-10 rounded-xl border border-border/40 bg-transparent px-3 text-sm font-medium text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all" placeholder="Street name, details, postal code" {...register("receiverAddress")} />
                {errors.receiverAddress && <span className="text-[11px] font-medium text-destructive block mt-0.5">{errors.receiverAddress.message}</span>}
                <input className="h-10 rounded-xl border border-border/40 bg-surface px-3 text-sm font-medium text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all mt-1" placeholder="Additional instructions (Optional)" {...register("receiverNote")} />
              </div>
            </FormSection>

            <FormSection title="Logistics & Payment" description="Select handover and payment methods.">
              <FormSelect label="Handover Method" required {...register("handoverMethod")}>
                <option value="drop_off">Drop Off</option>
                <option value="pickup">Courier Pickup</option>
              </FormSelect>
              <FormSelect label="Payment Method" required {...register("paymentMethod")}>
                {availablePaymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method === 'cash' ? 'Cash at Branch' : method === 'qris' ? 'QRIS' : method.toUpperCase()}
                  </option>
                ))}
              </FormSelect>
              
              <div className="md:col-span-2 border border-primary/20 bg-primary/5 p-4 rounded-xl flex gap-3 items-start mt-2">
                <ShieldCheck size={18} className="text-primary shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-ink leading-relaxed">
                  {handoverMethod === "drop_off" 
                    ? "Drop Off: Please bring your package to the origin branch you selected." 
                    : "Pickup: Our courier will pick up the package from your location (+Rp 10.000). Online payment is required."
                  }
                </p>
              </div>
            </FormSection>
          </FormLayout>
        </form>`;
    
    content = content.replace(formRegex, newForm);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Refactored buat-pesanan/page.tsx');
  }
}

refactorStaffPages();
refactorBuatPesanan();
