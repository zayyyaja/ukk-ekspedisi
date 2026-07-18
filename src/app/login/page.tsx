import type { Metadata } from "next";
import { UnifiedAuthScreen } from "@/components/auth/unified-auth-screen";

export const metadata: Metadata = {
  title: "Portal Access - DRG-EKSPEDISI",
  description: "Enterprise authentication portal for DRG-EKSPEDISI.",
};

export default function LoginPage() {
  return <UnifiedAuthScreen defaultTab="customer" />;
}