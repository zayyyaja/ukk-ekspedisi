"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { customerMenu, settingsMenuItem } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return href === "/customer/dashboard" ? pathname === href : pathname.startsWith(href);
}

export function CustomerSidebar() {
  const pathname = usePathname();
  const menu = [...customerMenu, settingsMenuItem];

  return (
    <aside className="hidden min-h-screen border-r border-slate-800 bg-slate-950 px-4 py-5 text-white lg:block">
      <div className="px-2 text-lg font-bold">Ekspedisi</div>
      <nav className="mt-8 grid gap-1">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white",
                isActive(pathname, item.href) && "bg-slate-800 text-white",
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
