import React from "react";

export function FormLayout({ children, stickySummary }: { children: React.ReactNode; stickySummary?: React.ReactNode }) {
  if (stickySummary) {
    return (
      <div className="grid gap-8 items-start lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">{children}</div>
        <div className="relative">
          <div className="sticky top-24 flex flex-col gap-6">{stickySummary}</div>
        </div>
      </div>
    );
  }
  return <div className="flex flex-col gap-6">{children}</div>;
}

export function FormSection({ children, title, description, className }: { children: React.ReactNode; title: string; description?: string; className?: string }) {
  return (
    <section className={`flex flex-col gap-6 rounded-2xl border border-border/40 bg-surface p-6 shadow-sm ${className || ""}`}>
      {(title || description) && (
        <div className="border-b border-border/40 pb-4">
          {title && <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>}
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

export const FormField = React.forwardRef<HTMLInputElement, { label: string; error?: string; wrapperClassName?: string } & React.InputHTMLAttributes<HTMLInputElement>>(
  ({ label, error, wrapperClassName, className, ...props }, ref) => {
    return (
      <label className={`grid gap-2 ${wrapperClassName || ""}`}>
        <span className="text-sm font-semibold text-ink">
          {label} {props.required && <span className="text-rose-500">*</span>}
        </span>
        <input
          ref={ref}
          className={`h-10 rounded-xl border border-border/40 bg-transparent px-3 text-sm font-medium text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className || ""}`}
          {...props}
        />
        {error && <span className="text-[11px] font-medium text-destructive mt-0.5 block">{error}</span>}
      </label>
    );
  }
);
FormField.displayName = "FormField";

export const FormSelect = React.forwardRef<HTMLSelectElement, { label: string; error?: string; wrapperClassName?: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ label, error, children, wrapperClassName, className, ...props }, ref) => {
    return (
      <label className={`grid gap-2 ${wrapperClassName || ""}`}>
        <span className="text-sm font-semibold text-ink">
          {label} {props.required && <span className="text-rose-500">*</span>}
        </span>
        <select
          ref={ref}
          className={`h-10 rounded-xl border border-border/40 bg-transparent px-3 text-sm font-medium text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className || ""}`}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-[11px] font-medium text-destructive mt-0.5 block">{error}</span>}
      </label>
    );
  }
);
FormSelect.displayName = "FormSelect";

export const FormTextarea = React.forwardRef<HTMLTextAreaElement, { label: string; error?: string; wrapperClassName?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ label, error, wrapperClassName, className, ...props }, ref) => {
    return (
      <label className={`grid gap-2 ${wrapperClassName || ""}`}>
        <span className="text-sm font-semibold text-ink">
          {label} {props.required && <span className="text-rose-500">*</span>}
        </span>
        <textarea
          ref={ref}
          className={`min-h-[80px] rounded-xl border border-border/40 bg-transparent px-3 py-2 text-sm font-medium text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className || ""}`}
          {...props}
        />
        {error && <span className="text-[11px] font-medium text-destructive mt-0.5 block">{error}</span>}
      </label>
    );
  }
);
FormTextarea.displayName = "FormTextarea";

export function FormSummaryPanel({ title, items, totalLabel, totalValue, button }: { title: string; items: { label: string; value: React.ReactNode }[]; totalLabel?: string; totalValue?: React.ReactNode; button?: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-border/40 bg-surface p-6 shadow-sm">
      <div className="border-b border-border/40 pb-4">
        <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
      </div>
      
      <div className="flex flex-col gap-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-sm">
            <span className="text-muted font-medium">{item.label}</span>
            <span className="text-ink font-semibold">{item.value}</span>
          </div>
        ))}
        
        {totalLabel && totalValue && (
          <div className="flex justify-between items-center border-t border-border/40 pt-4 mt-2">
            <span className="text-sm font-semibold text-ink">{totalLabel}</span>
            <span className="text-xl font-bold tracking-tight text-primary">{totalValue}</span>
          </div>
        )}
      </div>

      {button && <div className="pt-2">{button}</div>}
    </section>
  );
}
