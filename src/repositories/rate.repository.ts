import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { CreateRateInput, UpdateRateInput } from "@/validations/rate.validation";

export function createRate(input: CreateRateInput) {
  return prisma.rates.create({
    data: {
      origin_city: input.originCity,
      destination_city: input.destinationCity,
      price_per_kg: input.pricePerKg,
      estimated_days: input.estimatedDays,
    },
  });
}

export function updateRate(id: number, input: UpdateRateInput) {
  return prisma.rates.update({
    where: { id: BigInt(id) },
    data: {
      origin_city: input.originCity,
      destination_city: input.destinationCity,
      price_per_kg: input.pricePerKg,
      estimated_days: input.estimatedDays,
    },
  });
}

export function deleteRate(id: number) {
  return prisma.rates.delete({ where: { id: BigInt(id) } });
}

export function findRateById(id: number) {
  return prisma.rates.findUnique({ where: { id: BigInt(id) } });
}

export function findRates(where: Prisma.ratesWhereInput, skip: number, take: number) {
  return prisma.$transaction([
    prisma.rates.count({ where }),
    prisma.rates.findMany({ where, skip, take, orderBy: { created_at: "desc" } }),
  ]);
}
