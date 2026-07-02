import { Loader2 } from "lucide-react";

export function FullPageLoader({ label = "Memuat..." }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 backdrop-blur-md transition-all duration-300">
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
        <img src="/images/logo.png" alt="Logo" className="h-24 w-24 object-contain animate-pulse" />
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
        <p className="text-xl font-bold tracking-wider text-slate-900">{label}</p>
      </div>
    </div>
  );
}
