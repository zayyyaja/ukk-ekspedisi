"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Clock3,
  Mail,
  Package2,
  RefreshCcw,
  UserPlus,
  Layers,
  ShieldCheck,
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

  // ================= STATE: WAITING VERIFICATION (NEO-BRUTALIST) =================
  if (waitingEmail) {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-slate-50 font-mono select-none px-4 py-12">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-60" />
        
        <Card className="relative z-10 w-full max-w-5xl border-4 border-slate-900 bg-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="grid lg:grid-cols-12 items-stretch">
              
              {/* SISI KIRI BRANDING */}
              <div className="lg:col-span-5 bg-slate-900 text-white p-8 flex flex-col justify-between border-b-4 lg:border-b-0 lg:border-r-4 border-slate-900">
                <div>
                  <Button asChild className="bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:translate-y-px text-3xs font-black uppercase tracking-wider rounded-sm h-8 px-3 cursor-pointer">
                    <Link href="/customer/login" className="flex items-center gap-1.5">
                      <ArrowLeft size={10} className="stroke-[2.5]" /> LOGIN TERMINAL
                    </Link>
                  </Button>
                  <div className="mt-12 flex h-16 w-16 items-center justify-center border-4 border-white bg-amber-400 text-slate-950 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] rounded-sm">
                    <Package2 size={28} className="stroke-[2.5]" />
                  </div>
                  <p className="mt-6 text-3xs font-black uppercase tracking-[0.25em] text-amber-400">[ STASIUN_VERIFIKASI ]</p>
                  <h1 className="text-3xl font-black leading-none uppercase mt-2">Otorisasi Jalur Paket</h1>
                </div>
                <div className="mt-8 border-t border-slate-800 pt-6">
                  <p className="text-3xs font-bold text-slate-400 uppercase leading-relaxed">
                    Sistem mengamankan paket pendaftaran. Mohon tuntaskan proses verifikasi surat elektronik sebelum merilis manifes utama.
                  </p>
                </div>
              </div>

              {/* SISI KANAN AKSI */}
              <div className="lg:col-span-7 p-8 flex flex-col justify-center space-y-6 bg-white">
                <div className="flex items-center gap-2 border-b-2 border-slate-900/10 pb-4">
                  <div className="border-2 border-slate-900 bg-amber-400 p-1.5 rounded-sm">
                    <Mail size={16} className="text-slate-950 stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">PERIKSA KORIDOR INBOX</h2>
                    <p className="text-3xs font-bold text-slate-400 uppercase">Sinyal aktivasi terkirim</p>
                  </div>
                </div>

                <div className="border-2 border-slate-900 bg-slate-50 p-4 rounded-sm shadow-[3px_3px_0px_0px_rgba(15,23,42,0.05)]">
                  <p className="text-3xs font-black uppercase text-slate-500 tracking-wider">TARGET_EMAIL_DIREKTORI :</p>
                  <p className="text-sm font-black text-slate-900 mt-1 break-all uppercase">{waitingEmail}</p>
                </div>

                <div className="border-2 border-slate-900 bg-rose-50 p-6 text-center rounded-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-[size:16px_16px] opacity-5 pointer-events-none" />
                  <Clock3 className="mx-auto mb-2 text-rose-500 stroke-[2.5]" size={24} />
                  <p className="text-3xs font-black text-slate-500 uppercase tracking-wider">MASA BERLAKU MANIFES AKTIVASI</p>
                  <h3 className="text-3xl font-black text-rose-600 tracking-tight mt-1">{countdownText}</h3>
                </div>

                {message && (
                  <div className="border-2 border-slate-900 bg-emerald-50 text-emerald-950 p-3 text-3xs font-black uppercase rounded-sm">
                    // {message}
                  </div>
                )}
                {error && (
                  <div className="border-2 border-slate-900 bg-rose-100 text-rose-950 p-3 text-3xs font-black uppercase rounded-sm">
                    [ LOG_ERROR ]: {error}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <Button type="button" onClick={handleResend} disabled={resendCooldown > 0} className="h-11 bg-slate-900 text-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] hover:-translate-x-px hover:-translate-y-px text-3xs font-black uppercase tracking-widest rounded-sm transition-all cursor-pointer">
                    <RefreshCcw size={12} className="mr-2 stroke-[2.5]" />
                    {resendCooldown > 0 ? `COOLDOWN (${resendCooldown}S)` : "TRANSMISI ULANG"}
                  </Button>
                  <Button asChild variant="outline" className="h-11 border-2 border-slate-900 bg-transparent text-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-px hover:-translate-y-px text-3xs font-black uppercase tracking-widest rounded-sm transition-all">
                    <Link href="/customer/login">BATAL & KEMBALI</Link>
                  </Button>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // ================= STATE: MAIN REGISTER FORM (NEO-BRUTALIST) =================
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 font-mono select-none px-4 py-12">
      {/* Pola Grid Latar Belakang Gudang Logistik */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-60" />
      
      {isSubmitting && <FullPageLoader label="Mengunci Data Pendaftaran..." />}

      <Card className="relative z-10 w-full max-w-6xl border-4 border-slate-900 bg-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="grid lg:grid-cols-12 items-stretch">

            {/* ================= SISI KIRI: BRANDING & BENEFIT ================= */}
            <div className="lg:col-span-4 bg-slate-900 text-white p-8 flex flex-col justify-between border-b-4 lg:border-b-0 lg:border-r-4 border-slate-900">
              <div>
                <Button asChild className="bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:translate-y-px text-3xs font-black uppercase tracking-wider rounded-sm h-8 px-3 cursor-pointer">
                  <Link href="/customer/login" className="flex items-center gap-1.5">
                    <ArrowLeft size={10} className="stroke-[2.5]" /> KEMBALI
                  </Link>
                </Button>

                <div className="mt-12 flex h-16 w-16 items-center justify-center border-4 border-white bg-amber-400 text-slate-950 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] rounded-sm">
                  <Package2 size={28} className="stroke-[2.5]" />
                </div>

                <p className="mt-6 text-3xs font-black uppercase tracking-[0.25em] text-amber-400">ANTERIN // LOGISTIK</p>
                <h1 className="text-3xl font-black leading-none uppercase mt-2">REGISTRASI MANIFES</h1>
                <p className="mt-4 text-3xs font-bold text-slate-400 leading-relaxed uppercase">
                  Daftarkan basis data kargo mandiri untuk membuka akses distribusi pipeline realtime, lacak posisi terenkripsi, dan kontrol manajerial satu pintu.
                </p>
              </div>

              {/* Hak Istimewa Box */}
              <div className="mt-8 border-4 border-slate-800 bg-slate-950 p-4 rounded-sm">
                <div className="flex items-center gap-1.5 text-amber-400 text-3xs font-black uppercase tracking-widest mb-3">
                  <Layers size={10} className="text-amber-400" />
                  <span>[ HAK_AKSES_REGULER ]</span>
                </div>
                <ul className="space-y-2 text-3xs font-black text-slate-300 uppercase tracking-wide">
                  <li>[✓] TRACKING PARSEL REAL-TIME</li>
                  <li>[✓] REKAM HISTORI TRANS-AKSI PEJAL</li>
                  <li>[✓] MANAGEMEN DEPO ALAMAT</li>
                  <li>[✓] SINYAL NOTIFIKASI PIPELINE</li>
                </ul>
              </div>
            </div>

            {/* ================= SISI KANAN: FORM INPUT NEO-BRUTALIST ================= */}
            <div className="lg:col-span-8 p-8 lg:p-10 bg-white">
              <div className="mb-6 border-b-2 border-slate-900/10 pb-4">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">BUAT MANIFES AKUN</h2>
                <p className="text-3xs font-bold text-slate-400 uppercase mt-0.5">Isi seluruh parameter kontrol keamanan berikut</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                
                {/* baris 1: Nama & Email */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-3xs font-black uppercase tracking-wider text-slate-500">NAMA LENGKAP PENGGUNA</label>
                    <input type="text" placeholder="CONTOH: BUDI UTOMO" {...register("name")} className="h-11 w-full rounded-sm border-2 border-slate-900 bg-slate-50 px-3 text-2xs font-black uppercase tracking-wide text-slate-900 outline-none focus:bg-amber-50 placeholder:text-slate-400" />
                    {errors.name && <p className="text-3xs font-black text-rose-600 mt-1 uppercase">// {errors.name.message}</p>}
                  </div>

                  <div className="grid gap-1.5">
                    <label className="text-3xs font-black uppercase tracking-wider text-slate-500">ALAMAT SURAT ELEKTRONIK (EMAIL)</label>
                    <input type="email" placeholder="NAMA@SURAT.COM" {...register("email")} className="h-11 w-full rounded-sm border-2 border-slate-900 bg-slate-50 px-3 text-2xs font-black uppercase tracking-wide text-slate-900 outline-none focus:bg-amber-50 placeholder:text-slate-400" />
                    {errors.email && <p className="text-3xs font-black text-rose-600 mt-1 uppercase">// {errors.email.message}</p>}
                  </div>
                </div>

                {/* baris 2: Telepon & Kota */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-3xs font-black uppercase tracking-wider text-slate-500">NOMOR TELEPON (LOG_KONTAK)</label>
                    <input type="text" placeholder="08XXXXXXXXXX" {...register("phone")} className="h-11 w-full rounded-sm border-2 border-slate-900 bg-slate-50 px-3 text-2xs font-black uppercase tracking-wide text-slate-900 outline-none focus:bg-amber-50 placeholder:text-slate-400" />
                    {errors.phone && <p className="text-3xs font-black text-rose-600 mt-1 uppercase">// {errors.phone.message}</p>}
                  </div>

                  <div className="grid gap-1.5">
                    <label className="text-3xs font-black uppercase tracking-wider text-slate-500">SEKTOR KOTA DOMISILI</label>
                    <input type="text" placeholder="MISAL: JAKARTA UTARA" {...register("city")} className="h-11 w-full rounded-sm border-2 border-slate-900 bg-slate-50 px-3 text-2xs font-black uppercase tracking-wide text-slate-900 outline-none focus:bg-amber-50 placeholder:text-slate-400" />
                    {errors.city && <p className="text-3xs font-black text-rose-600 mt-1 uppercase">// {errors.city.message}</p>}
                  </div>
                </div>

                {/* baris 3: Alamat */}
                <div className="grid gap-1.5">
                  <label className="text-3xs font-black uppercase tracking-wider text-slate-500">ALAMAT TITIK KOORDINAT (GUDANG/RUMAH)</label>
                  <textarea rows={3} placeholder="MASUKKAN ALAMAT DETAIL BESERTA KODE POS..." {...register("address")} className="w-full rounded-sm border-2 border-slate-900 bg-slate-50 px-3 py-2 text-2xs font-black uppercase tracking-wide text-slate-900 outline-none focus:bg-amber-50 resize-none placeholder:text-slate-400" />
                  {errors.address && <p className="text-3xs font-black text-rose-600 mt-1 uppercase">// {errors.address.message}</p>}
                </div>

                {/* baris 4: Password */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-3xs font-black uppercase tracking-wider text-slate-500">KUNCI SANDI (MIN 8 KARAKTER)</label>
                    <input type="password" placeholder="********" {...register("password")} className="h-11 w-full rounded-sm border-2 border-slate-900 bg-slate-50 px-3 text-2xs font-black tracking-wide text-slate-900 outline-none focus:bg-amber-50" />
                    {errors.password && <p className="text-3xs font-black text-rose-600 mt-1 uppercase">// {errors.password.message}</p>}
                  </div>

                  <div className="grid gap-1.5">
                    <label className="text-3xs font-black uppercase tracking-wider text-slate-500">RE-KONFIRMASI KUNCI SANDI</label>
                    <input type="password" placeholder="********" {...register("passwordConfirmation")} className="h-11 w-full rounded-sm border-2 border-slate-900 bg-slate-50 px-3 text-2xs font-black tracking-wide text-slate-900 outline-none focus:bg-amber-50" />
                    {errors.passwordConfirmation && <p className="text-3xs font-black text-rose-600 mt-1 uppercase">// {errors.passwordConfirmation.message}</p>}
                  </div>
                </div>

                {/* Info Logs Alert */}
                {error && <div className="border-2 border-slate-900 bg-rose-100 text-rose-950 p-3 text-3xs font-black uppercase rounded-sm">[ LOG_ERROR ]: {error}</div>}
                {message && <div className="border-2 border-slate-900 bg-emerald-50 text-emerald-950 p-3 text-3xs font-black uppercase rounded-sm">// {message}</div>}

                {/* Submit Trigger */}
                <Button type="submit" disabled={isSubmitting} className="w-full h-11 bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] text-2xs font-black uppercase tracking-widest rounded-sm transition-all cursor-pointer">
                  <UserPlus size={14} className="mr-2 stroke-[2.5]" /> DAFTARKAN SEKARANG
                </Button>

              </form>

              {/* Switch Route Login */}
              <div className="mt-8 border-t-2 border-slate-900/10 pt-6 text-center text-3xs font-black uppercase tracking-wider text-slate-500">
                Sudah terdaftar di manifest log?{" "}
                <Link href="/customer/login" className="text-slate-950 underline decoration-amber-400 decoration-2 underline-offset-4 hover:bg-amber-100 px-1 py-0.5">
                  MASUK TERMINAL
                </Link>
              </div>

            </div>

          </div>
        </CardContent>
      </Card>
    </main>
  );
}