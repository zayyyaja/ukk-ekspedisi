"use client";

import { CheckCircle2, Package, Truck, CreditCard, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TimelineEvent = {
  id: string;
  type: "created" | "assigned" | "picked_up" | "payment" | "delivered" | "generic";
  title: string;
  description: string;
  timestamp: string;
};

const iconMap: Record<TimelineEvent["type"], LucideIcon> = {
  created: Package,
  assigned: Clock,
  picked_up: Truck,
  payment: CreditCard,
  delivered: CheckCircle2,
  generic: Clock,
};

const colorMap: Record<TimelineEvent["type"], string> = {
  created: "bg-blue-100 text-blue-600 border-blue-200",
  assigned: "bg-amber-100 text-amber-600 border-amber-200",
  picked_up: "bg-indigo-100 text-indigo-600 border-indigo-200",
  payment: "bg-emerald-100 text-emerald-600 border-emerald-200",
  delivered: "bg-emerald-100 text-emerald-600 border-emerald-200",
  generic: "bg-slate-100 text-slate-600 border-slate-200",
};

export function EnterpriseTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted">
        <Clock className="mb-2 h-8 w-8 opacity-20" />
        <p className="text-sm">Tidak ada aktivitas terbaru.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border/60">
      {events.map((event, index) => {
        const Icon = iconMap[event.type];
        const colorClass = colorMap[event.type];

        return (
          <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Icon */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${colorClass}`}
            >
              <Icon size={18} strokeWidth={2} />
            </div>
            {/* Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] rounded-2xl border border-border/40 bg-surface p-4 shadow-[0_2px_8px_rgb(0,0,0,0.02)] transition-colors hover:bg-slate-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 gap-1 sm:gap-4">
                <h4 className="text-sm font-semibold text-ink">{event.title}</h4>
                <time className="text-[11px] font-medium text-muted whitespace-nowrap uppercase tracking-wider">{event.timestamp}</time>
              </div>
              <p className="text-sm font-medium text-muted">{event.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
