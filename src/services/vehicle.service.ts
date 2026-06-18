import type { Prisma } from "@prisma/client";
import { vehicles_type } from "@prisma/client";

import { NotFoundError, ValidationError } from "@/lib/errors";
import { toJsonSafe } from "@/lib/serialize";
import {
  assignCourierVehicle,
  createVehicle,
  deleteVehicle,
  findActiveCourier,
  findVehicleById,
  findVehicles,
  updateVehicle,
} from "@/repositories/vehicle.repository";
import type {
  AssignCourierVehicleInput,
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleFilterInput,
} from "@/validations/vehicle.validation";

function paginate(query: VehicleFilterInput) {
  return {
    page: query.page,
    limit: query.limit,
    skip: (query.page - 1) * query.limit,
    take: query.limit,
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

function buildVehicleWhere(query: VehicleFilterInput): Prisma.vehiclesWhereInput {
  return {
    type: query.type ? (query.type as vehicles_type) : undefined,
    courier_id: query.courierId ? BigInt(query.courierId) : undefined,
  };
}

async function ensureActiveCourier(courierId: number) {
  const courier = await findActiveCourier(courierId);

  if (!courier) {
    throw new ValidationError("Courier must exist and be active");
  }
}

export async function getVehicles(query: VehicleFilterInput) {
  const { page, limit, skip, take } = paginate(query);
  const [total, vehicles] = await findVehicles(buildVehicleWhere(query), skip, take);

  return {
    data: toJsonSafe(vehicles),
    meta: paginationMeta(total, page, limit),
  };
}

export async function getVehicleDetail(id: number) {
  const vehicle = await findVehicleById(id);

  if (!vehicle) {
    throw new NotFoundError("Vehicle not found");
  }

  return toJsonSafe(vehicle);
}

export async function createVehicleData(input: CreateVehicleInput) {
  if (!input.courierId) {
    throw new ValidationError("courierId is required");
  }

  await ensureActiveCourier(input.courierId);

  return toJsonSafe(await createVehicle(input));
}

export async function updateVehicleData(id: number, input: UpdateVehicleInput) {
  await getVehicleDetail(id);

  if (input.courierId) {
    await ensureActiveCourier(input.courierId);
  }

  return toJsonSafe(await updateVehicle(id, input));
}

export async function deleteVehicleData(id: number) {
  await getVehicleDetail(id);

  return toJsonSafe(await deleteVehicle(id));
}

export async function assignCourierToVehicle(
  id: number,
  input: AssignCourierVehicleInput,
) {
  await getVehicleDetail(id);
  await ensureActiveCourier(input.courierId);

  return toJsonSafe(await assignCourierVehicle(id, input.courierId));
}
