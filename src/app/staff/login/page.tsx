import type { Metadata } from "next";
import { UnifiedAuthScreen } from "@/components/auth/unified-auth-screen";

export const metadata: Metadata = {
  title: "Staff Login - DRG-EKSPEDISI",
  description: "Sign in to internal operations portal.",
};

export default function StaffLoginPage() {
  return <UnifiedAuthScreen defaultTab="staff" />;
}