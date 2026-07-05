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
  { href: "/customer", label: "BERANDA", icon: null },
  { href: "/customer/lacak-paket", label: "CARI PAKET", icon: Search },
  { href: "/customer/buat-pesanan", label: "KIRIM PAKET", icon: PackagePlus },
  { href: "/customer/inbox", label: "INBOX", icon: Mail },
  { href: "/customer/profile", label: "PROFIL", icon: UserRound },
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
    return <FullPageLoader label="Memuat portal customer..." />;
  }

  const isHome = pathname === "/customer" || pathname === "/customer/";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header
        className={cn(
          "z-40 p-4 transition-all duration-300",
          isHome
            ? cn(
              "fixed top-0 left-0 right-0",
              scrolled
                ? "bg-white/20 border-b border-white/30 backdrop-blur-xl"
                : "bg-transparent border-b border-transparent"
            )
            : "sticky top-0 bg-white border-b border-slate-200"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">

          {/* Brand */}
          <Link className="flex items-center gap-2.5" href="/customer">
            <div className="relative flex h-8 w-8 items-center justify-center">
              <img
                src="/images/logo.png"
                alt="Logo Icon"
                className="h-7 w-7 object-contain"
              />
            </div>
            <span className={cn(
              "font-space text-xl font-bold tracking-tight transition-colors duration-300",
              isHome && !scrolled ? "text-white" : "text-slate-950"
            )}>
              ANTERIN
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {menu.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={cn(
                  "relative text-sm font-medium transition-colors duration-300 hover:text-orange-500",
                  isActive(pathname, item.href)
                    ? "text-orange-500"
                    : (isHome && !scrolled ? "text-white/90" : "text-slate-950")
                )}
              >
                {item.label}
                {item.href === "/customer/inbox" && unreadCount > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            ))}

            <div className="ml-4 flex items-center border-l border-slate-200 pl-8">
              <Button
                onClick={handleLogout}
                className="bg-red-600 text-white hover:bg-red-700 font-medium transition-colors focus-visible:ring-0 outline-none"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </nav>

          {/* Mobile Menu */}
          <div className="flex items-center gap-4 md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(
                  "transition-colors",
                  isHome && !scrolled ? "text-white" : "text-slate-950"
                )}>
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] border-r-0 bg-white p-6">
                <SheetHeader className="mb-8 text-left">
                  <SheetTitle className="flex items-center gap-2.5">
                    <div className="relative flex h-8 w-8 items-center justify-center">
                      <img src="/images/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
                    </div>
                    <span className="font-space text-lg font-bold">
                      ANTERIN
                    </span>
                  </SheetTitle>
                </SheetHeader>

                <nav className="grid gap-2">
                  {menu.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={`${item.href}-${item.label}`}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                          isActive(pathname, item.href)
                            ? "bg-orange-50 text-orange-500"
                            : "text-slate-600 hover:bg-slate-100 hover:text-orange-500"
                        )}
                      >
                        {Icon && <Icon className="mr-3 h-5 w-5" />}
                        {item.label}
                        {item.href === "/customer/inbox" && unreadCount > 0 && (
                          <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </nav>

                <div className="mt-8 border-t border-slate-200 pt-6">
                  <Button
                    onClick={handleLogout}
                    className="w-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </header>

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
