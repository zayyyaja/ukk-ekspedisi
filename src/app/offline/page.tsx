import { WifiOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface font-body p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
          <WifiOff size={48} strokeWidth={1.5} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-ink">
            Anda sedang offline
          </h1>
          <p className="text-muted text-[15px] leading-relaxed">
            Sepertinya Anda terputus dari jaringan internet. Harap periksa koneksi data atau Wi-Fi Anda, lalu coba lagi.
          </p>
        </div>

        <Button asChild size="lg" className="w-full">
          <Link href="/">Coba Muat Ulang</Link>
        </Button>
      </div>
    </div>
  );
}
