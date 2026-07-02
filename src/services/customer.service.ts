import type { Prisma } from "@prisma/client";

import { NotFoundError } from "@/lib/errors";
import { toJsonSafe } from "@/lib/serialize";
import {
  findCustomerById,
  findCustomers,
  setCustomerVerified,
  updateCustomer,
} from "@/repositories/customer.repository";
import type {
  CustomerFilterInput,
  UpdateCustomerInput,
} from "@/validations/customer.validation";

function paginate(query: CustomerFilterInput) {
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

function buildCustomerWhere(query: CustomerFilterInput): Prisma.customersWhereInput {
  return {
    city: query.city ? { contains: query.city } : undefined,
    email_verified_at:
      query.isVerified === undefined
        ? undefined
        : query.isVerified
          ? { not: null }
          : null,
  };
}

export async function getCustomers(query: CustomerFilterInput) {
  const { page, limit, skip, take } = paginate(query);
  const [total, customers] = await findCustomers(
    buildCustomerWhere(query),
    skip,
    take,
  );

  return {
    data: toJsonSafe(customers),
    meta: paginationMeta(total, page, limit),
  };
}

export async function getCustomerDetail(id: number) {
  const customer = await findCustomerById(id);

  if (!customer) {
    throw new NotFoundError("Customer not found");
  }

  return toJsonSafe(customer);
}

export async function updateCustomerData(id: number, input: UpdateCustomerInput) {
  await getCustomerDetail(id);

  return toJsonSafe(await updateCustomer(id, input));
}

export async function activateCustomer(id: number) {
  await getCustomerDetail(id);

  return toJsonSafe(await setCustomerVerified(id, true));
}

export async function suspendCustomer(id: number) {
  await getCustomerDetail(id);

  return toJsonSafe(await setCustomerVerified(id, false));
}
