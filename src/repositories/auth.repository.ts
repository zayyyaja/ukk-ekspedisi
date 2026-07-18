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
    select: {
      id: true,
      name: true,
      email: true,
      password: true, // required for loginCustomer
      email_verified_at: true,
      address: true,
      city: true,
      phone: true,
      photo: true,
    }
  });
}

export function findCustomerById(id: bigint) {
  return prisma.customers.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      email_verified_at: true,
      address: true,
      city: true,
      phone: true,
      photo: true,
    }
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
    select: {
      id: true,
      name: true,
      email: true,
      password: true, // required for loginStaff
      role: true,
      branch_id: true,
      is_active: true,
      email_verified_at: true,
    }
  });
}

export function findStaffById(id: bigint) {
  return prisma.users.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      branch_id: true,
      is_active: true,
      email_verified_at: true,
    }
  });
}