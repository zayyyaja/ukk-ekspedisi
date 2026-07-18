"use client";

import { useEffect, useState } from "react";
import { Search, Package, Users, Settings, LogOut, LayoutDashboard, Truck, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export function CommandMenu({
  open,
  onOpenChange,
  role,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const items = [
    { name: "Dashboard", icon: LayoutDashboard, path: `/staff/${role}/dashboard` },
    { name: "Buat Pengiriman Baru", icon: Package, path: `/staff/${role}/dashboard` },
    { name: "Manajemen Kurir", icon: Truck, path: `/staff/${role}/dashboard` },
    { name: "Laporan Kinerja", icon: FileText, path: `/staff/${role}/dashboard` },
    { name: "Pengaturan Cabang", icon: Settings, path: `/staff/${role}/dashboard` },
  ];

  const filtered = items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden border border-border/40 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] gap-0 max-w-xl rounded-2xl bg-surface/80 backdrop-blur-2xl">
        <DialogTitle className="sr-only">Command Menu</DialogTitle>
        <div className="flex items-center border-b border-border/40 px-4 py-4 bg-transparent">
          <Search className="h-5 w-5 text-muted shrink-0 mr-3" strokeWidth={1.5} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex h-10 w-full rounded-md bg-transparent text-base font-medium outline-none placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50 text-ink"
            placeholder="Ketik perintah atau pencarian..."
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-border/50 bg-slate-50/50 px-2 text-[10px] font-bold text-muted uppercase tracking-tight shadow-sm">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 bg-transparent">
          {filtered.length === 0 ? (
            <div className="py-14 text-center text-sm text-muted">
              Tidak ada hasil yang ditemukan untuk "{query}".
            </div>
          ) : (
            <div className="flex flex-col gap-1 px-1 py-2">
              <div className="px-3 pb-2 text-[10px] font-bold text-muted/60 uppercase tracking-tight">
                Aksi Cepat
              </div>
              {filtered.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onOpenChange(false);
                    router.push(item.path);
                  }}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-ink transition-all hover:bg-primary/10 hover:text-primary text-left"
                >
                  <item.icon className="h-4 w-4 text-muted group-hover:text-primary shrink-0 transition-colors" strokeWidth={2} />
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
