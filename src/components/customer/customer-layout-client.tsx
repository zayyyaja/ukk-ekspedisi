"use client";

import {
  CreditCard,
  Home,
  LogOut,
  PackagePlus,
  Search,
  Truck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { customerLogout, getCurrentUser } from "@/lib/auth-client";
import { OfflineBanner } from "@/components/offline-banner";
import { PwaInstall } from "@/components/pwa-install";
import { SyncStatus } from "@/components/sync-status";
import { saveProfile } from "@/lib/offline-profile";

const menu = [
  { href: "/customer/dashboard", label: "Dashboard", icon: Home },
  { href: "/customer/dashboard/shipments/create", label: "Buat", icon: PackagePlus },
  { href: "/customer/dashboard/shipments", label: "Shipment", icon: Truck },
  { href: "/customer/dashboard/tracking", label: "Tracking", icon: Search },
  { href: "/customer/dashboard/payments", label: "Payment", icon: CreditCard },
  { href: "/customer/dashboard/profile", label: "Profile", icon: UserRound },
  { href: "/customer/dashboard/settings", label: "Settings", icon: UserRound },
];

function isActive(pathname: string, href: string) {
  if (href === "/customer/dashboard") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

export function CustomerLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    getCurrentUser()
      .then((response) => {
        const currentUser = response.data;
        if (currentUser?.role !== "customer") {
          router.replace("/customer/login");
          return;
        }

        if (mounted) {
          setUser(currentUser);
          void saveProfile(currentUser);
        }
      })
      .catch(() => {
        if (mounted) {
          setError("Sesi login tidak valid. Silakan login kembali.");
        }
        router.replace("/customer/login");
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleLogout() {
    await customerLogout().catch(() => null);
    router.replace("/customer/login");
  }

  if (loading) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <div className="brand-mark">Ekspedisi Online</div>
          <p className="subtitle">Memuat portal customer...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <div className="alert error">{error}</div>
        </section>
      </main>
    );
  }

  return (
    <div className="portal-shell">
      <aside className="sidebar">
        <div className="brand-mark">Ekspedisi</div>
        <nav className="nav-list">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className={`nav-link ${isActive(pathname, item.href) ? "active" : ""}`}
                href={item.href}
                key={item.href}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="portal-main">
        <header className="topbar">
          <div>
            <strong>{String(user?.name ?? "Customer")}</strong>
            <div className="muted">{String(user?.email ?? "")}</div>
          </div>
          <SyncStatus />
          <PwaInstall />
          <button className="button secondary" onClick={handleLogout} type="button">
            <LogOut size={17} />
            Logout
          </button>
        </header>
        <OfflineBanner />
        {children}
      </main>

      <nav className="mobile-nav">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              className={isActive(pathname, item.href) ? "active" : ""}
              href={item.href}
              key={item.href}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
