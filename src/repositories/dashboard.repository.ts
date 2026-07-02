import type { Prisma } from "@prisma/client";
import { payments_payment_status, shipments_status } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getDashboardData(shipmentWhere: Prisma.shipmentsWhereInput = {}) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalCustomers,
    totalStaff,
    totalBranches,
    totalVehicles,
    totalShipments,
    shipmentStatuses,
    paymentStatuses,
    paidRevenue,
    todayPaidRevenue,
    monthlyPaidRevenue,
    recentShipments,
    recentPayments,
  ] = await prisma.$transaction([
    prisma.customers.count(),
    prisma.users.count(),
    prisma.branches.count(),
    prisma.vehicles.count(),
    prisma.shipments.count({ where: shipmentWhere }),
    prisma.shipments.groupBy({ by: ["status"], where: shipmentWhere, _count: { status: true } }),
    prisma.payments.groupBy({ by: ["payment_status"], where: { shipments: shipmentWhere }, _count: { payment_status: true } }),
    prisma.payments.aggregate({ where: { payment_status: payments_payment_status.paid, shipments: shipmentWhere }, _sum: { amount: true } }),
    prisma.payments.aggregate({ where: { payment_status: payments_payment_status.paid, payment_date: { gte: startOfDay }, shipments: shipmentWhere }, _sum: { amount: true } }),
    prisma.payments.aggregate({ where: { payment_status: payments_payment_status.paid, payment_date: { gte: startOfMonth }, shipments: shipmentWhere }, _sum: { amount: true } }),
    prisma.shipments.findMany({
      take: 10,
      where: shipmentWhere,
      orderBy: { created_at: "desc" },
      include: {
        customers_shipments_sender_idTocustomers: { select: { id: true, name: true, email: true, city: true, phone: true } },
        customers_shipments_receiver_idTocustomers: { select: { id: true, name: true, email: true, city: true, phone: true } },
        branches_shipments_origin_branch_idTobranches: true,
        branches_shipments_destination_branch_idTobranches: true,
        payments: true,
      },
    }),
    prisma.payments.findMany({
      take: 10,
      where: { shipments: shipmentWhere },
      orderBy: { created_at: "desc" },
      include: {
        shipments: {
          include: {
            branches_shipments_origin_branch_idTobranches: true,
            customers_shipments_sender_idTocustomers: { select: { id: true, name: true, email: true, city: true, phone: true } },
          },
        },
      },
    }),
  ]);

  const shipmentChart = Object.fromEntries(
    Object.values(shipments_status).map((status) => [status, 0]),
  ) as Record<shipments_status, number>;
  shipmentStatuses.forEach((item) => {
    shipmentChart[item.status] = item._count.status;
  });

  const paymentChart = {
    paid: 0,
    pending: 0,
    failed: 0,
  };
  paymentStatuses.forEach((item) => {
    paymentChart[item.payment_status] = item._count.payment_status;
  });

  return {
    totalCustomers,
    totalStaff,
    totalBranches,
    totalVehicles,
    totalShipments,
    totalPendingShipment: shipmentChart.pending,
    totalInTransitShipment: shipmentChart.in_transit,
    totalDeliveredShipment: shipmentChart.delivered,
    totalRevenue: Number(paidRevenue._sum.amount ?? 0),
    todayRevenue: Number(todayPaidRevenue._sum.amount ?? 0),
    monthlyRevenue: Number(monthlyPaidRevenue._sum.amount ?? 0),
    shipmentChart,
    paymentChart,
    recentShipments,
    recentPayments,
  };
}
