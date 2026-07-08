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
    <section className="w-full border-4 border-slate-900 bg-amber-50/40 p-6 font-mono shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] rounded-md">
      
      {/* Header Panel Grafik Kargo */}
      <div className="mb-6 flex items-center justify-between border-b-4 border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center border-2 border-slate-900 bg-slate-900 text-amber-400">
            <BarChart2 size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="block text-[9px] font-black uppercase tracking-wider text-slate-500">
              METRIK MONITORING ARMADA
            </span>
            <h2 className="text-sm font-black uppercase tracking-tight text-slate-900">
              {title}
            </h2>
          </div>
        </div>

        {/* Indikator Sinyal Real-time */}
        <div className="flex items-center gap-1.5 border-2 border-slate-900 bg-emerald-400 px-2 py-0.5 text-[10px] font-black uppercase text-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
          <Radio size={10} className="animate-pulse text-slate-950 stroke-3" />
          <span>LIVE</span>
        </div>
      </div>

      {/* Kondisi Data Kosong */}
      {data.length === 0 ? (
        <div className="flex h-65 flex-col items-center justify-center border-2 border-dashed border-slate-900/30 bg-white text-center rounded-sm">
          <p className="text-2xs font-black uppercase tracking-wider text-slate-400">
            [ KOSONG ] BELUM ADA LOG DATA GRAFIK.
          </p>
        </div>
      ) : (
        /* Kontainer Chart Recharts */
        <div style={{ height: 260 }} className="border-2 border-slate-900 bg-white p-4 shadow-[inset_3px_3px_6px_rgba(0,0,0,0.05)] rounded-sm">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              {/* Grid Belakang Bergaya Kisi Logistik Kedap Udara */}
              <CartesianGrid strokeDasharray="4 4" stroke="#0f172a" opacity={0.15} />
              
              {/* Aksis Kaku Ber-font Monospace */}
              <XAxis 
                dataKey="name" 
                stroke="#0f172a" 
                tick={{ fill: '#0f172a', fontSize: 10, fontWeight: 900, fontFamily: 'monospace' }} 
                tickLine={{ stroke: '#0f172a', strokeWidth: 2 }}
              />
              <YAxis 
                stroke="#0f172a" 
                tick={{ fill: '#0f172a', fontSize: 10, fontWeight: 900, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#0f172a', strokeWidth: 2 }}
              />
              
              {/* Tooltip Melayang Neo-Brutalist Kotak */}
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: '2px solid #0f172a',
                  color: '#fbbf24',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  fontWeight: '900',
                  textTransform: 'uppercase',
                  borderRadius: '0px'
                }} 
                itemStyle={{ color: '#fff' }}
              />
              
              {/* Grafik Batang Kotak Kaku Tanpa Radius */}
              <Bar 
                dataKey="value" 
                fill="#fbbf24" 
                stroke="#0f172a"
                strokeWidth={2}
                radius={[0, 0, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}