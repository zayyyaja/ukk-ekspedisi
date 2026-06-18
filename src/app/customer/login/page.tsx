"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { TurnstileCaptcha } from "@/components/auth/turnstile-captcha";
import {
  customerLogin,
  resendVerification,
  type CustomerAuthInput,
} from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
  captchaToken: z.string().min(1, "Captcha wajib diisi."),
});

export default function CustomerLoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomerAuthInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", captchaToken: "" },
  });

  async function onSubmit(input: CustomerAuthInput) {
    setError("");
    setMessage("");
    setUnverifiedEmail("");

    try {
      await customerLogin(input);
      router.replace("/customer/dashboard");
    } catch (currentError) {
      const text = currentError instanceof Error ? currentError.message : "Login gagal.";
      setError(text);
      if (text.toLowerCase().includes("verif")) {
        setUnverifiedEmail(input.email);
      }
      setValue("captchaToken", "");
    }
  }

  async function handleResend() {
    setError("");
    setMessage("");
    try {
      await resendVerification(unverifiedEmail, watch("captchaToken"));
      setMessage("Link verifikasi baru sudah dikirim.");
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Gagal mengirim ulang verifikasi.",
      );
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand-mark">Ekspedisi Online</div>
        <h1 className="title">Masuk customer</h1>
        <p className="subtitle">Kelola kiriman, pembayaran, dan tracking dari satu portal.</p>

        <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" {...register("email")} />
            {errors.email && <span className="muted">{errors.email.message}</span>}
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" {...register("password")} />
            {errors.password && <span className="muted">{errors.password.message}</span>}
          </div>
          <TurnstileCaptcha
            value={watch("captchaToken")}
            onChange={(token) => setValue("captchaToken", token)}
          />
          {errors.captchaToken && <div className="alert error">{errors.captchaToken.message}</div>}
          {error && <div className="alert error">{error}</div>}
          {message && <div className="alert success">{message}</div>}
          {unverifiedEmail && (
            <button className="button secondary" onClick={handleResend} type="button">
              Kirim ulang verifikasi
            </button>
          )}
          <button className="button primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Memproses..." : "Login"}
          </button>
        </form>

        <p className="subtitle">
          Belum punya akun? <Link href="/customer/register">Register</Link>
        </p>
      </section>
    </main>
  );
}
