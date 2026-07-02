"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Clock3,
  Mail,
  Package2,
  RefreshCcw,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FullPageLoader } from "@/components/ui/full-page-loader";
import {
  customerRegister,
  resendVerification,
  type CustomerRegisterInput,
} from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter."),
    email: z.string().email("Email tidak valid."),
    password: z.string().min(8, "Password minimal 8 karakter."),
    passwordConfirmation: z
      .string()
      .min(8, "Konfirmasi password wajib diisi."),
    address: z.string().min(1, "Alamat wajib diisi."),
    city: z.string().min(1, "Kota wajib diisi."),
    phone: z.string().min(1, "Telepon wajib diisi."),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Konfirmasi password tidak sama.",
    path: ["passwordConfirmation"],
  });

function formatTime(seconds: number) {
  const hour = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");

  const minute = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");

  const second = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${hour}:${minute}:${second}`;
}

export default function CustomerRegisterPage() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [waitingEmail, setWaitingEmail] = useState("");

  const [pendingRegister, setPendingRegister] =
    useState<CustomerRegisterInput | null>(null);

  const [countdown, setCountdown] = useState(3600);

  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    handleSubmit,
    register,
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
    },
  });

  const countdownText = useMemo(
    () => formatTime(countdown),
    [countdown]
  );

  useEffect(() => {
    if (!waitingEmail) return;

    const timer = window.setInterval(() => {
      setCountdown((current) => Math.max(current - 1, 0));
      setResendCooldown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [waitingEmail]);

  async function onSubmit(input: CustomerRegisterInput) {
    setError("");
    setMessage("Mengirim email verifikasi. Silakan tunggu...");

    try {
      const response = await customerRegister(input);

      setPendingRegister(input);
      setWaitingEmail(response.data.email);

      setCountdown(response.data.expiresIn ?? 3600);
      setResendCooldown(60);

      setMessage(
        "Kami telah mengirimkan link aktivasi ke email Anda. Cek inbox atau folder spam."
      );
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Registrasi gagal."
      );

      setMessage("");
    }
  }

  async function handleResend() {
    if (!pendingRegister) {
      setError(
        "Data register sementara sudah tidak tersedia. Silakan isi form register ulang."
      );
      return;
    }

    setError("");
    setMessage("Mengirim ulang link verifikasi...");

    try {
      const response = await resendVerification(pendingRegister);

      setCountdown(response.data.expiresIn ?? 3600);
      setResendCooldown(60);

      setMessage(
        "Link verifikasi baru berhasil dikirim ke email Anda."
      );
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Gagal mengirim ulang verifikasi."
      );

      setMessage("");
    }
  }

  if (waitingEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-slate-100 px-6 py-12">
        <Card className="w-full max-w-6xl overflow-hidden rounded-[36px] border border-slate-200 shadow-[0_25px_80px_rgba(0,0,0,.12)]">
          <CardContent className="p-0">
            <div className="grid lg:grid-cols-2">

              {/* ================= LEFT ================= */}

              <div className="relative flex flex-col overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 p-10 text-white lg:p-12">

                {/* Ornament */}

                <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

                <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

                <Button
                  asChild
                  variant="outline"
                  className="relative z-10 w-fit rounded-xl border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:border-white/60 hover:bg-white/20 hover:text-white"
                >
                  <Link
                    href="/customer/login"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Login
                  </Link>
                </Button>

                <div className="relative z-10 mt-12 flex flex-1 flex-col justify-start">

                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl">
                    <Package2 className="h-10 w-10 text-orange-500" />
                  </div>

                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
                    ANTERIN
                  </p>

                  <h1 className="text-4xl font-black leading-tight lg:text-5xl">
                    Verifikasi Email
                  </h1>

                  <p className="mt-6 max-w-md leading-8 text-white/80">
                    Hampir selesai. Kami telah mengirim email aktivasi.
                    Silakan buka inbox atau folder spam untuk
                    mengaktifkan akun Anda.
                  </p>

                </div>

              </div>

              {/* ================= RIGHT ================= */}

              <div className="flex flex-col justify-center p-10 lg:p-12">

                <div className="mb-8">

                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100">
                    <Mail className="h-8 w-8 text-orange-500" />
                  </div>

                  <h2 className="text-3xl font-bold text-slate-900">
                    Cek Email Anda
                  </h2>

                  <p className="mt-3 text-slate-500">
                    Link aktivasi berhasil dikirim ke alamat berikut.
                  </p>

                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Email
                  </p>

                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {waitingEmail}
                  </p>

                </div>

                <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50 p-6 text-center">

                  <Clock3 className="mx-auto mb-4 h-8 w-8 text-orange-500" />

                  <p className="text-sm text-slate-500">
                    Link berlaku selama
                  </p>

                  <h3 className="mt-2 text-4xl font-black text-orange-500">
                    {countdownText}
                  </h3>

                </div>

                {message && (
                  <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="mt-6 h-12 rounded-xl bg-orange-500 hover:bg-orange-600"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />

                  {resendCooldown > 0
                    ? `Kirim Ulang (${resendCooldown}s)`
                    : "Kirim Ulang Email"}
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="mt-4 h-12 rounded-xl"
                >
                  <Link href="/customer/login">
                    Kembali ke Login
                  </Link>
                </Button>

              </div>

            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-white to-slate-100 px-6 py-12">
      {isSubmitting && <FullPageLoader label="Memproses Pendaftaran..." />}

      <Card className="w-full max-w-6xl overflow-hidden rounded-[36px] border border-slate-200 shadow-[0_25px_80px_rgba(0,0,0,.12)]">

        <CardContent className="p-0">

          <div className="grid lg:grid-cols-2">

            {/* ================= LEFT SIDE ================= */}

            <div className="relative flex flex-col overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 p-10 text-white lg:p-12">

              {/* Background Ornament */}

              <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

              <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

              {/* Back Button */}

              <Button
                asChild
                variant="outline"
                className="relative z-10 w-fit rounded-xl border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:border-white/60 hover:bg-white/20 hover:text-white"
              >
                <Link
                  href="/customer/login"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali
                </Link>
              </Button>

              <div className="relative z-10 mt-12 flex flex-1 flex-col justify-start">

                {/* Logo */}

                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl">

                  <Package2 className="h-10 w-10 text-orange-500" />

                </div>

                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
                  ANTERIN
                </p>

                <h1 className="text-4xl font-black leading-tight lg:text-5xl">
                  Register Customer
                </h1>

                <p className="mt-6 max-w-md leading-8 text-white/80">
                  Buat akun customer untuk mulai mengirim paket,
                  melakukan tracking pengiriman secara realtime,
                  melihat riwayat transaksi, dan mengelola seluruh
                  pengiriman dalam satu dashboard.
                </p>

                {/* Feature Card */}

                <div className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">

                  <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
                    Keuntungan
                  </p>

                  <ul className="mt-4 space-y-3 text-sm leading-7 text-white/90">

                    <li>✓ Tracking paket realtime.</li>

                    <li>✓ Riwayat transaksi lengkap.</li>

                    <li>✓ Kelola alamat pengiriman.</li>

                    <li>✓ Notifikasi status paket otomatis.</li>

                  </ul>

                </div>

              </div>

            </div>

            {/* ================= RIGHT SIDE ================= */}

            <div className="p-10 lg:p-12">

              <div className="mb-8">

                <h2 className="text-3xl font-bold text-slate-900">
                  Buat Akun Baru
                </h2>

                <p className="mt-3 text-slate-500">
                  Lengkapi seluruh informasi berikut untuk membuat akun customer.
                </p>

              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {/* Nama & Email */}

                <div className="grid gap-5 md:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Nama Lengkap
                    </label>

                    <input
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      {...register("name")}
                      className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />

                    {errors.name && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email
                    </label>

                    <input
                      type="email"
                      placeholder="nama@email.com"
                      {...register("email")}
                      className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />

                    {errors.email && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                </div>

                {/* Telepon & Kota */}

                <div className="grid gap-5 md:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Nomor Telepon
                    </label>

                    <input
                      type="text"
                      placeholder="08xxxxxxxxxx"
                      {...register("phone")}
                      className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />

                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Kota
                    </label>

                    <input
                      type="text"
                      placeholder="Masukkan kota"
                      {...register("city")}
                      className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />

                    {errors.city && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                </div>

                {/* Alamat */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Alamat
                  </label>

                  <textarea
                    rows={4}
                    placeholder="Masukkan alamat lengkap"
                    {...register("address")}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition-all resize-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  />

                  {errors.address && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.address.message}
                    </p>
                  )}

                </div>

                {/* Password */}

                <div className="grid gap-5 md:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Password
                    </label>

                    <input
                      type="password"
                      placeholder="Minimal 8 karakter"
                      {...register("password")}
                      className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />

                    {errors.password && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.password.message}
                      </p>
                    )}

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Konfirmasi Password
                    </label>

                    <input
                      type="password"
                      placeholder="Ulangi password"
                      {...register("passwordConfirmation")}
                      className="h-12 w-full rounded-xl border border-slate-300 px-4 outline-none transition-all focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />

                    {errors.passwordConfirmation && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.passwordConfirmation.message}
                      </p>
                    )}

                  </div>

                </div>

                {/* Alert */}

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {message}
                  </div>
                )}

                {/* Button */}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-xl bg-orange-500 text-base font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
                >
                  Daftar Sekarang
                </Button>

              </form>

              <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">

                Sudah punya akun?{" "}

                <Link
                  href="/customer/login"
                  className="font-semibold text-orange-500 hover:text-orange-600"
                >
                  Login
                </Link>

              </div>

            </div>

          </div>

        </CardContent>

      </Card>

    </main>
  );
}