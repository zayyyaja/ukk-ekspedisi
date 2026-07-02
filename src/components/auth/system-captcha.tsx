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
    <div className="field">
      <label>Verifikasi captcha</label>
      <div className="rounded-md border border-border bg-slate-50 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <img
            alt="Captcha login"
            className="h-[54px] w-[180px] rounded border border-border bg-white object-contain"
            src={`/api/v1/auth/captcha?v=${version}`}
          />
          <Button onClick={refreshCaptcha} size="sm" type="button" variant="outline">
            <RefreshCcw size={15} />
            Generate ulang
          </Button>
        </div>
        <Input
          className="mt-3"
          onChange={(event) => onChange(event.target.value)}
          placeholder="Masukkan huruf captcha"
          value={value}
        />
      </div>
      {error ? <span className="muted">{error}</span> : null}
    </div>
  );
}
