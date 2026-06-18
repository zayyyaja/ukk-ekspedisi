import type { Prisma } from "@prisma/client";
import { users_role, vehicles_type } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { CreateVehicleInput, UpdateVehicleInput } from "@/validations/vehicle.validation";

export function createVehicle(input: CreateVehicleInput) {
  return prisma.vehicles.create({
    data: {
      plate_number: input.plateNumber,
      type: input.type as vehicles_type,
      courier_id: BigInt(input.courierId ?? 0),
    },
    include: { users: true },
  });
}

export function updateVehicle(id: number, input: UpdateVehicleInput) {
  return prisma.vehicles.update({
    where: { id: BigInt(id) },
    data: {
      plate_number: input.plateNumber,
      type: input.type as vehicles_type | undefined,
      courier_id: input.courierId ? BigInt(input.courierId) : undefined,
    },
    include: { users: true },
  });
}

export function deleteVehicle(id: number) {
  return prisma.vehicles.delete({ where: { id: BigInt(id) } });
}

export function findVehicleById(id: number) {
  return prisma.vehicles.findUnique({
    where: { id: BigInt(id) },
    include: { users: true },
  });
}

export function findVehicles(where: Prisma.vehiclesWhereInput, skip: number, take: number) {
  return prisma.$transaction([
    prisma.vehicles.count({ where }),
    prisma.vehicles.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: "desc" },
      include: { users: true },
    }),
  ]);
}

export function assignCourierVehicle(id: number, courierId: number) {
  return prisma.vehicles.update({
    where: { id: BigInt(id) },
    data: { courier_id: BigInt(courierId) },
    include: { users: true },
  });
}

export function findActiveCourier(id: number) {
  return prisma.users.findFirst({
    where: { id: BigInt(id), role: users_role.courier, is_active: true },
  });
}
