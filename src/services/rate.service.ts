import type { Prisma } from "@prisma/client";

import { NotFoundError } from "@/lib/errors";
import { toJsonSafe } from "@/lib/serialize";
import {
  createRate,
  deleteRate,
  findRateById,
  findRates,
  updateRate,
} from "@/repositories/rate.repository";
import type {
  CreateRateInput,
  RateFilterInput,
  UpdateRateInput,
} from "@/validations/rate.validation";

function paginate(query: RateFilterInput) {
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

function buildRateWhere(query: RateFilterInput): Prisma.ratesWhereInput {
  return {
    origin_city: query.originCity ? { contains: query.originCity } : undefined,
    destination_city: query.destinationCity
      ? { contains: query.destinationCity }
      : undefined,
  };
}

export async function getRates(query: RateFilterInput) {
  const { page, limit, skip, take } = paginate(query);
  const [total, rates] = await findRates(buildRateWhere(query), skip, take);

  return {
    data: toJsonSafe(rates),
    meta: paginationMeta(total, page, limit),
  };
}

export async function getRateDetail(id: number) {
  const rate = await findRateById(id);

  if (!rate) {
    throw new NotFoundError("Rate not found");
  }

  return toJsonSafe(rate);
}

export async function createRateData(input: CreateRateInput) {
  return toJsonSafe(await createRate(input));
}

export async function updateRateData(id: number, input: UpdateRateInput) {
  await getRateDetail(id);

  return toJsonSafe(await updateRate(id, input));
}

export async function deleteRateData(id: number) {
  await getRateDetail(id);

  return toJsonSafe(await deleteRate(id));
}
