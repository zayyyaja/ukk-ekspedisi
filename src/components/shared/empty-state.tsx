import type { LucideIcon } from "lucide-react";
import { PackageOpen } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function EmptyState({
  title = "Belum ada data",
  description = "Data akan muncul setelah aktivitas tersedia.",
  icon: Icon = PackageOpen,
  action,
  className,
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="grid min-h-48 place-items-center p-6 text-center">
        <div className="mx-auto max-w-sm space-y-3">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className={cn("mt-1 text-sm text-muted-foreground")}>{description}</p>
          </div>
          {action ? <div className="pt-2">{action}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
