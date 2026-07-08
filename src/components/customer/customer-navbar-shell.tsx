"use client";

import { LogOut, Mail, Menu, PackagePlus, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { customerLogout, getCurrentUser } from "@/lib/auth-client";
import { apiGet } from "@/lib/api-client";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Label menu dirombak total menjadi terminologi manifes kargo industrial yang tegas
const menu = [
  { href: "/customer", label: "DASHBOARD UTAMA", icon: null },
  { href: "/customer/lacak-paket", label: "PELACAKAN RESI", icon: Search },
  { href: "/customer/buat-pesanan", label: "MANIFES BARU", icon: PackagePlus },
  { href: "/customer/inbox", label: "KOTAK MASUK", icon: Mail },
  { href: "/customer/profile", label: "BERKAS PROFIL", icon: UserRound },
];

function isActive(pathname: string, href: string) {
  if (href === "/customer") {
    return pathname === "/customer" || pathname === "/customer/";
  }
  return pathname.startsWith(href);
}

export function CustomerNavbarShell({
  children,
  fullWidth = false
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let mounted = true;

    getCurrentUser()
      .then((res) => {
        if (mounted) setUser(res.data as Record<string, unknown>);
      })
      .catch(() => null)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    apiGet<{ unreadCount: number }>("/api/v1/customer/notifications/summary")
      .then((response) => {
        if (mounted) setUnreadCount(response.data.unreadCount ?? 0);
      })
      .catch(() => null);

    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    await customerLogout().catch(() => null);
    router.replace("/customer/login");
  }

  if (loading) {
    // Teks loader disesuaikan dengan koridor logistik militer/industrial
    return <FullPageLoader label="[!] MENYINKRONKAN OTENTIKASI SISTEM KLIEN..." />;
  }

  const isHome = pathname === "/customer" || pathname === "/customer/";

  return (
    <div className="flex min-h-screen flex-col bg-paper font-body selection:bg-amber-400 selection:text-ink">
      <header
        className={cn(
          "z-40 p-4 transition-all duration-300",
          isHome
            ? cn(
                "fixed top-0 left-0 right-0",
                scrolled
                  ? "bg-paper/90 border-b-2 border-ink backdrop-blur-md shadow-stamp-xs"
                  : "bg-transparent border-b-2 border-transparent"
              )
            : "sticky top-0 bg-paper border-b-2 border-ink shadow-stamp-xs"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">

          {/* Brand - Gaya Industri Kontras Tinggi */}
          <Link className="flex items-center gap-2.5 group" href="/customer">
            <div className="relative flex h-9 w-9 items-center justify-center border-2 border-ink bg-amber-400 rounded-app p-1 shadow-stamp-xs transition-transform group-hover:-translate-x-px group-hover:-translate-y-px">
              <img
                src="/images/logo.png"
                alt="danishekspedisi Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <span className={cn(
              "font-mono text-lg font-black tracking-wider transition-colors duration-300",
              isHome && !scrolled ? "text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]" : "text-ink"
            )}>
              dEkspedisi
            </span>
          </Link>

          {/* Desktop Navigation - Neo-Brutalist Tabs */}
          <nav className="hidden items-center gap-6 md:flex">
            {menu.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={cn(
                  "relative font-mono text-xs font-black tracking-wide uppercase px-3 py-1.5 border-2 border-transparent transition-all rounded-app",
                  isActive(pathname, item.href)
                    ? "border-ink bg-amber-400 text-ink shadow-stamp-xs"
                    : isHome && !scrolled
                      ? "text-white hover:border-white/40 hover:bg-white/10"
                      : "text-ink hover:border-ink hover:bg-slate-100"
                )}
              >
                {item.label}
                {item.href === "/customer/inbox" && unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center border-2 border-ink bg-red-400 px-1 text-[9px] font-mono font-black text-white rounded-full shadow-none animate-bounce">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            ))}

            <div className="ml-2 flex items-center border-l-2 border-ink pl-6">
              <Button
                onClick={handleLogout}
                className="border-2 border-ink bg-red-400 text-white hover:bg-red-500 font-mono text-xs font-black uppercase tracking-wider shadow-stamp-xs transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-stamp-sm active:translate-x-0 active:translate-y-0 rounded-app cursor-pointer"
              >
                <LogOut className="mr-2 h-3.5 w-3.5 stroke-[2.5]" />
                KELUAR SISTEM
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-4 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(
                  "border-2 border-ink rounded-app shadow-stamp-xs bg-paper transition-all active:translate-x-0 active:translate-y-0 active:shadow-stamp-xs cursor-pointer",
                  isHome && !scrolled ? "text-ink border-white bg-white/20 hover:bg-white/40" : "text-ink hover:bg-slate-100"
                )}>
                  <Menu className="h-5 w-5 stroke-[2.5]" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 border-r-4 border-ink bg-paper p-6 shadow-stamp">
                <SheetHeader className="mb-8 text-left border-b-2 border-ink pb-4">
                  <SheetTitle className="flex items-center gap-2.5">
                    <div className="relative flex h-8 w-8 items-center justify-center border-2 border-ink bg-amber-400 rounded-app p-1 shadow-stamp-xs">
                      <img src="/images/logo.png" alt="Logo" className="h-full w-full object-contain" />
                    </div>
                    <span className="font-mono text-base font-black tracking-wider text-ink">
                      dEkspedisi
                    </span>
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Navigation List */}
                <nav className="grid gap-2">
                  {menu.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={`${item.href}-${item.label}`}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center border-2 border-ink rounded-app px-4 py-3 font-mono text-xs font-black uppercase tracking-wide transition-all shadow-stamp-xs active:translate-x-0 active:translate-y-0",
                          isActive(pathname, item.href)
                            ? "bg-amber-400 text-ink -translate-x-px -translate-y-px shadow-stamp-sm"
                            : "bg-white text-ink hover:-translate-x-px hover:-translate-y-px hover:shadow-stamp-sm"
                        )}
                      >
                        {Icon && <Icon className="mr-3 h-4 w-4 stroke-[2.5]" />}
                        {item.label}
                        {item.href === "/customer/inbox" && unreadCount > 0 && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center border-2 border-ink bg-red-400 px-1 text-[9px] font-mono font-black text-white rounded-full">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-8 border-t-2 border-ink pt-6">
                  <Button
                    onClick={handleLogout}
                    className="w-full border-2 border-ink bg-red-400 text-white hover:bg-red-500 font-mono text-xs font-black uppercase tracking-wider shadow-stamp-xs transition-all hover:-translate-x-px hover:-translate-y-px hover:shadow-stamp-sm rounded-app cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4 stroke-[2.5]" />
                    KELUAR SISTEM
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </header>

      {/* Main Layout Wrappers */}
      {fullWidth ? (
        <main className="w-full flex-1">
          {children}
        </main>
      ) : (
        <main className="mx-auto w-full flex-1 max-w-7xl px-4 py-8 lg:px-10">
          {children}
        </main>
      )}
    </div>
  );
}