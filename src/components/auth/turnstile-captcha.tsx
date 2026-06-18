"use client";

import { useEffect, useRef } from "react";

type TurnstileCaptchaProps = {
  value: string;
  onChange: (token: string) => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export function TurnstileCaptcha({ value, onChange }: TurnstileCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !containerRef.current || widgetIdRef.current) {
      return;
    }

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current || widgetIdRef.current) {
        return;
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onChange,
        "expired-callback": () => onChange(""),
      });
    };

    if (!window.turnstile) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      document.body.appendChild(script);
    } else {
      renderWidget();
    }
  }, [onChange, siteKey]);

  if (!siteKey) {
    return (
      <button
        className="button secondary"
        type="button"
        onClick={() => onChange("development-captcha-token")}
      >
        {value ? "Captcha development aktif" : "Aktifkan captcha development"}
      </button>
    );
  }

  return <div ref={containerRef} />;
}
