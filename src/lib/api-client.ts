"use client";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta: unknown;
  errors?: Record<string, unknown>;
};

type RequestBody = Record<string, unknown> | unknown[] | null;
type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export class ApiClientError extends Error {
  status: number;
  errors: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    errors: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }
}

function buildUrl(path: string, query?: QueryParams) {
  const url = path.startsWith("http")
    ? new URL(path)
    : new URL(path.startsWith("/") ? path : `/${path}`, window.location.origin);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return path.startsWith("http") ? url.toString() : `${url.pathname}${url.search}`;
}

async function apiRequest<T>(
  method: string,
  path: string,
  body?: RequestBody,
  query?: QueryParams,
): Promise<ApiResponse<T>> {
  const response = await fetch(buildUrl(path, query), {
    method,
    credentials: "include",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (response.status === 401 && typeof window !== "undefined") {
    window.location.href = window.location.pathname.startsWith("/staff")
      ? "/staff/login"
      : "/customer/login";
  }

  if (response.status === 403 && typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/staff")) {
      window.location.href = "/staff/login";
    }
  }

  if (!response.ok || !json?.success) {
    const message = json?.message || "Request gagal diproses.";
    throw new ApiClientError(message, response.status, json?.errors ?? {});
  }

  return json;
}

export function apiGet<T>(path: string, query?: QueryParams) {
  return apiRequest<T>("GET", path, undefined, query);
}

export function apiPost<T>(path: string, body?: RequestBody, query?: QueryParams) {
  return apiRequest<T>("POST", path, body, query);
}

export function apiPatch<T>(path: string, body?: RequestBody, query?: QueryParams) {
  return apiRequest<T>("PATCH", path, body, query);
}

export function apiDelete<T>(path: string, query?: QueryParams) {
  return apiRequest<T>("DELETE", path, undefined, query);
}
