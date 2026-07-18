"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    position="bottom-right"
    toastOptions={{
      classNames: {
        toast: "group border border-border/40 bg-surface text-ink shadow-lg rounded-xl font-body",
        description: "text-muted text-[13px]",
        actionButton: "bg-primary text-white hover:bg-primary/90 transition-colors rounded-lg",
        cancelButton: "bg-surface border border-border/40 text-ink hover:bg-slate-50 transition-colors rounded-lg",
      },
    }}
    {...props}
  />
);

export { Toaster };
