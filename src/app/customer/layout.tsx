import { CustomerQueryProvider } from "@/components/customer/customer-query-provider";

export const dynamic = "force-dynamic";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <CustomerQueryProvider>{children}</CustomerQueryProvider>;
}
