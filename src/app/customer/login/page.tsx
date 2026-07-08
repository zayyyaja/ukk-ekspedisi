"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Package2, Lock, Mail, ShieldCheck, User } from "lucide-react";
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-12 font-mono select-none">
      {/* Pola Garis Grid Latar Belakang Gudang Cargo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:30px_30px] opacity-70" />

      {/* Loader layar penuh ketika proses login berjalan */}
      {isSubmitting && <FullPageLoader label="Memproses masuk akun..." />}

      {/* Kartu Utama Split Screen Neo-Brutalist */}
      <Card className="relative z-10 w-full max-w-5xl overflow-hidden border-4 border-slate-900 bg-white p-2 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-sm">
        <CardContent className="p-0">
          <div className="grid lg:grid-cols-12">
            
            {/* PANEL KIRI: Banner Info Berwarna Kuning Kontainer */}
            <div className="relative flex flex-col justify-between bg-amber-400 p-8 border-b-4 lg:border-b-0 lg:border-r-4 border-slate-900 lg:col-span-5">
              {/* Arsiran Garis Khas Industri */}
              <div className="absolute inset-0 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-[size:16px_16px] opacity-5 pointer-events-none" />

              <div className="relative z-10">
                {/* Tombol Kembali yang Tegas */}
                <Button
                  asChild
                  className="h-9 bg-slate-900 text-white border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(251,191,36,1)] rounded-sm text-3xs font-black uppercase tracking-wider"
                >
                  <Link href="/login">
                    <ArrowLeft className="mr-1.5 h-3.5 w-3.5 stroke-[3]" />
                    PILIHAN LOGIN
                  </Link>
                </Button>

                {/* Konten Judul Utama */}
                <div className="mt-12">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center border-2 border-slate-900 bg-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] rounded-sm">
                    <Package2 className="h-7 w-7 text-slate-900" />
                  </div>

                  <span className="block text-[10px] font-black tracking-widest text-slate-900/60 uppercase">
                    // HUB PORTAL USER
                  </span>
                  <h1 className="text-3xl font-black leading-none text-slate-900 uppercase tracking-tight sm:text-4xl">
                    LOGIN CUSTOMER
                  </h1>

                  <p className="mt-4 text-2xs font-bold uppercase text-slate-800 leading-relaxed max-w-xs">
                    Gunakan halaman ini jika Anda ingin mengecek resi paket, membuat order pengiriman baru, atau melihat daftar riwayat pembayaran ongkir Anda.
                  </p>
                </div>
              </div>

              {/* Catatan Kaki Kecil Pengaman */}
              <div className="relative z-10 mt-8 flex items-center gap-2 border-t-2 border-slate-900/10 pt-4 text-[10px] font-black text-slate-900/60 uppercase">
                <ShieldCheck size={14} className="stroke-[2.5]" />
                <span>Koneksi Masuk Terenkripsi Aman</span>
              </div>
            </div>


            {/* PANEL KANAN: Form Input Isian User */}
            <div className="p-6 sm:p-10 lg:col-span-7 flex flex-col justify-center bg-white">
              <div className="mb-6">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  Form Masuk Sistem
                </h2>
                <p className="text-2xs font-bold uppercase text-slate-400 tracking-wide mt-1">
                  Silakan masukkan alamat email dan password terdaftar Anda.
                </p>
              </div>

              {/* Form Interaksi Kirim Data */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* INPUTAN EMAIL */}
                <div className="grid gap-1.5">
                  <label className="text-3xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Mail size={10} className="text-slate-900 shrink-0" />
                    ALAMAT EMAIL KUSTOMER
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    className="h-11 w-full rounded-sm border-2 border-slate-900 bg-slate-50 px-3 text-2xs font-black text-slate-900 outline-none placeholder:text-slate-400 focus:bg-amber-50/40 focus:border-slate-900"
                    placeholder="contoh: namaanda@email.com"
                  />
                  {errors.email && (
                    <p className="text-3xs font-black uppercase text-rose-600 tracking-wide mt-0.5">
                      * {errors.email.message}
                    </p>
                  )}
                </div>

                {/* INPUTAN PASSWORD */}
                <div className="grid gap-1.5">
                  <label className="text-3xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Lock size={10} className="text-slate-900 shrink-0" />
                    KATA SANDI (PASSWORD)
                  </label>
                  <input
                    type="password"
                    {...register("password")}
                    className="h-11 w-full rounded-sm border-2 border-slate-900 bg-slate-50 px-3 text-2xs font-black text-slate-900 outline-none placeholder:text-slate-400 focus:bg-amber-50/40 focus:border-slate-900"
                    placeholder="Masukkan kata sandi akun"
                  />
                  {errors.password && (
                    <p className="text-3xs font-black uppercase text-rose-600 tracking-wide mt-0.5">
                      * {errors.password.message}
                    </p>
                  )}
                </div>

                {/* KOTAK SECURITY CAPTCHA */}
                <div className="rounded-sm border-2 border-dashed border-slate-300 bg-slate-50 p-4">
                  <SystemCaptcha
                    value={watch("captchaInput")}
                    error={errors.captchaInput?.message}
                    onChange={(answer) => setValue("captchaInput", answer)}
                  />
                </div>

                {/* NOTIFIKASI ERROR RUNTIME JIKA GAGAL LOGIN */}
                {error && (
                  <div className="rounded-sm border-2 border-slate-900 bg-rose-100 px-4 py-2.5 text-3xs font-black uppercase tracking-wide text-rose-900">
                    Gagal Masuk: {error}
                  </div>
                )}

                {/* TOMBOL SUBMIT EKSEKUSI MASUK */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-slate-900 text-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(251,191,36,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(251,191,36,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(251,191,36,1)] text-2xs font-black uppercase tracking-widest rounded-sm transition-all disabled:opacity-50"
                >
                  <User className="mr-1.5 h-4 w-4 stroke-[2.5]" />
                  MASUK KE PORTAL KUSTOMER
                </Button>
              </form>

              {/* LINK REGISTRASI AKUN BARU */}
              <div className="mt-6 border-t-2 border-slate-100 pt-5 text-center text-3xs font-black uppercase tracking-wide text-slate-400">
                Belum terdaftar sebagai member?{" "}
                <Link
                  href="/customer/register"
                  className="text-slate-900 underline decoration-amber-400 decoration-2 underline-offset-2 transition hover:text-amber-500"
                >
                  Daftar Akun Baru Di Sini
                </Link>
              </div>

            </div>

          </div>
        </CardContent>
      </Card>
    </main>
  );
}