import type { Prisma } from "@prisma/client";
import { randomBytes } from "node:crypto";
import {
  payments_payment_method,
  payments_payment_status,
  shipment_trackings_status,
  shipments_created_source,
  shipments_handover_method,
  shipments_status,
} from "@prisma/client";

import {
  SHIPMENT_STATUS_TRANSITIONS,
  type ShipmentStatus,
} from "@/constants/shipment-status";
import {
  assignCourier,
  countCustomerCreatedShipmentsSince,
  countCustomerPendingPaymentShipments,
  createCashierShipmentWithCustomers,
  createShipmentWithItemsAndPayment,
  findAllShipments,
  findBranchById,
  findCourierByCode,
  findCourierShipments,
  findCustomerById,
  findCustomerShipments,
  findRateByCities,
  findRateById,
  findShipmentById,
  findShipmentByTrackingNumber,
  findShipmentWithRelations,
  cancelCustomerShipment as cancelCustomerShipmentRepository,
  updateShipmentStatus as updateShipmentStatusRepository,
} from "@/repositories/shipment.repository";
import type { AuthUser } from "@/types/auth";
import type {
  CreateCashierOrderInput,
  CreateShipmentInput,
  ShipmentListQuery,
  UpdateShipmentStatusInput,
} from "@/validations/shipment.validation";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import {
  applyShipmentScope,
  isShipmentVisibleToBranch,
} from "@/lib/shipment-scope";

function toJsonSafe<T>(value: T) {
  return JSON.parse(
    JSON.stringify(value, (_key, currentValue: unknown) => {
      if (typeof currentValue === "bigint") {
        return currentValue.toString();
      }

      return currentValue;
    }),
  ) as unknown;
}

function toBigInt(id: number) {
  return BigInt(id);
}

