import { NextRequest } from "next/server";

import { AppError } from "@/lib/errors";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

function getClientKey(request: NextRequest, key: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "local";

  return `${key}:${ip}`;
}

export function rateLimit(
  request: NextRequest,
  options: { key: string; limit: number; windowMs: number },
) {
  const now = Date.now();
  const bucketKey = getClientKey(request, options.key);
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt < now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + options.windowMs });
    return;
  }

  current.count += 1;

  if (current.count > options.limit) {
    throw new AppError("Too many requests. Please try again later.", 429);
  }
}
