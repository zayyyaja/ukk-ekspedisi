"use client";

import { apiGet, apiPost } from "@/lib/api-client";

export type CustomerAuthInput = {
  email: string;
  password: string;
  captchaInput: string;
};

export type CustomerRegisterInput = {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  address: string;
  city: string;
  phone: string;
};

export type StaffAuthInput = CustomerAuthInput;

let activeUserPromise: Promise<any> | null = null;
let activeUserPromiseTimestamp: number = 0;

export function getCurrentUser() {
  if (activeUserPromise && Date.now() - activeUserPromiseTimestamp < 4000) {
    return activeUserPromise;
  }

  activeUserPromiseTimestamp = Date.now();
  activeUserPromise = apiGet<Record<string, unknown>>("/api/v2/auth/me").catch((err) => {
    activeUserPromise = null;
    throw err;
  });

  return activeUserPromise;
}

export function customerLogin(input: CustomerAuthInput) {
  activeUserPromise = null;
  return apiPost<Record<string, unknown>>("/api/v2/customer/auth/login", input);
}

export function customerRegister(input: CustomerRegisterInput) {
  activeUserPromise = null;
  return apiPost<{
    email: string;
    expiresIn: number;
  }>("/api/v2/customer/auth/register", input);
}

async function clearPwaCache() {
  if (typeof window !== "undefined" && "caches" in window) {
    try {
      const keys = await caches.keys();
      const sensitiveCaches = ["api-cache", "auth-pages-cache"];
      
      for (const key of keys) {
        // Cek apakah key cache saat ini mengandung salah satu string di sensitiveCaches
        // (Next-PWA sering menambahkan suffix seperti "api-cache-v1", sehingga startsWith lebih presisi)
        const isSensitive = sensitiveCaches.some(sensitiveKey => key.startsWith(sensitiveKey));
        if (isSensitive) {
          await caches.delete(key);
        }
      }
    } catch (e) {
      console.error("Failed to clear PWA cache", e);
    }
  }
}

export async function customerLogout() {
  activeUserPromise = null;
  await clearPwaCache();
  return apiPost<null>("/api/v2/auth/logout", {});
}

export function staffLogin(input: StaffAuthInput) {
  activeUserPromise = null;
  return apiPost<Record<string, unknown>>("/api/v2/staff/auth/login", input);
}

export async function logout() {
  activeUserPromise = null;
  await clearPwaCache();
  return apiPost<null>("/api/v2/auth/logout", {});
}

export function verifyEmail(token: string) {
  return apiPost<null>("/api/v2/customer/auth/verify-email", {
    token,
  });
}

export function resendVerification(input: CustomerRegisterInput) {
  return apiPost<{
    email: string;
    expiresIn: number;
  }>("/api/v2/customer/auth/resend-verification", input);
}