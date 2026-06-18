"use client";

import { Menu, PackageCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/tracking", label: "Tracking" },
  { href: "/cek-ongkir", label: "Cek Ongkir" },
  { href: "/cabang", label: "Cabang" },
  { href: "/tentang-kami", label: "Tentang Kami" },
  { href: "/kontak", label: "Kontak" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === href : pathname.startsWith(href);
}

function Brand() {
  return (
    <Link className="flex items-center gap-2 font-bold text-foreground" href="/">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <PackageCheck className="h-5 w-5" />
      </span>
      Ekspedisi Online
    </Link>
  );
}

export function PublicNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Brand />

        <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Link
              className={cn(
                "text-muted-foreground transition-colors hover:text-foreground",
                isActive(pathname, item.href) && "text-foreground",
              )}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild size="sm" variant="outline">
            <Link href="/customer/login">Masuk Customer</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/staff/login">Masuk Staff</Link>
          </Button>
        </div>

        <Sheet onOpenChange={setOpen} open={open}>
          <SheetTrigger asChild>
            <Button className="md:hidden" size="icon" type="button" variant="ghost">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Buka menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu publik</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 grid gap-2">
              {navItems.map((item) => (
                <Link
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                    isActive(pathname, item.href) && "bg-muted text-foreground",
                  )}
                  href={item.href}
                  key={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 grid gap-2">
              <Button asChild variant="outline">
                <Link href="/customer/login" onClick={() => setOpen(false)}>
                  Masuk Customer
                </Link>
              </Button>
              <Button asChild>
                <Link href="/staff/login" onClick={() => setOpen(false)}>
                  Masuk Staff
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
