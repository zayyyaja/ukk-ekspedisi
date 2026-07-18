"use client";

import { Menu, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { AuthModal } from "@/components/public/auth-modal";

function Brand() {
  return (
    <Link className="flex items-center group" href="/">
      <span className="text-base font-semibold tracking-tight text-ink">
        DRG-EKSPEDISI
      </span>
    </Link>
  );
}

const navItems = [
  { href: "/", label: "Beranda", action: "link" },
  { href: "#", label: "Cari Paket", action: "modal" },
  { href: "#", label: "Kirim Paket", action: "modal" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/" || pathname === "";
  }
  return pathname.startsWith(href);
}

export function PublicNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/";

  return (
    <>
      <header
        className={cn(
          "z-40 transition-all duration-200 font-body w-full",
          isHome
            ? cn(
                "fixed top-0 left-0 right-0",
                scrolled
                  ? "bg-surface border-b border-border/40 shadow-sm py-3"
                  : "bg-surface border-b border-border/40 py-3"
              )
            : "sticky top-0 bg-surface border-b border-border/40 py-3 shadow-sm"
        )}
      >
        <div className="page-container flex h-12 items-center justify-between px-6 md:px-8">
          
          {/* Kiri: Brand */}
          <Brand />

          {/* Tengah: Navigasi Desktop Link */}
          <nav className="hidden items-center justify-center gap-10 md:flex absolute left-1/2 -translate-x-1/2 h-full">
            {navItems.map((item) => (
              item.action === "modal" ? (
                <AuthModal key={item.label}>
                  <button
                    className="h-full flex items-center text-sm font-medium transition-colors text-muted hover:text-[#0C447C] cursor-pointer"
                  >
                    {item.label}
                  </button>
                </AuthModal>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "h-full flex items-center text-sm transition-colors border-b-2",
                    isActive(pathname, item.href)
                      ? "text-[#0C447C] font-semibold border-[#0C447C]"
                      : "text-muted font-medium border-transparent hover:text-[#0C447C]"
                  )}
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* Kanan: Tombol Gerbang Masuk Portal */}
          <div className="flex items-center justify-end w-full md:w-auto gap-4 pl-12">
            
            <div className="hidden md:block">
              <Button asChild size="sm" className="font-semibold px-6 cursor-pointer bg-[#0C447C] text-white hover:bg-[#0C447C]/90 shadow-none h-9 rounded-lg">
                <Link href="/customer/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Portal masuk
                </Link>
              </Button>
            </div>

            {/* Menu Drawer HP (Mobile) */}
            <Sheet onOpenChange={setOpen} open={open}>
              <SheetTrigger asChild>
                <Button
                  className="md:hidden"
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Buka Menu</span>
                </Button>
              </SheetTrigger>
              
              <SheetContent side="right" className="w-72 border-l border-border bg-surface p-6 font-body shadow-xl">
                <div className="flex items-center pb-6 border-b border-border">
                  <span className="text-base font-semibold tracking-tight text-ink">
                    DRG-EKSPEDISI
                  </span>
                </div>
                
                {/* Mobile Menu List */}
                <nav className="mt-8 grid gap-1">
                  {navItems.map((item) => (
                    item.action === "modal" ? (
                      <AuthModal key={item.label}>
                        <button
                          className="w-full text-left rounded-lg px-4 py-3 text-sm font-medium text-muted transition-colors hover:text-[#0C447C] hover:bg-slate-50"
                        >
                          {item.label}
                        </button>
                      </AuthModal>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "w-full rounded-lg px-4 py-3 text-sm transition-colors",
                          isActive(pathname, item.href)
                            ? "text-[#0C447C] font-semibold bg-slate-50"
                            : "text-muted font-medium hover:text-[#0C447C] hover:bg-slate-50"
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )
                  ))}
                </nav>

                {/* Mobile CTA Portal Masuk */}
                <div className="mt-6 grid gap-2 border-t border-border pt-6">
                  <Button asChild size="lg" className="w-full font-semibold bg-[#0C447C] text-white hover:bg-[#0C447C]/90 shadow-none">
                    <Link href="/customer/login" onClick={() => setOpen(false)}>
                      <LogIn className="mr-2 h-4 w-4" />
                      Portal masuk
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

          </div>
        </div>
      </header>
      {!isHome && <div className="h-14" />}
    </>
  );
}