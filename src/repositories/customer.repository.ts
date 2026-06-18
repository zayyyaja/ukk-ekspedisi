import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { UpdateCustomerInput } from "@/validations/customer.validation";

const publicCustomerSelect = {
  id: true,
  name: true,
  email: true,
  email_verified_at: true,
  address: true,
  city: true,
  phone: true,
  photo: true,
  is_verified: true,
  created_at: true,
  updated_at: true,
} satisfies Prisma.customersSelect;

export function findCustomers(where: Prisma.customersWhereInput, skip: number, take: number) {
  return prisma.$transaction([
    prisma.customers.count({ where }),
    prisma.customers.findMany({ where, skip, take, orderBy: { created_at: "desc" }, select: publicCustomerSelect }),
  ]);
}

export function findCustomerById(id: number) {
  return prisma.customers.findUnique({
    where: { id: BigInt(id) },
    select: publicCustomerSelect,
  });
}

export function updateCustomer(id: number, input: UpdateCustomerInput) {
  return prisma.customers.update({
    where: { id: BigInt(id) },
    data: input,
    select: publicCustomerSelect,
  });
}

export function setCustomerVerified(id: number, isVerified: boolean) {
  return prisma.customers.update({
    where: { id: BigInt(id) },
    data: {
      is_verified: isVerified,
      email_verified_at: isVerified ? new Date() : null,
    },
    select: publicCustomerSelect,
  });
}
