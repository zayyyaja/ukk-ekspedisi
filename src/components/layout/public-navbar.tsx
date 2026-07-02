"use client";

import { Menu, LogIn } from "lucide-react";
import Link from "next/link";
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

// Navigasi disederhanakan sesuai fitur utama di landing page
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

function Brand({ isHome, scrolled }: { isHome: boolean; scrolled: boolean }) {
  return (
    <Link className="flex items-center gap-2.5" href="/">
      {/* Sediakan tempat untuk memasukkan image logo Anda saja */}
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
          {/* Kiri: Login & Navigasi */}
          <div className="flex items-center gap-6">
            {/* Desktop Login Button */}
            <div className="hidden md:block">
              <Button
                asChild
                className="bg-orange-500 text-white hover:bg-orange-600 border-2 border-transparent transition-all"
              >
                <Link href="/login" className="text-white font-medium">
                  <LogIn className="mr-2 h-4 w-4 text-white" />
                  Login
                </Link>
              </Button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-6 md:flex">
              {navItems.map((item) => (
                item.action === "modal" ? (
                  <AuthModal key={item.label}>
                    <button
                      className={cn(
                        "text-sm font-medium transition-colors duration-300",
                        isHome && !scrolled
                          ? "text-white/80 hover:text-white"
                          : "text-black hover:text-black"
                      )}
                    >
                      {item.label}
                    </button>
                  </AuthModal>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      isHome && !scrolled
                        ? "text-white/80 hover:text-white"
                        : "text-black hover:text-black",
                      isActive(pathname, item.href) && "text-orange-500"
                    )}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </nav>
          </div>

          {/* Kanan: Logo */}
          <Brand isHome={isHome} scrolled={scrolled} />

          {/* Mobile Menu */}
          <Sheet onOpenChange={setOpen} open={open}>
            <SheetTrigger asChild>
              <Button
                className={cn(
                  "md:hidden",
                  isHome && !scrolled
                    ? "text-white hover:bg-white/10"
                    : "text-slate-900 hover:bg-slate-100"
                )}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Buka menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2.5">
                  <div className="relative flex h-8 w-8 items-center justify-center">
                    <img
                      src="/images/logo.png"
                      alt="Logo Icon"
                      className="h-7 w-7 object-contain"
                    />
                  </div>
                  <span className="font-space text-lg font-bold">
                    ANTERIN
                  </span>
                </SheetTitle>
              </SheetHeader>

              {/* Mobile Nav Links */}
              <nav className="mt-6 grid gap-2">
                {navItems.map((item) => (
                  item.action === "modal" ? (
                    <AuthModal key={item.label}>
                      <button
                        className={cn(
                          "w-full text-left rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-orange-500",
                          isActive(pathname, item.href) &&
                          "bg-orange-50 text-orange-500"
                        )}
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
                        "rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-orange-500",
                        isActive(pathname, item.href) &&
                        "bg-orange-50 text-orange-500"
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                ))}
              </nav>

              {/* Mobile CTA */}
              <div className="mt-6 grid gap-3 border-t border-slate-200 pt-6">
                <Button
                  asChild
                  className="w-full bg-orange-500 text-white hover:bg-orange-600"
                >
                  <Link href="/login" onClick={() => setOpen(false)} className="text-white">
                    <LogIn className="mr-2 h-4 w-4 text-white" />
                    Login
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      {!isHome && <div className="h-16" />}
    </>
  );
}