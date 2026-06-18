import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function FilterBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className={cn("flex flex-wrap items-center gap-3 p-4")}>
        {children}
      </CardContent>
    </Card>
  );
}
