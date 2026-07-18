import {
  BarChart3,
  Building2,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  Mail,
  PackageCheck,
  PackagePlus,
  PackageSearch,
  ReceiptText,
  Route,
  Search,
  Settings,
  Truck,
  User,
  Users,
  WalletCards,
} from "lucide-react";

import type { StaffRole } from "@/types/customer-portal";

export const customerMenu = [
  { href: "/customer", label: "Beranda", icon: Home },
  { href: "/customer/buat-pesanan", label: "Buat pengiriman", icon: PackagePlus },
  { href: "/customer/pesanan", label: "Riwayat pengiriman", icon: PackageSearch },
  { href: "/customer/inbox", label: "Inbox", icon: Mail },
  { href: "/customer/pembayaran", label: "Pembayaran", icon: CreditCard },
  { href: "/customer/profile", label: "Profil", icon: User },
];

export const staffMenus: Record<StaffRole, any> = {
  admin: [
    { href: "/staff/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/staff/admin/staff", label: "Staf", icon: Users },
    { href: "/staff/admin/branches", label: "Cabang", icon: Building2 },
    { href: "/staff/admin/vehicles", label: "Kendaraan", icon: Truck },
    { href: "/staff/admin/shipments", label: "Pengiriman", icon: PackageCheck },
    { href: "/staff/admin/payments", label: "Laporan", icon: ReceiptText },
  ],
  cashier: [
    { href: "/staff/cashier/dashboard", label: "Beranda", icon: Home },
    { href: "/staff/cashier/tambah-pesanan", label: "Tambah pesanan", icon: PackagePlus },
    { href: "/staff/cashier/pesanan", label: "Pesanan", icon: PackageCheck },
    { href: "/staff/cashier/laporan", label: "Laporan", icon: BarChart3 },
  ],
  courier: [
    { href: "/staff/courier/dashboard", label: "Beranda", icon: Home },
    { href: "/staff/courier/shipments", label: "Pengiriman", icon: Truck },
  ],
  manager: [
    { href: "/staff/manager/dashboard", label: "Dashboard", icon: Home },
    { href: "/staff/manager/branches", label: "Cabang", icon: Building2 },
    { href: "/staff/manager/users", label: "Admin cabang", icon: Users },
  ],
  owner: [
    { href: "/staff/owner/dashboard", label: "Dashboard", icon: Home },
    { href: "/staff/owner/analytics", label: "Analitik", icon: BarChart3 },
  ],
};

export const settingsMenuItem = {
  href: "/customer/profile",
  label: "Settings",
  icon: Settings,
};
