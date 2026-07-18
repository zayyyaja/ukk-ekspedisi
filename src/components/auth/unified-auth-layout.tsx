"use client";

import { ReactNode } from "react";
import { Package2, ShieldCheck, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnifiedAuthLayoutProps {
  children: ReactNode;
  context: "customer" | "staff" | "register";
}

export function UnifiedAuthLayout({ children, context }: UnifiedAuthLayoutProps) {
  return (
    <main className="relative flex min-h-screen font-body select-none bg-surface">
      {/* Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className={cn(
            "absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] blur-[140px] rounded-full transition-colors duration-1000",
            context === "staff" ? "bg-rose-500/10" : "bg-primary/5"
          )}
        />
      </div>

      <div className="relative z-10 w-full flex flex-col lg:flex-row">
        
        {/* ================= LEFT PANEL ================= */}
        <div className="hidden lg:flex w-5/12 xl:w-1/2 flex-col justify-between p-12 xl:p-20 border-r border-border/50 bg-surface/50 backdrop-blur-xl">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Package2 className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight text-ink uppercase">
              DRG-EKSPEDISI
            </span>
          </div>

          {/* Central Marketing Message */}
          <div className="max-w-md">
            <div className="mb-8">
              <div className="h-16 w-16 rounded-2xl bg-slate-100/80 border border-border/50 flex items-center justify-center mb-6 shadow-sm">
                <Package2 className="h-8 w-8 text-muted" />
              </div>
              <h1 className="text-4xl font-semibold leading-tight text-ink tracking-tight mb-4">
                Kelola logistik Anda, <br /> tanpa ribet.
              </h1>
              <p className="text-base text-muted leading-relaxed">
                Nikmati pengalaman manajemen rantai pasok generasi baru. Aman, real-time, dan terukur.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm font-medium text-muted">
                <ShieldCheck size={18} className="text-[#0F6E56]" />
                <span>Sesi terenkripsi end-to-end</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-muted">
                <ShieldCheck size={18} className="text-[#0F6E56]" />
                <span>Infrastruktur keamanan setara enterprise</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-muted">
                <ShieldCheck size={18} className="text-[#0F6E56]" />
                <span>Sinkronisasi data real-time</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-xs font-semibold text-muted tracking-tight uppercase">
            System Online • Secure Gateway
          </p>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div className="w-full lg:w-7/12 xl:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-12">
          <div className={cn("w-full", context === "register" ? "max-w-[500px]" : "max-w-[400px]")}>
            {/* Mobile Header (Only visible on small screens) */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Package2 className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight text-ink uppercase">
                DRG-EKSPEDISI
              </span>
            </div>

            {/* Render Auth Form / Card */}
            {children}
            
            {/* Mobile Footer Note */}
            <p className="lg:hidden mt-12 text-center text-[10px] font-semibold text-muted tracking-tight uppercase">
              System Online • Secure Gateway
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
