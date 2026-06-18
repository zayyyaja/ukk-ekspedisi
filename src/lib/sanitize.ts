const dangerousPattern = /<script[\s\S]*?>[\s\S]*?<\/script>|<[^>]+>|javascript:/gi;

export function sanitizeString(value: string) {
  return value.replace(dangerousPattern, "").trim();
}

export function sanitizeInput<T>(value: T): T {
  if (typeof value === "string") {
    return sanitizeString(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeInput(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizeInput(item)]),
    ) as T;
  }

  return value;
}
