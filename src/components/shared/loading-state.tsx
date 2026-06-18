import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState({
  title = "Memuat data",
  rows = 3,
}: {
  title?: string;
  rows?: number;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {title}
        </div>
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton className="h-5 w-full" key={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
