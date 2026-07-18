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
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
};

function isActive(pathname: string, href: string) {
  if (href === "/customer") return pathname === "/customer";
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
        <button
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-border/40 bg-surface text-ink hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
          type="button"
        >
          <Menu className="h-5 w-5" strokeWidth={1.5} />
          <span className="sr-only">Open Menu</span>
        </button>
      </SheetTrigger>

      {/* Sidebar Content - Solid Paper Background, Thick Ink Border */}
      <SheetContent
        className="bg-surface border-r border-border/40 text-ink p-0 w-72 max-w-[calc(100vw-3rem)] sm:w-[320px] flex flex-col"
        side="left"
      >
        <SheetHeader className="border-b border-border/40 p-6 flex-shrink-0 text-left">
          {/* Brand/System Context Sublabel */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-3 h-1.5 bg-primary rounded-full" />
            <span className="text-[10px] font-bold tracking-tight text-muted uppercase">
              DRG-EKSPEDISI
            </span>
          </div>

          {/* Sidebar Title - Bold Uppercase Display */}
          <SheetTitle className="text-left text-lg font-semibold tracking-tight text-ink uppercase">
            {title}
          </SheetTitle>
        </SheetHeader>

        {/* Navigation Menu Grid */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 grid gap-1.5 content-start">
          {menu.map((item) => {
            const Icon = item.icon;
            const isCurrentActive = isActive(pathname, item.href);

            return (
              <Link
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-tight transition-colors rounded-xl",
                  isCurrentActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-slate-50 hover:text-ink"
                )}
                href={item.href}
                key={`${item.href}-${item.label}`}
                onClick={() => setOpen(false)}
              >
                {/* Icon Wrapper dynamic sizing */}
                <Icon
                  className={cn("h-4 w-4 transition-transform", isCurrentActive && "text-primary")}
                  strokeWidth={isCurrentActive ? 2 : 1.5}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info inside sidebar for system branding */}
        <div className="flex-shrink-0 p-6 border-t border-border/40 bg-slate-50/50 mt-auto">
          <div className="text-[10px] font-semibold text-muted uppercase tracking-tight text-center">
            DRG-EKSPEDISI SYSTEM
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}