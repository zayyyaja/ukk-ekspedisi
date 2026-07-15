"use client";

import { RefreshCcw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type SystemCaptchaProps = {
  value: string;
  error?: string;
  onChange: (answer: string) => void;
};

export function SystemCaptcha({ value, error, onChange }: SystemCaptchaProps) {
  const [version, setVersion] = useState(0);

  function refreshCaptcha() {
    onChange("");
    setVersion(Date.now());
  }

  return (
    <div className="space-y-2">
      {/* Label - Menggunakan format huruf kapital manifes logistik */}
      <label className="block font-mono text-[10px] font-black uppercase tracking-widest text-steel">
        VERIFIKASI CAPTCHA // SECURITY CHECK
      </label>
      
      {/* Kontainer Panel Utama - Box Tebal Neo-Brutalist */}
      <div className="border-2 border-ink bg-paper p-4 rounded-app shadow-stamp-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Gambar Captcha - Dibuat berbingkai hitam tegas */}
          <img
            alt="Captcha login"
            className="h-13.5 w-45 border-2 border-ink bg-white object-contain rounded-app"
            src={`/api/v2/auth/captcha?v=${version}`}
          />
          
          {/* Tombol Refresh - Menggunakan style penekanan stamp tanpa warna oranye */}
          <Button 
            onClick={refreshCaptcha} 
            size="sm" 
            type="button" 
            variant="outline"
            className="h-10 border-2 border-ink bg-paper text-ink font-display text-xs font-black uppercase tracking-wider shadow-stamp-sm transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-stamp active:translate-x-0 active:translate-y-0 active:shadow-stamp-sm rounded-app cursor-pointer gap-2"
          >
            <RefreshCcw size={14} className="stroke-[2.5]" />
            Generate Ulang
          </Button>
        </div>
        
        {/* Input Jawaban - Box Bergaris Tebal Menyesuaikan Tema Input Utama */}
        <Input
          className="mt-4 h-12 w-full border-2 border-ink bg-paper px-4 font-body text-xs font-bold uppercase tracking-wider text-ink outline-none placeholder:text-steel/50 rounded-app focus:shadow-stamp-sm transition-all"
          onChange={(event) => onChange(event.target.value)}
          placeholder="MASUKKAN KODE CAPTCHA DI ATAS..."
          value={value}
        />
      </div>
      
      {/* Alert Pesan Error - Menggunakan format error box merah putus-putus */}
      {error ? (
        <span className="block font-mono text-[10px] font-bold uppercase tracking-wide text-red-600">
          [!] {error}
        </span>
      ) : null}
    </div>
  );
}