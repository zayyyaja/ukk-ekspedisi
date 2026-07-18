"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Clock3, Mail, RefreshCcw, UserPlus, Layers, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { UnifiedAuthLayout } from "@/components/auth/unified-auth-layout";
import { customerRegister, resendVerification, type CustomerRegisterInput } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField, FormTextarea } from "@/components/ui/form-system";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter."),
  email: z.string().email("Email tidak valid."),
  password: z.string().min(8, "Password minimal 8 karakter."),
  passwordConfirmation: z.string().min(8, "Konfirmasi password wajib diisi."),
  address: z.string().min(1, "Alamat wajib diisi."),
  city: z.string().min(1, "Kota wajib diisi."),
  phone: z.string().min(1, "Telepon wajib diisi."),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Konfirmasi password tidak sama.",
  path: ["passwordConfirmation"],
});

function formatTime(seconds: number) {
  const hour = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const minute = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const second = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${hour}:${minute}:${second}`;
}

export default function CustomerRegisterPage() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [waitingEmail, setWaitingEmail] = useState("");
  const [pendingRegister, setPendingRegister] = useState<CustomerRegisterInput | null>(null);
  const [countdown, setCountdown] = useState(3600);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm<CustomerRegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "", email: "", password: "", passwordConfirmation: "", address: "", city: "", phone: "",
    },
  });

  const countdownText = useMemo(() => formatTime(countdown), [countdown]);

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
      setMessage("Kami telah mengirimkan link aktivasi ke email Anda. Cek inbox atau folder spam.");
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Registrasi gagal.");
      setMessage("");
    }
  }

  async function handleResend() {
    if (!pendingRegister) {
      setError("Data register sementara sudah tidak tersedia. Silakan isi form register ulang.");
      return;
    }
    setError("");
    setMessage("Mengirim ulang link verifikasi...");
    try {
      const response = await resendVerification(pendingRegister);
      setCountdown(response.data.expiresIn ?? 3600);
      setResendCooldown(60);
      setMessage("Link verifikasi baru berhasil dikirim ke email Anda.");
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Gagal mengirim ulang verifikasi.");
      setMessage("");
    }
  }

  // ================= STATE: WAITING VERIFICATION =================
  if (waitingEmail) {
    return (
      <UnifiedAuthLayout context="register">
        <div className="w-full text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mx-auto flex h-16 w-16 items-center justify-center bg-primary/10 rounded-2xl mb-6">
            <Mail className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-2xl font-semibold leading-tight text-ink tracking-tight mb-2">Cek email Anda</h1>
          <p className="text-sm font-medium text-muted leading-relaxed mb-8">
            Kami telah mengirim link aktivasi ke <br/>
            <strong className="text-ink font-semibold">{waitingEmail}</strong>
          </p>

          <div className="border border-border/60 bg-slate-50/50 p-6 rounded-2xl mb-8 shadow-inner">
            <Clock3 className="mx-auto mb-3 text-muted" size={24} />
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Batas waktu link</p>
            <h3 className="text-3xl font-semibold text-ink tracking-tight">{countdownText}</h3>
          </div>

          {message && <div className="mb-6 border border-emerald-500/20 bg-emerald-50 text-emerald-600 p-4 text-sm font-medium rounded-xl">{message}</div>}
          {error && <div className="mb-6 border border-destructive/20 bg-destructive/5 text-destructive p-4 text-sm font-medium rounded-xl">{error}</div>}

          <div className="flex flex-col gap-3">
            <Button type="button" onClick={handleResend} disabled={resendCooldown > 0} size="lg" className="w-full h-11 text-sm font-semibold rounded-xl bg-[#0F6E56] hover:bg-[#0F6E56]/90 text-white shadow-none">
              <RefreshCcw size={16} className="mr-2" />
              {resendCooldown > 0 ? `Kirim ulang dalam ${resendCooldown}s` : "Kirim Ulang Link"}
            </Button>
            <Button asChild variant="ghost" className="w-full h-11 text-muted hover:text-ink rounded-xl">
              <Link href="/customer/login">Kembali ke halaman masuk</Link>
            </Button>
          </div>
        </div>
      </UnifiedAuthLayout>
    );
  }

  // ================= STATE: MAIN REGISTER FORM =================
  return (
    <UnifiedAuthLayout context="register">
      <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        <div className="mb-6">
          <Button asChild variant="ghost" className="w-fit h-8 px-0 hover:bg-transparent text-muted hover:text-ink mb-4">
            <Link href="/customer/login">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke halaman masuk
            </Link>
          </Button>
          <h2 className="text-2xl font-semibold text-ink tracking-tight">Buat akun</h2>
          <p className="text-sm font-medium text-muted mt-1">Lengkapi data berikut untuk membuat akun Anda.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Nama lengkap" placeholder="John Doe" required {...register("name")} error={errors.name?.message} />
            <FormField label="Alamat email" type="email" placeholder="nama@perusahaan.com" required {...register("email")} error={errors.email?.message} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Nomor HP" placeholder="08XXXXXXXXXX" required {...register("phone")} error={errors.phone?.message} />
            <FormField label="Kota" placeholder="Contoh: Jakarta" required {...register("city")} error={errors.city?.message} />
          </div>

          <FormTextarea label="Alamat lengkap" rows={2} placeholder="Masukkan alamat pengiriman secara detail..." required {...register("address")} error={errors.address?.message} />

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Kata sandi" type="password" placeholder="••••••••" required {...register("password")} error={errors.password?.message} />
            <FormField label="Konfirmasi kata sandi" type="password" placeholder="••••••••" required {...register("passwordConfirmation")} error={errors.passwordConfirmation?.message} />
          </div>

          {error && <div className="rounded-xl border border-destructive/20 bg-destructive/5 text-destructive p-3 text-xs font-medium">{error}</div>}
          {message && <div className="rounded-xl border border-emerald-500/20 bg-emerald-50 text-emerald-600 p-3 text-xs font-medium">{message}</div>}

          <Button type="submit" disabled={isSubmitting} size="lg" className="w-full h-11 text-sm font-semibold mt-2 group relative overflow-hidden rounded-xl bg-[#0F6E56] hover:bg-[#0F6E56]/90 text-white shadow-none">
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</>
            ) : (
              <span className="flex items-center gap-2"><UserPlus size={16} /> Buat akun <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
            )}
          </Button>

        </form>

        <div className="mt-6 border-t border-border/50 pt-5 text-center text-sm font-medium text-muted">
          Sudah punya akun? <Link href="/customer/login" className="text-ink font-semibold hover:text-primary transition-colors ml-1">Masuk</Link>
        </div>
      </div>
    </UnifiedAuthLayout>
  );
}