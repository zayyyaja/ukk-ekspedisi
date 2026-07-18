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

const menu = [
  { href: "/customer", label: "Dashboard", icon: null },
  { href: "/customer/lacak-resi", label: "Lacak Paket", icon: Search },
  { href: "/customer/buat-pesanan", label: "Buat Pesanan", icon: PackagePlus },
  { href: "/customer/inbox", label: "Inbox", icon: Mail },
  { href: "/customer/profile", label: "Profil", icon: UserRound },
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

    apiGet<{ unreadCount: number }>("/api/v2/customer/notifications/summary")
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
    return <FullPageLoader label="Memuat..." />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-body text-ink selection:bg-primary/20">
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-surface/80 backdrop-blur-xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all">
        <div className="mx-auto w-full max-w-[1400px] px-6 lg:px-10 flex h-16 items-center justify-between">

          <Link className="flex items-center gap-2.5 group" href="/customer">
            <span className="text-base font-semibold tracking-tight text-ink">
              DRG-EKSPEDISI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {menu.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={cn(
                  "relative text-sm font-medium transition-all px-3 py-1.5 rounded-full",
                  isActive(pathname, item.href)
                    ? "bg-slate-100/80 text-ink shadow-sm"
                    : "text-muted hover:text-ink hover:bg-slate-50"
                )}
              >
                {item.label}
                {item.href === "/customer/inbox" && unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center border border-border bg-danger px-1.5 text-[10px] font-bold text-white rounded-full animate-bounce">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            ))}

            <div className="ml-4 flex items-center border-l border-border/50 pl-6">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-muted hover:text-ink hover:bg-slate-50 text-sm font-medium transition-all rounded-full px-3 h-8"
              >
                Sign out
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-4 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-ink hover:bg-slate-100 rounded-lg">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 border-r border-border bg-surface p-6 shadow-xl">
                <SheetHeader className="mb-8 text-left border-b border-border pb-4">
                  <SheetTitle className="flex items-center gap-2.5">
                    <span className="text-base font-semibold tracking-tight text-ink">
                      DRG-EKSPEDISI
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
                          "flex items-center px-4 py-3 text-sm font-medium transition-all rounded-md",
                          isActive(pathname, item.href)
                            ? "bg-slate-100 text-ink shadow-sm"
                            : "text-muted hover:bg-slate-50 hover:text-ink"
                        )}
                      >
                        {Icon && <Icon className="mr-3 h-4 w-4" />}
                        {item.label}
                        {item.href === "/customer/inbox" && unreadCount > 0 && (
                          <span className="ml-auto flex h-5 min-w-5 items-center justify-center border border-border bg-danger px-1.5 text-[10px] font-bold text-white rounded-full">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-8 border-t border-border pt-6">
                  <Button
                    onClick={handleLogout}
                    className="w-full border border-border bg-surface text-ink hover:bg-slate-50 text-xs font-medium shadow-sm transition-all rounded-md cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </header>

      {/* Main Layout Wrappers */}
      {fullWidth ? (
        <main className="w-full flex-1 mx-auto max-w-[1400px]">
          {children}
        </main>
      ) : (
        <main className="w-full flex-1 mx-auto max-w-[1400px] px-6 lg:px-10 py-8 lg:py-12">
          {children}
        </main>
      )}
    </div>
  );
}