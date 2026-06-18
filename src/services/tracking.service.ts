import type { Prisma } from "@prisma/client";
import { shipment_trackings_status } from "@prisma/client";

import { NotFoundError } from "@/lib/errors";
import { toJsonSafe } from "@/lib/serialize";
import {
  findTrackingById,
  findTrackings,
} from "@/repositories/tracking.repository";
import type { TrackingFilterInput } from "@/validations/tracking.validation";

function paginate(query: TrackingFilterInput) {
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

function buildTrackingWhere(
  query: TrackingFilterInput,
): Prisma.shipment_trackingsWhereInput {
  return {
    shipment_id: query.shipmentId ? BigInt(query.shipmentId) : undefined,
    status: query.status ? (query.status as shipment_trackings_status) : undefined,
  };
}

export async function getTrackings(query: TrackingFilterInput) {
  const { page, limit, skip, take } = paginate(query);
  const [total, trackings] = await findTrackings(
    buildTrackingWhere(query),
    skip,
    take,
  );

  return {
    data: toJsonSafe(trackings),
    meta: paginationMeta(total, page, limit),
  };
}

export async function getTrackingDetail(id: number) {
  const tracking = await findTrackingById(id);

  if (!tracking) {
    throw new NotFoundError("Tracking not found");
  }

  return toJsonSafe(tracking);
}
