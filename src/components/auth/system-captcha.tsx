"use client";

import ReCAPTCHA from "react-google-recaptcha";
import { useEffect, useState, useRef } from "react";

export type SystemCaptchaProps = {
  value: string;
  error?: string;
  onChange: (answer: string) => void;
};

export function SystemCaptcha({ value, error, onChange }: SystemCaptchaProps) {
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    // Only access NEXT_PUBLIC variable in client to avoid hydration issues if not strictly bound
    const key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (key) {
      setSiteKey(key);
    } else {
      console.error("Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY");
    }
  }, []);

  if (!siteKey) {
    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700">
          Verifikasi Keamanan
        </label>
        <div className="rounded-xl border border-border bg-slate-50/50 p-4 text-xs font-medium text-muted animate-pulse">
          Memuat modul keamanan...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-1.5">
      <label className="block text-xs font-semibold text-slate-700">
        Verifikasi Keamanan
      </label>
      
      <div className="self-start overflow-hidden rounded-xl border border-border shadow-sm">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={siteKey}
          onChange={(token) => onChange(token || "")}
          onExpired={() => onChange("")}
          theme="light"
        />
      </div>
      
      {error ? (
        <span className="block text-xs font-semibold text-red-600">
          {error}
        </span>
      ) : null}
    </div>
  );
}