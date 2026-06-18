"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { dashboardForRole } from "@/components/auth/staff-guard";
import { TurnstileCaptcha } from "@/components/auth/turnstile-captcha";
import { getCurrentUser, logout, staffLogin, type StaffAuthInput } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
  captchaToken: z.string().min(1, "Captcha wajib diisi."),
});

export default function StaffLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StaffAuthInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", captchaToken: "" },
  });

  useEffect(() => {
    getCurrentUser()
      .then((response) => {
        const role = String(response.data?.role ?? "");
        if (["admin", "cashier", "courier", "manager"].includes(role)) {
          router.replace(dashboardForRole(role));
        }
      })
      .catch(() => null);
  }, [router]);

  async function onSubmit(input: StaffAuthInput) {
    setError("");
    try {
      const response = await staffLogin(input);
      const role = String(response.data?.user && typeof response.data.user === "object" && "role" in response.data.user ? response.data.user.role : response.data?.role);

      if (!["admin", "cashier", "courier", "manager"].includes(role)) {
        await logout().catch(() => null);
        setError("Role staff tidak dikenali.");
        return;
      }

      router.replace(dashboardForRole(role));
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "Login staff gagal.");
      setValue("captchaToken", "");
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand-mark">Staff Ekspedisi</div>
        <h1 className="title">Masuk staff</h1>
        <p className="subtitle">Dashboard internal untuk admin, cashier, courier, dan manager.</p>

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
          <button className="button primary" disabled={isSubmitting} type="submit">
            <ShieldCheck size={17} />
            {isSubmitting ? "Memproses..." : "Login staff"}
          </button>
        </form>
      </section>
    </main>
  );
}
