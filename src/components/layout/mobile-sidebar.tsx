"use client";

import { Menu } from "lucide-react";
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

type MenuItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

function isActive(pathname: string, href: string) {
  return href.endsWith("/dashboard") ? pathname === href : pathname.startsWith(href);
}

export function MobileSidebar({
  menu,
  title,
}: {
  menu: MenuItem[];
  title: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      {/* Trigger Button - Neo-Brutalist Border & Stamp Shadow */}
      <SheetTrigger asChild>
        <Button 
          className="lg:hidden border-2 border-ink bg-paper text-ink hover:bg-ink/5 shadow-stamp-sm transition-all active:translate-x-0 active:translate-y-0" 
          size="icon" 
          type="button" 
          variant="ghost"
        >
          <Menu className="h-5 w-5 stroke-[2.5]" />
          <span className="sr-only">Buka Menu Manifest</span>
        </Button>
      </SheetTrigger>

      {/* Sidebar Content - Solid Paper Background, Thick Ink Border */}
      <SheetContent 
        className="bg-paper border-r-4 border-ink text-ink p-6 w-70 sm:w-[320px]" 
        side="left"
      >
        <SheetHeader className="border-b-2 border-ink pb-5">
          {/* Brand/System Context Sublabel */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-4 h-2 bg-cargo-amber border border-ink rounded-2px" />
            <span className="font-mono text-[9px] font-bold tracking-widest text-steel uppercase">
              danishEkspedisi // panel
            </span>
          </div>
          
          {/* Sidebar Title - Bold Uppercase Display */}
          <SheetTitle className="text-left font-display text-lg font-black tracking-tighter text-ink uppercase">
            {title}
          </SheetTitle>
        </SheetHeader>

        {/* Navigation Menu Grid */}
        <nav className="mt-6 grid gap-2">
          {menu.map((item) => {
            const Icon = item.icon;
            const isCurrentActive = isActive(pathname, item.href);
            
            return (
              <Link
                className={cn(
                  "flex items-center gap-3 border-2 px-4 py-3 text-xs font-display font-bold uppercase tracking-wider transition-all rounded-app",
                  isCurrentActive
                    ? "bg-ink text-paper border-ink shadow-stamp-sm"
                    : "text-ink border-transparent hover:bg-ink/5 hover:border-ink"
                )}
                href={item.href}
                key={`${item.href}-${item.label}`}
                onClick={() => setOpen(false)}
              >
                {/* Icon Wrapper dynamic sizing */}
                <Icon className={cn(
                  "h-4 w-4 stroke-[2.5] transition-transform",
                  isCurrentActive && "scale-105"
                )} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info inside sidebar for system branding */}
        <div className="absolute bottom-6 left-6 right-6 border-t border-ink/10 pt-4 font-mono text-[9px] text-steel uppercase tracking-widest">
          SYSTEM LEVEL: SECURE GATEWAY
        </div>
      </SheetContent>
    </Sheet>
  );
}