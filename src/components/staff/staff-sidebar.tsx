"use client";

import {
  BarChart3,
  Building2,
  CreditCard,
  LayoutDashboard,
  PackageCheck,
  ReceiptText,
  Route,
  Truck,
  UserCog,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { StaffRole } from "@/types/customer-portal";

const menus = {
  admin: [
    ["Dashboard", "/staff/admin/dashboard", LayoutDashboard],
    ["Branches", "/staff/admin/branches", Building2],
    ["Staff", "/staff/admin/staff", UserCog],
    ["Customers", "/staff/admin/customers", Users],
    ["Rates", "/staff/admin/rates", Route],
    ["Vehicles", "/staff/admin/vehicles", Truck],
    ["Shipments", "/staff/admin/shipments", PackageCheck],
    ["Payments", "/staff/admin/payments", CreditCard],
  ],
  cashier: [
    ["Dashboard", "/staff/cashier/dashboard", LayoutDashboard],
    ["Payments", "/staff/cashier/payments", CreditCard],
    ["Cash Verification", "/staff/cashier/cash-verification", WalletCards],
    ["Reports", "/staff/cashier/reports", ReceiptText],
  ],
  courier: [
    ["Dashboard", "/staff/courier/dashboard", LayoutDashboard],
    ["Shipments", "/staff/courier/shipments", PackageCheck],
    ["Pickups", "/staff/courier/pickups", Truck],
    ["Deliveries", "/staff/courier/deliveries", Route],
  ],
  manager: [
    ["Dashboard", "/staff/manager/dashboard", LayoutDashboard],
    ["Analytics", "/staff/manager/analytics", BarChart3],
    ["Shipments", "/staff/manager/shipments", PackageCheck],
    ["Payments", "/staff/manager/payments", CreditCard],
    ["Branches", "/staff/manager/branches", Building2],
  ],
} satisfies Record<StaffRole, [string, string, typeof LayoutDashboard][]>;

export function StaffSidebar({ role }: { role: StaffRole }) {
  const pathname = usePathname();

  return (
    <aside className="staff-sidebar">
      <div className="brand-mark">Staff Ekspedisi</div>
      <span className="role-pill">{role}</span>
      <nav className="nav-list">
        {menus[role].map(([label, href, Icon]) => (
          <Link
            className={`nav-link ${pathname.startsWith(href) ? "active" : ""}`}
            href={href}
            key={href}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function StaffMobileNav({ role }: { role: StaffRole }) {
  const pathname = usePathname();

  return (
    <nav className="staff-mobile-nav">
      {menus[role].slice(0, 5).map(([label, href, Icon]) => (
        <Link
          className={pathname.startsWith(href) ? "active" : ""}
          href={href}
          key={href}
        >
          <Icon size={18} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}
