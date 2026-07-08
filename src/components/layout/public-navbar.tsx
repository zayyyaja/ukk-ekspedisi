"use client";

import { Menu, LogIn } from "lucide-react";
import Link from "next/link"; // FIX: Mengembalikan import ke next/link asli
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { AuthModal } from "@/components/public/auth-modal";

const navItems = [
  { href: "/", label: "BERANDA", action: "link" },
  { href: "#", label: "CARI PAKET", action: "modal" },
  { href: "#", label: "KIRIM PAKET", action: "modal" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/" || pathname === "";
  }
  return pathname.startsWith(href);
}

function Brand() {
  return (
    <Link className="flex items-center gap-3 group" href="/">
      {/* Logo Wrapper Kotak Kokoh - Warna Asli */}
      <div className="relative flex h-10 w-10 items-center justify-center border-2 border-slate-900 bg-amber-400 rounded-sm transition-transform group-hover:-translate-y-px shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
        <img
          src="/images/logo.png"
          alt="Danish Ekspedisi Logo"
          className="h-7 w-7 object-contain"
        />
      </div>
      <span className="font-mono text-base font-black tracking-tighter text-slate-900 uppercase">
        danish<span className="text-amber-400 bg-slate-900 px-1.5 py-0.5 ml-1 rounded-sm shadow-[2px_2px_0px_0px_rgba(244,63,94,1)]">Ekspedisi</span>
      </span>
    </Link>
  );
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
          "z-40 transition-all duration-200 border-slate-900 font-mono",
          isHome
            ? cn(
                "fixed top-0 left-0 right-0",
                scrolled
                  ? "bg-white/95 backdrop-blur-md border-b-2 py-2 shadow-[0_4px_0_0_rgba(15,23,42,0.05)]"
                  : "bg-transparent border-b-0 py-4"
              )
            : "sticky top-0 bg-white border-b-2 py-2"
        )}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 lg:px-10">
          
          {/* Kiri: Logo & Nama Brand */}
          <Brand />

          {/* Tengah: Navigasi Desktop Link */}
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              item.action === "modal" ? (
                <AuthModal key={item.label}>
                  <button
                    className="px-4 py-2 text-3xs font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:bg-slate-900/5 rounded-sm transition-all cursor-pointer"
                  >
                    {item.label}
                  </button>
                </AuthModal>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-3xs font-black uppercase tracking-wider transition-all rounded-sm",
                    isActive(pathname, item.href)
                      ? "bg-slate-900 text-amber-400 shadow-[2px_2px_0px_0px_rgba(244,63,94,1)]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-900/5"
                  )}
                >
                  {item.label}
                </Link>
              )
            ))}
          </nav>

          {/* Kanan: Tombol Gerbang Masuk Portal */}
          <div className="flex items-center gap-4">
            
            <div className="hidden md:block">
              <Button
                asChild
                className="bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] text-3xs font-black uppercase tracking-wider h-9 px-5 rounded-sm transition-all cursor-pointer"
              >
                <Link href="/login">
                  <LogIn className="mr-1.5 h-3.5 w-3.5 text-slate-950 stroke-3" />
                  Portal Masuk
                </Link>
              </Button>
            </div>

            {/* Menu Drawer HP (Mobile) */}
            <Sheet onOpenChange={setOpen} open={open}>
              <SheetTrigger asChild>
                <Button
                  className="md:hidden border-2 border-slate-900 bg-white text-slate-900 hover:bg-slate-100 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] rounded-sm"
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Menu className="h-5 w-5 stroke-3" />
                  <span className="sr-only">Buka Menu</span>
                </Button>
              </SheetTrigger>
              
              <SheetContent side="right" className="w-72 border-l-4 border-slate-900 bg-white p-6 font-mono">
                <SheetHeader className="border-b-2 border-slate-100 pb-4">
                  <SheetTitle className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center border-2 border-slate-900 bg-amber-400 rounded-sm">
                      <img
                        src="/images/logo.png"
                        alt="Logo"
                        className="h-5 w-5 object-contain"
                      />
                    </div>
                    <span className="text-sm font-black tracking-tighter text-slate-900 uppercase">
                      danish<span className="text-amber-400 bg-slate-900 px-1 ml-0.5 rounded-sm">Ekspedisi</span>
                    </span>
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Menu List */}
                <nav className="mt-6 grid gap-2">
                  {navItems.map((item) => (
                    item.action === "modal" ? (
                      <AuthModal key={item.label}>
                        <button
                          className="w-full text-left font-black uppercase tracking-wide rounded-sm border-2 border-transparent px-3 py-2 text-3xs text-slate-600 hover:bg-slate-50 hover:border-slate-900 transition-all"
                        >
                          {item.label}
                        </button>
                      </AuthModal>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "font-black uppercase tracking-wide rounded-sm border-2 px-3 py-2 text-3xs transition-all",
                          isActive(pathname, item.href)
                            ? "bg-slate-900 text-amber-400 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
                            : "text-slate-600 border-transparent hover:bg-slate-50 hover:border-slate-900"
                        )}
                      >
                        {item.label}
                      </Link>
                    )
                  ))}
                </nav>

                {/* Mobile CTA Portal Masuk */}
                <div className="mt-6 grid gap-2 border-t-2 border-slate-100 pt-4">
                  <Button
                    asChild
                    className="w-full bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] font-black uppercase tracking-wider h-11 rounded-sm text-3xs"
                  >
                    <Link href="/login" onClick={() => setOpen(false)}>
                      <LogIn className="mr-1.5 h-3.5 w-3.5 stroke-3" />
                      Portal Masuk
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