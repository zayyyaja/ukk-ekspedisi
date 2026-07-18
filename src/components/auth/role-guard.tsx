"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { getCurrentUser } from "@/lib/auth-client";
import type { CurrentUser, StaffRole } from "@/types/customer-portal";

export function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: StaffRole[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "allowed" | "forbidden">(
    "loading",
  );

  useEffect(() => {
    let mounted = true;

    getCurrentUser()
      .then((response) => {
        const user = response.data as CurrentUser;

        if (!allowedRoles.includes(user.role as StaffRole)) {
          if (mounted) {
            setStatus("forbidden");
          }
          return;
        }

        if (mounted) {
          setStatus("allowed");
        }
      })
      .catch(() => router.replace("/staff/login"));

    return () => {
      mounted = false;
    };
  }, [allowedRoles, router]);

  if (status === "loading") {
    return <LoadingState title="Preparing workspace" />;
  }

  if (status === "forbidden") {
    return (
      <ErrorState
        title="Akses ditolak"
        description="Role Anda tidak memiliki izin membuka halaman ini."
      />
    );
  }

  return children;
}
