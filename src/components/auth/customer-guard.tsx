"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { getCurrentUser } from "@/lib/auth-client";
import type { CurrentUser } from "@/types/customer-portal";

export function CustomerGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "allowed" | "forbidden">(
    "loading",
  );

  useEffect(() => {
    let mounted = true;

    getCurrentUser()
      .then((response) => {
        const user = response.data as CurrentUser;

        if (user.role !== "customer") {
          if (mounted) {
            setStatus("forbidden");
          }
          return;
        }

        if (mounted) {
          setStatus("allowed");
        }
      })
      .catch(() => router.replace("/customer/login"));

    return () => {
      mounted = false;
    };
  }, [router]);

  if (status === "loading") {
    return <LoadingState title="Memuat portal customer" />;
  }

  if (status === "forbidden") {
    return (
      <ErrorState
        title="Akses ditolak"
        description="Halaman ini hanya bisa dibuka oleh customer."
      />
    );
  }

  return children;
}
