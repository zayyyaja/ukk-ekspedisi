import type { Prisma } from "@prisma/client";
import {
  payments_payment_method,
  shipment_trackings_status,
  shipments_handover_method,
  shipments_status,
} from "@prisma/client";

import { PAYMENT_METHODS } from "@/constants/payment";
import {
  SHIPMENT_STATUS_TRANSITIONS,
  type ShipmentStatus,
} from "@/constants/shipment-status";
import {
  assignCourier,
  createShipmentWithItemsAndPayment,
  findAllShipments,
  findBranchById,
  findCourierById,
  findCourierShipments,
  findCustomerById,
  findCustomerShipments,
  findRateById,
  findShipmentById,
  findShipmentByTrackingNumber,
  findShipmentWithRelations,
  updateShipmentStatus as updateShipmentStatusRepository,
} from "@/repositories/shipment.repository";
import type { AuthUser } from "@/types/auth";
import type {
  CreateShipmentInput,
  ShipmentListQuery,
  UpdateShipmentStatusInput,
} from "@/validations/shipment.validation";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";

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
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `EXP-${yyyy}${mm}${dd}-${random}`;
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
}

function ensureAdminOrManager(user: AuthUser) {
  if (user.role !== "admin" && user.role !== "manager") {
    throw new ForbiddenError("Admin or manager access required");
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
  sameCity: boolean,
) {
  const baseAllowed =
    SHIPMENT_STATUS_TRANSITIONS[currentStatus as ShipmentStatus] ?? [];

  if (!baseAllowed.includes(nextStatus as ShipmentStatus)) {
    throw new ValidationError("Invalid shipment status transition");
  }

  if (
    currentStatus === shipments_status.picked_up &&
    nextStatus === shipments_status.out_for_delivery &&
    !sameCity
  ) {
    throw new ValidationError(
      "Different city shipment must move to in_transit first",
    );
  }
}

function assertRoleCanUpdateStatus(
  user: AuthUser,
  shipment: {
    courier_id: bigint | null;
    status: shipments_status;
  },
  nextStatus: shipments_status,
) {
  if (user.role === "admin") {
    return;
  }

  if (user.role !== "courier") {
    throw new ForbiddenError("You are not allowed to update shipment status");
  }

  if (shipment.courier_id !== toBigInt(user.id)) {
    throw new ForbiddenError("You can only update assigned shipments");
  }

  const allowedCourierTransitions: Record<shipments_status, shipments_status[]> = {
    pending: [shipments_status.picked_up],
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
}

export async function createShipment(
  currentUser: AuthUser,
  input: CreateShipmentInput,
) {
  ensureCustomer(currentUser);

  const [receiver, originBranch, destinationBranch, rate] = await Promise.all([
    findCustomerById(input.receiverId),
    findBranchById(input.originBranchId),
    findBranchById(input.destinationBranchId),
    findRateById(input.rateId),
  ]);

  if (!receiver) {
    throw new NotFoundError("Receiver customer not found");
  }

  if (!originBranch || !destinationBranch) {
    throw new NotFoundError("Branch not found");
  }

  if (!rate) {
    throw new NotFoundError("Rate not found");
  }

  if (
    input.handoverMethod === "pickup" &&
    input.paymentMethod === PAYMENT_METHODS.cash
  ) {
    throw new ValidationError("Pickup shipments require online payment");
  }

  const totalWeight = input.items.reduce(
    (sum, item) => sum + item.quantity * item.weight,
    0,
  );
  const totalPrice = totalWeight * Number(rate.price_per_kg);
  const shipment = await createShipmentWithItemsAndPayment({
    trackingNumber: generateTrackingNumber(),
    senderId: currentUser.id,
    receiverId: input.receiverId,
    originBranchId: input.originBranchId,
    destinationBranchId: input.destinationBranchId,
    rateId: input.rateId,
    handoverMethod: input.handoverMethod as shipments_handover_method,
    totalWeight,
    totalPrice,
    paymentMethod: input.paymentMethod as payments_payment_method,
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
  const [total, shipments] = await findAllShipments(
    buildBaseWhere(query),
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

  return toJsonSafe(shipment);
}

export async function assignCourierToShipment(
  currentUser: AuthUser,
  shipmentId: number,
  courierId: number,
) {
  ensureAdmin(currentUser);

  const [shipment, courier] = await Promise.all([
    findShipmentById(shipmentId),
    findCourierById(courierId),
  ]);

  if (!shipment) {
    throw new NotFoundError("Shipment not found");
  }

  if (!courier) {
    throw new NotFoundError("Active courier not found");
  }

  if (
    shipment.status === shipments_status.delivered ||
    shipment.status === shipments_status.cancelled
  ) {
    throw new ValidationError("Cannot assign courier to completed shipment");
  }

  const updatedShipment = await assignCourier(shipmentId, courierId);

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
  assertTransitionAllowed(shipment.status, nextStatus, isSameCity(shipment));

  const updatedShipment = await updateShipmentStatusRepository(
    shipmentId,
    nextStatus,
    {
      status: nextStatus as unknown as shipment_trackings_status,
      location: input.location,
      description: input.description,
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
