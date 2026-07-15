import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api-error";
import { setCaptchaAnswer } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";

function randomCaptchaText(length = 5) {
  return Array.from({ length }, () =>
    CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)],
  ).join("");
}

function escapeSvgText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function createCaptchaSvg(text: string) {
  const letters = text.split("").map((letter, index) => {
    const x = 28 + index * 27;
    const y = 36 + (index % 2 === 0 ? -2 : 3);
    const rotate = [-10, 8, -4, 11, -7][index] ?? 0;

    return `<text x="${x}" y="${y}" transform="rotate(${rotate} ${x} ${y})">${escapeSvgText(letter)}</text>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="54" viewBox="0 0 180 54" role="img" aria-label="Captcha">
  <rect width="180" height="54" rx="8" fill="#f8fafc"/>
  <path d="M8 17 C48 3, 74 49, 118 19 S151 7, 172 35" fill="none" stroke="#f97316" stroke-width="1.4" opacity="0.45"/>
  <path d="M5 39 C37 29, 64 5, 103 29 S145 53, 176 22" fill="none" stroke="#64748b" stroke-width="1.1" opacity="0.35"/>
  <g font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="#0f172a" letter-spacing="2">
    ${letters.join("\n    ")}
  </g>
  <circle cx="31" cy="14" r="1.5" fill="#f97316" opacity="0.45"/>
  <circle cx="82" cy="43" r="1.2" fill="#64748b" opacity="0.4"/>
  <circle cx="139" cy="13" r="1.4" fill="#f97316" opacity="0.35"/>
</svg>`;
}

export async function GET() {
  try {
    const captchaText = randomCaptchaText();

    await setCaptchaAnswer(captchaText);

    return new NextResponse(createCaptchaSvg(captchaText), {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
