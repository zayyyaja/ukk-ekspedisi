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

export function createVerifiedCustomer(data: CreateCustomerData) {
  return prisma.customers.create({
    data: {
      ...data,
      email_verified_at: new Date(),
      photo: null,
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