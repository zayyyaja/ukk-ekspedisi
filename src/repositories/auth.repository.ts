import { prisma } from "@/lib/prisma";

type CreateCustomerData = {
  name: string;
  email: string;
  password: string;
  address: string;
  city: string;
  phone: string;
};

export function findCustomerByEmail(email: string) {
  return prisma.customers.findUnique({
    where: { email },
  });
}

export function findCustomerById(id: bigint) {
  return prisma.customers.findUnique({
    where: { id },
  });
}

export function createCustomer(data: CreateCustomerData) {
  return prisma.customers.create({
    data: {
      ...data,
      email_verified_at: null,
      is_verified: false,
      remember_token: null,
    },
  });
}

export function updateCustomerVerification(id: bigint) {
  return prisma.customers.update({
    where: { id },
    data: {
      email_verified_at: new Date(),
      is_verified: true,
    },
  });
}

export function updateCustomerRememberToken(id: bigint, rememberToken: string) {
  return prisma.customers.update({
    where: { id },
    data: {
      remember_token: rememberToken,
    },
  });
}

export function clearCustomerRememberToken(id: bigint) {
  return prisma.customers.update({
    where: { id },
    data: {
      remember_token: null,
    },
  });
}

export function findStaffByEmail(email: string) {
  return prisma.users.findUnique({
    where: { email },
  });
}

export function findStaffById(id: bigint) {
  return prisma.users.findUnique({
    where: { id },
  });
}

export function updateStaffRememberToken(id: bigint, rememberToken: string) {
  return prisma.users.update({
    where: { id },
    data: {
      remember_token: rememberToken,
    },
  });
}

export function clearStaffRememberToken(id: bigint) {
  return prisma.users.update({
    where: { id },
    data: {
      remember_token: null,
    },
  });
}
