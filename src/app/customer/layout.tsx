import { CustomerLayoutClient } from "@/components/customer/customer-layout-client";

export const dynamic = "force-dynamic";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <CustomerLayoutClient>{children}</CustomerLayoutClient>;
}
