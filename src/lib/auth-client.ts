"use client";

import { apiGet, apiPost } from "@/lib/api-client";

export type CustomerAuthInput = {
  email: string;
  password: string;
  captchaToken: string;
};

export type CustomerRegisterInput = CustomerAuthInput & {
  name: string;
  passwordConfirmation: string;
  address: string;
  city: string;
  phone: string;
};

export type StaffAuthInput = CustomerAuthInput;

export function getCurrentUser() {
  return apiGet<Record<string, unknown>>("/api/v1/auth/me");
}

export function customerLogin(input: CustomerAuthInput) {
  return apiPost<Record<string, unknown>>("/api/v1/customer/auth/login", input);
}

export function customerRegister(input: CustomerRegisterInput) {
  return apiPost<Record<string, unknown>>("/api/v1/customer/auth/register", input);
}

export function customerLogout() {
  return apiPost<null>("/api/v1/auth/logout", {});
}

export function staffLogin(input: StaffAuthInput) {
  return apiPost<Record<string, unknown>>("/api/v1/staff/auth/login", input);
}

export function logout() {
  return apiPost<null>("/api/v1/auth/logout", {});
}

export function verifyEmail(token: string) {
  return apiPost<Record<string, unknown>>("/api/v1/customer/auth/verify-email", {
    token,
  });
}

export function resendVerification(email: string, captchaToken: string) {
  return apiPost<Record<string, unknown>>(
    "/api/v1/customer/auth/resend-verification",
    { email, captchaToken },
  );
}
