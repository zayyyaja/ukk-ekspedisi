import {
  BarChart3,
  Building2,
  CreditCard,
  Home,
  MapPinned,
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
  { href: "/customer/dashboard", label: "Dashboard", icon: Home },
  { href: "/customer/dashboard/shipments/create", label: "Buat Shipment", icon: PackagePlus },
  { href: "/customer/dashboard/shipments", label: "Riwayat Shipment", icon: Truck },
  { href: "/customer/dashboard/tracking", label: "Tracking", icon: Search },
  { href: "/customer/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/customer/dashboard/profile", label: "Profile", icon: UserRound },
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
    { href: "/staff/cashier/dashboard", label: "Dashboard", icon: Home },
    { href: "/staff/cashier/payments", label: "Payments", icon: WalletCards },
    { href: "/staff/cashier/cash-verification", label: "Cash Verification", icon: ReceiptText },
    { href: "/staff/cashier/reports", label: "Reports", icon: BarChart3 },
  ],
  courier: [
    { href: "/staff/courier/dashboard", label: "Dashboard", icon: Home },
    { href: "/staff/courier/pickups", label: "Pickups", icon: MapPinned },
    { href: "/staff/courier/deliveries", label: "Deliveries", icon: PackageCheck },
    { href: "/staff/courier/shipments", label: "Shipments", icon: Truck },
  ],
  manager: [
    { href: "/staff/manager/dashboard", label: "Dashboard", icon: Home },
    { href: "/staff/manager/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/staff/manager/shipments", label: "Shipments", icon: PackageCheck },
    { href: "/staff/manager/payments", label: "Payments", icon: WalletCards },
    { href: "/staff/manager/branches", label: "Branches", icon: Building2 },
    { href: "/staff/cashier/reports", label: "Reports", icon: ReceiptText },
  ],
};

export const settingsMenuItem = {
  href: "/customer/dashboard/settings",
  label: "Settings",
  icon: Settings,
};
