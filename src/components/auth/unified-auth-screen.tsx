"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";

import { UnifiedAuthLayout } from "./unified-auth-layout";
import { SystemCaptcha } from "./system-captcha";
import { dashboardForRole } from "./staff-guard";
import { customerLogin, staffLogin, type CustomerAuthInput, type StaffAuthInput, logout } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
  captchaInput: z.string().min(1, "Captcha wajib diisi."),
});

// ================= CUSTOMER FORM =================
function CustomerLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  const { handleSubmit, register, setValue, watch, formState: { errors, isSubmitting } } = useForm<CustomerAuthInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", captchaInput: "" },
  });

  async function onSubmit(input: CustomerAuthInput) {
    setError("");
    try {
      await customerLogin(input);
      router.replace("/customer");
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Login gagal.");
      setValue("captchaInput", "");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-in fade-in duration-300">
      <div className="grid gap-2">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">Alamat email</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input type="email" {...register("email")} placeholder="you@company.com" className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm font-medium text-ink outline-none placeholder:text-muted focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
        </div>
        {errors.email && <p className="text-xs font-medium text-destructive mt-0.5">{errors.email.message}</p>}
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">Kata sandi</label>
          <Link href="#" className="text-xs font-semibold text-primary hover:underline">Lupa kata sandi?</Link>
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input type="password" {...register("password")} placeholder="••••••••" className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm font-medium text-ink outline-none placeholder:text-muted focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
        </div>
        {errors.password && <p className="text-xs font-medium text-destructive mt-0.5">{errors.password.message}</p>}
      </div>

      <div className="rounded-xl border border-border/60 bg-slate-50/50 p-4 shadow-inner">
        <SystemCaptcha value={watch("captchaInput")} error={errors.captchaInput?.message} onChange={(answer) => setValue("captchaInput", answer)} />
      </div>

      {error && <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}

      <Button type="submit" disabled={isSubmitting} size="lg" className="w-full h-11 text-sm font-semibold mt-2 group relative overflow-hidden bg-[#0F6E56] hover:bg-[#0F6E56]/90 text-white rounded-xl shadow-none">
        {isSubmitting ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memverifikasi...</>
        ) : (
          <span className="flex items-center gap-2">Masuk <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
        )}
      </Button>
      
      <div className="mt-8 border-t border-border/50 pt-6 text-center text-sm font-medium text-muted">
        Belum punya akun? <Link href="/customer/register" className="text-ink font-semibold hover:text-primary transition-colors ml-1">Buat akun</Link>
      </div>
    </form>
  );
}

// ================= STAFF FORM =================
function StaffLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  const { handleSubmit, register, setValue, watch, formState: { errors, isSubmitting } } = useForm<StaffAuthInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", captchaInput: "" },
  });

  async function onSubmit(input: StaffAuthInput) {
    setError("");
    try {
      const response = await staffLogin(input);
      const role = String(response.data?.user && typeof response.data.user === "object" && "role" in response.data.user ? response.data.user.role : response.data?.role);

      if (!["admin", "cashier", "courier", "manager", "owner"].includes(role)) {
        await logout().catch(() => null);
        setError("Role staff tidak dikenali.");
        return;
      }
      router.replace(dashboardForRole(role));
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Login staff gagal.");
      setValue("captchaInput", "");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-in fade-in duration-300">
      <div className="grid gap-2">
        <label className="text-xs font-semibold text-muted uppercase tracking-wider">Email kerja</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input type="email" {...register("email")} placeholder="name@company.com" className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm font-medium text-ink outline-none placeholder:text-muted focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm" />
        </div>
        {errors.email && <p className="text-xs font-medium text-destructive mt-0.5">{errors.email.message}</p>}
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">Kata sandi</label>
          <span className="text-[10px] font-semibold text-muted">CONTACT IT FOR RESET</span>
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input type="password" {...register("password")} placeholder="••••••••" className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm font-medium text-ink outline-none placeholder:text-muted focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm" />
        </div>
        {errors.password && <p className="text-xs font-medium text-destructive mt-0.5">{errors.password.message}</p>}
      </div>

      <div className="rounded-xl border border-border/60 bg-slate-50/50 p-4 shadow-inner">
        <SystemCaptcha value={watch("captchaInput")} error={errors.captchaInput?.message} onChange={(answer) => setValue("captchaInput", answer)} />
      </div>

      {error && <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}

      <Button type="submit" disabled={isSubmitting} size="lg" className="w-full h-11 text-sm font-semibold mt-2 group relative overflow-hidden bg-[#0F6E56] hover:bg-[#0F6E56]/90 text-white rounded-xl shadow-none">
        {isSubmitting ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memverifikasi...</>
        ) : (
          <span className="flex items-center gap-2">Verifikasi <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
        )}
      </Button>
      
      <div className="mt-8 border-t border-border/50 pt-6 text-center text-xs font-medium text-muted">
        Staff accounts are provisioned internally by the Administrator. Self-registration is disabled.
      </div>
    </form>
  );
}

// ================= MAIN UNIFIED SCREEN =================
export function UnifiedAuthScreen({ defaultTab = "customer" }: { defaultTab?: "customer" | "staff" }) {
  const [activeTab, setActiveTab] = useState<"customer" | "staff">(defaultTab);

  return (
    <UnifiedAuthLayout context={activeTab}>
      <div className="w-full">
        
        <Tabs defaultValue={activeTab} onValueChange={(v) => setActiveTab(v as "customer" | "staff")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100/80 p-1.5 rounded-xl h-12">
            <TabsTrigger value="customer" className="rounded-lg h-9 text-sm font-semibold data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-sm">
              Pelanggan
            </TabsTrigger>
            <TabsTrigger value="staff" className="rounded-lg h-9 text-sm font-semibold data-[state=active]:bg-surface data-[state=active]:text-rose-600 data-[state=active]:shadow-sm">
              Staf & internal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="mt-0 outline-none">
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-2xl font-semibold text-ink tracking-tight">Selamat datang kembali</h2>
              <p className="text-sm font-medium text-muted mt-1">Masuk ke portal pelanggan Anda.</p>
            </div>
            <CustomerLoginForm />
          </TabsContent>

          <TabsContent value="staff" className="mt-0 outline-none">
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-2xl font-semibold text-ink tracking-tight">Otentikasi Staf</h2>
              <p className="text-sm font-medium text-muted mt-1">Masukkan kredensial kerja Anda.</p>
            </div>
            <StaffLoginForm />
          </TabsContent>
        </Tabs>

      </div>
    </UnifiedAuthLayout>
  );
}
