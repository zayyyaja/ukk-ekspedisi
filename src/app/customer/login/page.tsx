import type { Metadata } from "next";
import { UnifiedAuthScreen } from "@/components/auth/unified-auth-screen";

export const metadata: Metadata = {
  title: "Customer Login - DRG-EKSPEDISI",
  description: "Sign in to your customer portal.",
};

export default function CustomerLoginPage() {
  return <UnifiedAuthScreen defaultTab="customer" />;
}