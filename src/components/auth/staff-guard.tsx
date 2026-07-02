"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentUser } from "@/lib/auth-client";
import type { CurrentUser, StaffRole } from "@/types/customer-portal";

const roleHome: Record<StaffRole, string> = {
  admin: "/staff/admin/dashboard",
  cashier: "/staff/cashier/dashboard",
  courier: "/staff/courier/dashboard",
  manager: "/staff/manager/dashboard",
  owner: "/staff/owner/dashboard",
};

export function dashboardForRole(role: string) {
  return roleHome[role as StaffRole] ?? "/staff/login";
}

export function StaffGuard({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole?: StaffRole;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState("");

  useEffect(() => {
    let mounted = true;

    getCurrentUser()
      .then((response) => {
        const currentUser = response.data as CurrentUser;
        if (currentUser.type !== "staff" && currentUser.role !== "admin" && currentUser.role !== "cashier" && currentUser.role !== "courier" && currentUser.role !== "manager" && currentUser.role !== "owner") {
          router.replace("/staff/login");
          return;
        }

        if (allowedRole && currentUser.role !== allowedRole) {
          setForbidden("Role tidak memiliki akses ke halaman ini.");
          router.replace(dashboardForRole(currentUser.role));
          return;
        }

        if (mounted) {
          setUser(currentUser);
        }
      })
      .catch(() => router.replace("/staff/login"))
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [allowedRole, pathname, router]);

  if (loading) {
    return <div className="staff-state">Memuat dashboard staff...</div>;
  }

  if (forbidden) {
    return <div className="staff-state">{forbidden}</div>;
  }

  if (!user) {
    return <div className="staff-state">Mengalihkan ke login...</div>;
  }

  return children;
}
