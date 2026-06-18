"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    position="top-right"
    toastOptions={{
      classNames: {
        toast: "border border-border bg-card text-card-foreground",
        description: "text-muted-foreground",
        actionButton: "bg-primary text-primary-foreground",
        cancelButton: "bg-muted text-foreground",
      },
    }}
    {...props}
  />
);

export { Toaster };
