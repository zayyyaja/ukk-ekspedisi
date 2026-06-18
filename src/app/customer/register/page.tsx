"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { TurnstileCaptcha } from "@/components/auth/turnstile-captcha";
import {
  customerRegister,
  type CustomerRegisterInput,
} from "@/lib/auth-client";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter."),
    email: z.string().email("Email tidak valid."),
    password: z.string().min(8, "Password minimal 8 karakter."),
    passwordConfirmation: z.string().min(8, "Konfirmasi password wajib diisi."),
    address: z.string().min(1, "Alamat wajib diisi."),
    city: z.string().min(1, "Kota wajib diisi."),
    phone: z.string().min(1, "Telepon wajib diisi."),
    captchaToken: z.string().min(1, "Captcha wajib diisi."),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Konfirmasi password tidak sama.",
    path: ["passwordConfirmation"],
  });

export default function CustomerRegisterPage() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [verificationLink, setVerificationLink] = useState("");
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomerRegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      address: "",
      city: "",
      phone: "",
      captchaToken: "",
    },
  });

  async function onSubmit(input: CustomerRegisterInput) {
    setError("");
    setMessage("");
    setVerificationLink("");

    try {
      const response = await customerRegister(input);
      setMessage("Registrasi berhasil. Silakan verifikasi email.");
      const link = response.data?.verificationLink;
      if (typeof link === "string") {
        setVerificationLink(link);
      }
    } catch (currentError) {
      setError(
        currentError instanceof Error ? currentError.message : "Registrasi gagal.",
      );
      setValue("captchaToken", "");
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand-mark">Ekspedisi Online</div>
        <h1 className="title">Buat akun</h1>
        <p className="subtitle">Akun customer digunakan untuk membuat dan memantau shipment.</p>

        <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
          {[
            ["name", "Nama"],
            ["email", "Email"],
            ["phone", "Telepon"],
            ["city", "Kota"],
            ["address", "Alamat"],
          ].map(([name, label]) => (
            <div className="field" key={name}>
              <label>{label}</label>
              <input
                className="input"
                type={name === "email" ? "email" : "text"}
                {...register(name as keyof CustomerRegisterInput)}
              />
              {errors[name as keyof CustomerRegisterInput] && (
                <span className="muted">
                  {errors[name as keyof CustomerRegisterInput]?.message}
                </span>
              )}
            </div>
          ))}
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" {...register("password")} />
            {errors.password && <span className="muted">{errors.password.message}</span>}
          </div>
          <div className="field">
            <label>Konfirmasi password</label>
            <input
              className="input"
              type="password"
              {...register("passwordConfirmation")}
            />
            {errors.passwordConfirmation && (
              <span className="muted">{errors.passwordConfirmation.message}</span>
            )}
          </div>
          <TurnstileCaptcha
            value={watch("captchaToken")}
            onChange={(token) => setValue("captchaToken", token)}
          />
          {error && <div className="alert error">{error}</div>}
          {message && <div className="alert success">{message}</div>}
          {verificationLink && (
            <Link className="button secondary" href={verificationLink}>
              Buka link verifikasi testing
            </Link>
          )}
          <button className="button primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Mendaftarkan..." : "Register"}
          </button>
        </form>

        <p className="subtitle">
          Sudah punya akun? <Link href="/customer/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
