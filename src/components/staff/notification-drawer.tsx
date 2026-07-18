"use client";

import { Bell, CheckCheck, Inbox, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function NotificationDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-slate-50 hover:text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1">
          <Bell size={18} strokeWidth={1.5} />
          {/* Notification Badge */}
          <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-surface" />
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md border-border/40 p-0 flex flex-col bg-surface shadow-2xl">
        <SheetHeader className="px-6 py-5 border-b border-border/40 flex flex-row items-center justify-between sticky top-0 bg-surface/90 backdrop-blur-md z-10 space-y-0">
          <SheetTitle className="text-base font-semibold tracking-tight text-ink">
            Notifications
          </SheetTitle>
          <div className="flex items-center gap-3">
            <button className="text-[11px] font-semibold text-muted hover:text-ink uppercase tracking-wider flex items-center gap-1.5 transition-colors">
              <CheckCheck size={14} strokeWidth={2} />
              Mark all read
            </button>
            <button className="text-muted hover:text-ink transition-colors">
              <Settings size={16} strokeWidth={1.5} />
            </button>
          </div>
        </SheetHeader>

        {/* Empty State */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-4">
            <Inbox size={24} strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-semibold text-ink">No new notifications</h3>
          <p className="mt-1 text-sm text-muted max-w-[200px]">
            You&apos;re all caught up! Check back later for updates.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
