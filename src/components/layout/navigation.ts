import {
  BarChart3,
  Building2,
  CreditCard,
  Home,
  PackageCheck,
  PackagePlus,
  ReceiptText,
  Route,
  Search,
  Settings,
  Truck,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";

import type { StaffRole } from "@/types/customer-portal";

export const customerMenu = [
  { href: "/customer", label: "Beranda", icon: Home },
  { href: "/customer/buat-pesanan", label: "Buat Shipment", icon: PackagePlus },
  { href: "/customer/lacak-paket", label: "Riwayat Shipment", icon: Truck },
  { href: "/customer/lacak-paket", label: "Tracking", icon: Search },
  { href: "/customer/lacak-paket", label: "Payments", icon: CreditCard },
  { href: "/customer/profile", label: "Profile", icon: UserRound },
];

export const staffMenus: Record<StaffRole, typeof customerMenu> = {
  admin: [
    { href: "/staff/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/staff/admin/branches", label: "Branches", icon: Building2 },
    { href: "/staff/admin/staff", label: "Staff", icon: UsersRound },
    { href: "/staff/admin/customers", label: "Customers", icon: UserRound },
    { href: "/staff/admin/rates", label: "Rates", icon: Route },
    { href: "/staff/admin/vehicles", label: "Vehicles", icon: Truck },
    { href: "/staff/admin/shipments", label: "Shipments", icon: PackageCheck },
    { href: "/staff/admin/payments", label: "Payments", icon: WalletCards },
  ],
  cashier: [
    { href: "/staff/cashier/dashboard", label: "Beranda", icon: Home },
    { href: "/staff/cashier/tambah-pesanan", label: "Tambah Pesanan", icon: PackagePlus },
    { href: "/staff/cashier/pesanan", label: "Pesanan", icon: PackageCheck },
    { href: "/staff/cashier/laporan", label: "Laporan", icon: BarChart3 },
  ],
  courier: [
    { href: "/staff/courier/dashboard", label: "Dashboard", icon: Home },
    { href: "/staff/courier/deliveries", label: "Deliveries", icon: PackageCheck },
    { href: "/staff/courier/shipments", label: "Shipments", icon: Truck },
  ],
  manager: [
    { href: "/staff/manager/dashboard", label: "Dashboard", icon: Home },
    { href: "/staff/manager/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/staff/manager/shipments", label: "Shipments", icon: PackageCheck },
    { href: "/staff/manager/payments", label: "Payments", icon: WalletCards },
    { href: "/staff/manager/branches", label: "Branches", icon: Building2 },
    { href: "/staff/manager/users", label: "Staff", icon: UsersRound },
    { href: "/staff/cashier/reports", label: "Reports", icon: ReceiptText },
  ],
  owner: [
    { href: "/staff/owner/dashboard", label: "Dashboard", icon: Home },
    { href: "/staff/owner/analytics", label: "Analytics", icon: BarChart3 },
  ],
};

export const settingsMenuItem = {
  href: "/customer/profile",
  label: "Settings",
  icon: Settings,
};
