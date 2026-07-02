"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Package2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SystemCaptcha } from "@/components/auth/system-captcha";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FullPageLoader } from "@/components/ui/full-page-loader";
import { customerLogin, type CustomerAuthInput } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
  captchaInput: z.string().min(1, "Captcha wajib diisi."),
});

export default function CustomerLoginPage() {
  const router = useRouter();

  const [error, setError] = useState("");

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<CustomerAuthInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      captchaInput: "",
    },
  });

  async function onSubmit(input: CustomerAuthInput) {
    setError("");

    try {
      await customerLogin(input);
      router.replace("/customer");
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Login gagal."
      );

      setValue("captchaInput", "");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-orange-50 px-6 py-12">
      {/* Background */}
      <div className="absolute inset-0">
        {/* Base */}
        <div className="absolute inset-0 bg-[#FFF8F3]" />

        {/* Main Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-orange-50 to-orange-100" />

        {/* Bottom Glow */}
        <div className="absolute -bottom-72 left-1/2 h-[52rem] w-[52rem] -translate-x-1/2 rounded-full bg-orange-400/35 blur-[180px]" />

        {/* Bottom Secondary Glow */}
        <div className="absolute -bottom-32 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-orange-300/30 blur-[120px]" />

        {/* Soft Fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-orange-100/30 via-transparent to-white/20" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
        linear-gradient(to right, rgb(251 146 60 / 0.35) 1px, transparent 1px),
        linear-gradient(to bottom, rgb(251 146 60 / 0.35) 1px, transparent 1px)
      `,
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      {isSubmitting && <FullPageLoader label="Memproses Login..." />}

      <Card className="relative z-10 w-full max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white/90 shadow-2xl shadow-orange-200/40 backdrop-blur-xl">
        <CardContent className="p-0">

          <div className="grid lg:grid-cols-2">

            {/* LEFT SIDE */}

            <div className="relative flex flex-col overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 p-10 text-white lg:p-12">

              <Button
                asChild
                variant="outline"
                className="
    w-fit
    rounded-xl
    border
    border-white/50
    bg-white/10
    text-white
    backdrop-blur-sm
    hover:bg-white/20
    hover:text-white
    hover:border-white/60
  "
              >
                <Link
                  href="/login"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali
                </Link>
              </Button>

              <div className="mt-12 flex flex-1 flex-col justify-start pt-12">

                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl">
                  <Package2 className="h-10 w-10 text-orange-500" />
                </div>

                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
                  ANTERIN
                </p>

                <h1 className="text-4xl font-black leading-tight text-white lg:text-5xl">
                  Login Customer
                </h1>

                <p className="mt-6 max-w-md text-base leading-8 text-white/80">
                  Masuk untuk mengelola pengiriman, tracking paket,
                  pembayaran, dan seluruh riwayat transaksi Anda
                  dalam satu dashboard yang terintegrasi.
                </p>

              </div>

            </div>


            {/* RIGHT SIDE */}

            <div className="p-10 lg:p-12">

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  Selamat Datang
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Silakan masuk menggunakan email dan password Anda.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
              >

                {/* EMAIL */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    {...register("email")}
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    placeholder="nama@email.com"
                  />

                  {errors.email && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}

                </div>

                {/* PASSWORD */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <input
                    type="password"
                    {...register("password")}
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    placeholder="Masukkan password"
                  />

                  {errors.password && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}

                </div>

                {/* CAPTCHA */}

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                  <SystemCaptcha
                    value={watch("captchaInput")}
                    error={errors.captchaInput?.message}
                    onChange={(answer) =>
                      setValue("captchaInput", answer)
                    }
                  />

                </div>

                {/* ERROR */}

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* LOGIN BUTTON */}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-xl bg-orange-500 text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600"
                >
                  Login
                </Button>

              </form>

              {/* REGISTER */}

              <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
                Belum punya akun?{" "}

                <Link
                  href="/customer/register"
                  className="font-semibold text-orange-500 transition hover:text-orange-600"
                >
                  Daftar Sekarang
                </Link>
              </div>

            </div>

          </div>

        </CardContent>

      </Card>

    </main>
  );
}