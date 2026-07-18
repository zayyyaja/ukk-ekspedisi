import { Loader2 } from "lucide-react";

export function FullPageLoader({ label = "Memuat..." }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-ink font-body">
      <div className="flex flex-col items-center gap-4 p-8 w-full max-w-sm text-center animate-in fade-in duration-300">
        
        {/* Minimal Enterprise Loading Indicator */}
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        
        <p className="text-sm font-medium text-muted tracking-tight" aria-live="polite">
          {label}
        </p>
      </div>
    </div>
  );
}