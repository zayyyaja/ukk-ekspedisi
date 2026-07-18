"use client";

import { BarChart2, Radio } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function DashboardChart({
  title,
  data,
}: {
  title: string;
  data: { name: string; value: number }[];
}) {
  return (
    <section className="w-full border border-border/40 bg-surface p-6 font-body shadow-sm rounded-2xl transition-colors hover:bg-background/80 flex flex-col">
      
      {/* Minimal Header Panel */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center text-muted">
            <BarChart2 size={18} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-ink">
              {title}
            </h2>
          </div>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md">
          <Radio size={12} className="animate-pulse" />
          <span>LIVE</span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-1 min-h-[300px] flex-col items-center justify-center rounded-xl bg-slate-50/50 text-center">
          <p className="text-sm font-medium text-muted">
            No chart data available.
          </p>
        </div>
      ) : (
        <div style={{ minHeight: 300, height: 300 }} className="w-full mt-auto">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-body)' }} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#94a3b8" 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-body)' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: '500',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="var(--color-primary)" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}