function paginate(query: ShipmentListQuery) {
  const page = query.page;
  const limit = query.limit;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

function paginationMeta(total: number, page: number, limit: number) {
  return {
    page,
    perPage: limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

function generateTrackingNumber() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  const suffix = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");

  return `EXP-${suffix}`;
}

function paymentExpiresAt(paymentMethod: payments_payment_method) {
  if (paymentMethod !== payments_payment_method.cash) {
    return null;
  }

  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

function assertPaymentAllowed(
  handoverMethod: shipments_handover_method,
  paymentMethod: payments_payment_method,
) {
  if (
    handoverMethod === shipments_handover_method.pickup &&
    paymentMethod === payments_payment_method.cash
  ) {
    throw new ValidationError("Metode Jemput Paket hanya menerima pembayaran Midtrans.");
  }
}

function calculateTotalPrice(
  totalWeight: number,
  pricePerKg: unknown,
  handoverMethod: shipments_handover_method,
) {
  const pickupFee = handoverMethod === shipments_handover_method.pickup ? 10000 : 0;
  return totalWeight * Number(pricePerKg) + pickupFee;
}

function ensureCustomer(user: AuthUser) {
  if (user.role !== "customer") {
    throw new ForbiddenError("Customer access required");
  }
}

function ensureAdmin(user: AuthUser) {
  if (user.role !== "admin") {
    throw new ForbiddenError("Admin access required");
  }

  if (!user.branchId) {
    throw new ForbiddenError("Admin branch is required");
  }
}

function ensureAdminOrManager(user: AuthUser) {
  if (user.role !== "admin" && user.role !== "manager") {
    throw new ForbiddenError("Admin or manager access required");
  }
}

function ensureCashier(user: AuthUser) {
  if (user.role !== "cashier") {
    throw new ForbiddenError("Cashier access required");
  }

  if (!user.branchId) {
    throw new ForbiddenError("Cashier branch is required");
  }
}

function ensureCourier(user: AuthUser) {
  if (user.role !== "courier") {
    throw new ForbiddenError("Courier access required");
  }
}

function ensureShipmentOwner(
  user: AuthUser,
  shipment: {
    sender_id: bigint;
    receiver_id: bigint;
  },
) {
  if (
    shipment.sender_id !== toBigInt(user.id) &&
    shipment.receiver_id !== toBigInt(user.id)
  ) {
    throw new ForbiddenError("You are not allowed to access this shipment");
  }
}

function buildBaseWhere(query: ShipmentListQuery): Prisma.shipmentsWhereInput {
  const where: Prisma.shipmentsWhereInput = {};

  if (query.status) {
    where.status = query.status as shipments_status;
  }

  if (query.branchId) {
    where.OR = [
      { origin_branch_id: toBigInt(query.branchId) },
      { destination_branch_id: toBigInt(query.branchId) },
    ];
  }

  if (query.courierId) {
    where.courier_id = toBigInt(query.courierId);
  }

  if (query.handoverMethod) {
    where.handover_method = query.handoverMethod as shipments_handover_method;
  }

  if (query.fromDate || query.toDate) {
    where.shipment_date = {
      gte: query.fromDate ? new Date(query.fromDate) : undefined,
      lte: query.toDate ? new Date(query.toDate) : undefined,
    };
  }

  return where;
}

function mergeShipmentWhere(
  base: Prisma.shipmentsWhereInput,
  scope: Prisma.shipmentsWhereInput,
): Prisma.shipmentsWhereInput {
  const clauses = [base, scope].filter((item) => Object.keys(item).length > 0);

  return clauses.length > 1 ? { AND: clauses } : clauses[0] ?? {};
}

function isSameCity(shipment: {
  branches_shipments_origin_branch_idTobranches: { city: string };
  branches_shipments_destination_branch_idTobranches: { city: string };
}) {
  return (
    shipment.branches_shipments_origin_branch_idTobranches.city ===
    shipment.branches_shipments_destination_branch_idTobranches.city
  );
}

function assertTransitionAllowed(
  currentStatus: shipments_status,
  nextStatus: shipments_status,
) {
  if (nextStatus === shipments_status.in_transit && currentStatus !== shipments_status.picked_up) {
    throw new ValidationError("Admin tidak dapat melakukan departure apabila shipment belum picked_up.");
  }

  if (nextStatus === shipments_status.arrived_at_branch && currentStatus !== shipments_status.in_transit) {
    throw new ValidationError("Admin Tujuan tidak dapat melakukan arrival apabila shipment belum in_transit.");
  }

  if (nextStatus === shipments_status.delivered && currentStatus !== shipments_status.out_for_delivery) {
    throw new ValidationError("Kurir tidak dapat melakukan delivery apabila shipment belum out_for_delivery.");
  }

  const baseAllowed =
    SHIPMENT_STATUS_TRANSITIONS[currentStatus as ShipmentStatus] ?? [];

  if (!baseAllowed.includes(nextStatus as ShipmentStatus)) {
    throw new ValidationError("Invalid shipment status transition");
  }
}

function assertRoleCanUpdateStatus(
  user: AuthUser,
  shipment: {
    courier_id: bigint | null;
    origin_branch_id: bigint;
    destination_branch_id: bigint;
    status: shipments_status;
  },
  nextStatus: shipments_status,
) {
  if (user.role === "admin") {
    if (!user.branchId) {
      throw new ForbiddenError("Admin branch is required");
    }

    const userBranchId = toBigInt(user.branchId);
    const isOriginBranch = shipment.origin_branch_id === userBranchId;
    const isDestinationBranch = shipment.destination_branch_id === userBranchId;

    if (
      shipment.status === shipments_status.picked_up &&
      nextStatus === shipments_status.in_transit &&
      isOriginBranch
    ) {
      return;
    }

    if (
      shipment.status === shipments_status.in_transit &&
      nextStatus === shipments_status.arrived_at_branch &&
      isDestinationBranch
    ) {
      return;
    }

    throw new ForbiddenError("Admin cannot perform this branch status transition");
  }

  if (user.role === "cashier" || user.role === "manager") {
    throw new ForbiddenError("You are not allowed to update shipment status");
  }

  if (user.role === "courier") {
    if (shipment.courier_id !== toBigInt(user.id)) {
      throw new ForbiddenError("You can only update assigned shipments");
    }

    const allowedCourierTransitions: Record<shipments_status, shipments_status[]> = {
      pending: [],
      picked_up: [],
      in_transit: [],
      arrived_at_branch: [shipments_status.out_for_delivery],
      out_for_delivery: [shipments_status.delivered],
      delivered: [],
      cancelled: [],
    };

    if (!allowedCourierTransitions[shipment.status].includes(nextStatus)) {
      throw new ForbiddenError("Courier cannot perform this status transition");
    }

    return;
  }

  throw new ForbiddenError("You are not allowed to update shipment status");
}

function buildTrackingDetails(
  shipment: NonNullable<Awaited<ReturnType<typeof findShipmentWithRelations>>>,
  nextStatus: shipments_status,
  input: UpdateShipmentStatusInput,
) {
  const origin = shipment.branches_shipments_origin_branch_idTobranches.name;
  const destination = shipment.branches_shipments_destination_branch_idTobranches.name;
  const destinationCity = shipment.branches_shipments_destination_branch_idTobranches.city;
  const receiverAddress = shipment.customers_shipments_receiver_idTocustomers.address;

  const details: Partial<Record<shipments_status, { location: string; description: string }>> = {
    picked_up: {
      location: shipment.branches_shipments_origin_branch_idTobranches.name,
      description: "Paket telah dijemput kurir dan diserahkan ke kasir. Siap dikirimkan.",
    },
    in_transit: {
      location: origin,
      description: `Paket diberangkatkan menuju ${destination}.`,
    },
    arrived_at_branch: {
      location: destination,
      description: `Paket telah tiba di ${destination}.`,
    },
    out_for_delivery: {
      location: destinationCity,
      description: "Kurir telah mengonfirmasi siap antar. Paket sedang dalam perjalanan menuju penerima.",
    },
    delivered: {
      location: receiverAddress,
      description: "Paket berhasil diterima customer.",
    },
  };

  return details[nextStatus] ?? {
    location: input.location ?? "",
    description: input.description ?? "",
  };
}

export async function createShipment(
  currentUser: AuthUser,
  input: CreateShipmentInput,
) {
  ensureCustomer(currentUser);

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [pendingPaymentCount, createdInLastHour] = await Promise.all([
    countCustomerPendingPaymentShipments(currentUser.id),
    countCustomerCreatedShipmentsSince(currentUser.id, oneHourAgo),
  ]);

  if (pendingPaymentCount >= 5) {
    throw new ValidationError(
      "Anda masih memiliki 5 pesanan yang belum diselesaikan pembayarannya. Silakan selesaikan pembayaran atau batalkan salah satu pesanan terlebih dahulu.",
    );
  }

  if (createdInLastHour >= 20) {
    throw new ValidationError(
      "Anda telah mencapai batas maksimal pembuatan pesanan. Silakan coba kembali beberapa saat lagi.",
    );
  }

  const receiverId = input.receiverId ?? currentUser.id;
  const [receiver, originBranch, destinationBranch] = await Promise.all([
    findCustomerById(receiverId),
    findBranchById(input.originBranchId),
    findBranchById(input.destinationBranchId),
  ]);

  if (!receiver) {
    throw new NotFoundError("Receiver customer not found");
  }

  if (!originBranch || !destinationBranch) {
    throw new NotFoundError("Branch not found");
  }

  const rate = input.rateId
    ? await findRateById(input.rateId)
    : await findRateByCities(originBranch.city, destinationBranch.city);

  if (!rate) {
    throw new NotFoundError("Rate not found");
  }

  const totalWeight = input.items.reduce(
    (sum, item) => sum + item.quantity * item.weight,
    0,
  );
  const handoverMethod = input.handoverMethod as shipments_handover_method;
  const paymentMethod = input.paymentMethod as payments_payment_method;
  assertPaymentAllowed(handoverMethod, paymentMethod);
  const totalPrice = calculateTotalPrice(totalWeight, rate.price_per_kg, handoverMethod);

  const shipment = await createShipmentWithItemsAndPayment({
    trackingNumber: generateTrackingNumber(),
    senderId: currentUser.id,
    receiverId,
    receiver: input.receiver
      ? {
          name: input.receiver.name,
          email: input.receiver.email?.trim() || null,
          phone: input.receiver.phone?.trim() || null,
          address: input.receiver.address,
          city: destinationBranch.city,
        }
      : input.receiverAddress
        ? {
            name: receiver.name,
            email: receiver.email,
            phone: receiver.phone,
            address: input.receiverAddress,
            city: destinationBranch.city,
          }
        : undefined,
    originBranchId: input.originBranchId,
    destinationBranchId: input.destinationBranchId,
    rateId: Number(rate.id),
    handoverMethod,
    totalWeight,
    totalPrice,
    paymentMethod,
    createdSource: shipments_created_source.customer,
    createdByUserId: null,
    paymentExpiredAt: paymentExpiresAt(paymentMethod),
    items: input.items,
  });

  return toJsonSafe(shipment);
}

export async function cancelCustomerShipment(
  currentUser: AuthUser,
  shipmentId: number,
) {
  ensureCustomer(currentUser);

  const shipment = await findShipmentWithRelations(shipmentId);

  if (!shipment) {
    throw new NotFoundError("Shipment not found");
  }

  if (shipment.sender_id !== toBigInt(currentUser.id)) {
    throw new ForbiddenError("Hanya pengirim yang dapat membatalkan pesanan.");
  }

  if (shipment.payments?.payment_status === payments_payment_status.paid) {
    throw new ValidationError("Pesanan yang sudah dibayar tidak dapat dibatalkan.");
  }

  if (shipment.status === shipments_status.cancelled) {
    throw new ValidationError("Pesanan sudah dibatalkan.");
  }

  if (shipment.status !== shipments_status.pending) {
    throw new ValidationError("Pesanan hanya dapat dibatalkan sebelum diproses.");
  }

  return toJsonSafe(await cancelCustomerShipmentRepository(shipmentId));
}

export async function createCashierOrder(
  currentUser: AuthUser,
  input: CreateCashierOrderInput,
) {
  ensureCashier(currentUser);

  const [originBranch, destinationBranch] = await Promise.all([
    findBranchById(input.originBranchId),
    findBranchById(input.destinationBranchId),
  ]);

  if (!originBranch || !destinationBranch) {
    throw new NotFoundError("Branch not found");
  }

  if (originBranch.id !== toBigInt(currentUser.branchId!)) {
    throw new ForbiddenError("Kasir hanya dapat membuat pesanan dari cabang sendiri.");
  }

  const rate = input.rateId
    ? await findRateById(input.rateId)
    : await findRateByCities(originBranch.city, destinationBranch.city);

  if (!rate) {
    throw new NotFoundError("Rate not found");
  }

  const handoverMethod = input.handoverMethod as shipments_handover_method;
  const paymentMethod = input.paymentMethod as payments_payment_method;
  assertPaymentAllowed(handoverMethod, paymentMethod);

  const totalWeight = input.items.reduce(
    (sum, item) => sum + item.quantity * item.weight,
    0,
  );
  const totalPrice = calculateTotalPrice(totalWeight, rate.price_per_kg, handoverMethod);

  const shipment = await createCashierShipmentWithCustomers({
    trackingNumber: generateTrackingNumber(),
    sender: {
      ...input.sender,
      email: input.sender.email?.trim() || null,
    },
    receiver: input.receiver,
    cashierId: currentUser.id,
    originBranchId: input.originBranchId,
    destinationBranchId: input.destinationBranchId,
    rateId: Number(rate.id),
    handoverMethod,
    totalWeight,
    totalPrice,
    paymentMethod,
    paymentExpiredAt: paymentExpiresAt(paymentMethod),
    items: input.items,
  });

  return toJsonSafe(shipment);
}

export async function getCustomerShipments(
  currentUser: AuthUser,
  query: ShipmentListQuery,
) {
  ensureCustomer(currentUser);

  const { page, limit, skip, take } = paginate(query);
  const where: Prisma.shipmentsWhereInput = {
    ...buildBaseWhere(query),
    OR: [{ sender_id: toBigInt(currentUser.id) }, { receiver_id: toBigInt(currentUser.id) }],
  };
  const [total, shipments] = await findCustomerShipments(where, skip, take);

  return {
    data: toJsonSafe(shipments),
    meta: paginationMeta(total, page, limit),
  };
}

export async function getCustomerShipmentDetail(
  currentUser: AuthUser,
  shipmentId: number,
) {
  ensureCustomer(currentUser);

  const shipment = await findShipmentWithRelations(shipmentId);

  if (!shipment) {
    throw new NotFoundError("Shipment not found");
  }

  ensureShipmentOwner(currentUser, shipment);

  return toJsonSafe(shipment);
}

export async function getAdminShipments(
  currentUser: AuthUser,
  query: ShipmentListQuery,
) {
  ensureAdminOrManager(currentUser);

  const { page, limit, skip, take } = paginate(query);
  const where = mergeShipmentWhere(
    buildBaseWhere(query),
    applyShipmentScope(currentUser),
  );
  const [total, shipments] = await findAllShipments(
    where,
    skip,
    take,
  );

  return {
    data: toJsonSafe(shipments),
    meta: paginationMeta(total, page, limit),
  };
}

export async function getShipmentDetailForStaff(
  currentUser: AuthUser,
  shipmentId: number,
) {
  if (!["admin", "manager", "courier"].includes(currentUser.role)) {
    throw new ForbiddenError("Staff access required");
  }

  const shipment = await findShipmentWithRelations(shipmentId);

  if (!shipment) {
    throw new NotFoundError("Shipment not found");
  }

  if (
    currentUser.role === "courier" &&
    shipment.courier_id !== toBigInt(currentUser.id)
  ) {
    throw new ForbiddenError("You can only access assigned shipments");
  }

  if (
    currentUser.role === "admin" &&
    currentUser.branchId &&
    !isShipmentVisibleToBranch(currentUser.branchId, shipment)
  ) {
    throw new ForbiddenError("You can only access shipments from your branch");
  }

  return toJsonSafe(shipment);
}

export async function assignCourierToShipment(
  currentUser: AuthUser,
  shipmentId: number,
  courierCode: string,
) {
  if (!["admin", "cashier"].includes(currentUser.role)) {
    throw new ForbiddenError("Admin or Cashier access required");
  }

  const normalizedCourierCode = courierCode.trim().toUpperCase();
  const [shipment, courier] = await Promise.all([
    findShipmentWithRelations(shipmentId),
    findCourierByCode(normalizedCourierCode),
  ]);

  if (!shipment) {
    throw new NotFoundError("Shipment not found");
  }

  if (!courier) {
    throw new NotFoundError("ID Kurir aktif tidak ditemukan.");
  }

  if (!currentUser.branchId) {
    throw new ForbiddenError("Branch is required");
  }

  if (shipment.courier_id) {
    throw new ValidationError("Shipment sudah memiliki kurir aktif.");
  }

  if (courier.branch_id !== toBigInt(currentUser.branchId)) {
    throw new ForbiddenError("ID Kurir harus berasal dari cabang Anda.");
  }

  const isPickupMode = shipment.handover_method === shipments_handover_method.pickup && shipment.status === shipments_status.pending;
  const isDeliveryMode = shipment.status === shipments_status.arrived_at_branch;

  if (isPickupMode) {
    if (shipment.origin_branch_id !== toBigInt(currentUser.branchId)) {
      throw new ForbiddenError("Only the origin branch can assign a pickup courier");
    }

    if (shipment.payments?.payment_status !== payments_payment_status.paid) {
      throw new ValidationError("Shipment metode Jemput Paket hanya dapat diassign setelah pembayaran berstatus paid.");
    }
  } else if (isDeliveryMode) {
    if (shipment.destination_branch_id !== toBigInt(currentUser.branchId)) {
      throw new ForbiddenError("Only the destination branch can assign a delivery courier");
    }
  } else {
    throw new ValidationError(
      "Kurir hanya dapat ditugaskan untuk penjemputan (status pending) atau pengiriman (status arrived_at_branch).",
    );
  }

  const updatedShipment = await assignCourier(shipmentId, Number(courier.id));

  return toJsonSafe(updatedShipment);
}

export async function updateShipmentStatus(
  currentUser: AuthUser,
  shipmentId: number,
  input: UpdateShipmentStatusInput,
) {
  const shipment = await findShipmentWithRelations(shipmentId);

  if (!shipment) {
    throw new NotFoundError("Shipment not found");
  }

  const nextStatus = input.status as shipments_status;

  assertRoleCanUpdateStatus(currentUser, shipment, nextStatus);
  assertTransitionAllowed(shipment.status, nextStatus);
  const tracking = buildTrackingDetails(shipment, nextStatus, input);

  const updatedShipment = await updateShipmentStatusRepository(
    shipmentId,
    nextStatus,
    {
      status: nextStatus as unknown as shipment_trackings_status,
      location: tracking.location,
      description: tracking.description,
    },
    input.photo,
  );

  return toJsonSafe(updatedShipment);
}

export async function receiveShipmentAtDestination(
  currentUser: AuthUser,
  trackingNumber: string,
  shipmentId?: number,
) {
  ensureAdmin(currentUser);

  const normalizedTrackingNumber = trackingNumber.trim().toUpperCase();
  const shipment = shipmentId
    ? await findShipmentWithRelations(shipmentId)
    : await findShipmentByTrackingNumber(normalizedTrackingNumber);

  if (
    !shipment ||
    shipment.destination_branch_id !== toBigInt(currentUser.branchId!)
  ) {
    throw new NotFoundError("Nomor resi tidak ditemukan untuk cabang tujuan Anda.");
  }

  if (shipment.tracking_number !== normalizedTrackingNumber) {
    throw new ValidationError("Nomor resi tidak sesuai dengan shipment pada baris ini.");
  }

  if (shipment.status !== shipments_status.in_transit) {
    throw new ValidationError("Paket belum dalam perjalanan atau sudah diterima cabang tujuan.");
  }

  const destinationBranch = shipment.branches_shipments_destination_branch_idTobranches;
  const updatedShipment = await updateShipmentStatusRepository(
    Number(shipment.id),
    shipments_status.arrived_at_branch,
    {
      status: shipment_trackings_status.arrived_at_branch,
      location: destinationBranch.name,
      description: `Paket telah tiba di ${destinationBranch.name}.`,
    },
  );

  return toJsonSafe(updatedShipment);
}

export async function getCourierShipments(
  currentUser: AuthUser,
  query: ShipmentListQuery,
) {
  ensureCourier(currentUser);

  const { page, limit, skip, take } = paginate(query);
  const [total, shipments] = await findCourierShipments(
    currentUser.id,
    currentUser.branchId,
    buildBaseWhere(query),
    skip,
    take,
  );

  return {
    data: toJsonSafe(shipments),
    meta: paginationMeta(total, page, limit),
  };
}

export async function getPublicTracking(trackingNumber: string) {
  const shipment = await findShipmentByTrackingNumber(trackingNumber);

  if (!shipment) {
    throw new NotFoundError("Tracking number not found");
  }

  return toJsonSafe({
    trackingNumber: shipment.tracking_number,
    status: shipment.status,
    originBranch: {
      name: shipment.branches_shipments_origin_branch_idTobranches.name,
      city: shipment.branches_shipments_origin_branch_idTobranches.city,
    },
    destinationBranch: {
      name: shipment.branches_shipments_destination_branch_idTobranches.name,
      city: shipment.branches_shipments_destination_branch_idTobranches.city,
    },
    shipmentDate: shipment.shipment_date,
    sender: {
      name: shipment.customers_shipments_sender_idTocustomers.name,
      city: shipment.customers_shipments_sender_idTocustomers.city,
    },
    receiver: {
      name: shipment.customers_shipments_receiver_idTocustomers.name,
      city: shipment.customers_shipments_receiver_idTocustomers.city,
    },
    trackings: shipment.shipment_trackings.map((tracking) => ({
      status: tracking.status,
      location: tracking.location,
      description: tracking.description,
      trackedAt: tracking.tracked_at,
    })),
  });
}
