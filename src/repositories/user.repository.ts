import type { Prisma } from "@prisma/client";
import { users_role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type CreateUserData = {
  name: string;
  email: string;
  password: string;
  role: users_role;
  branchId?: number | null;
  courierCode?: string | null;
};

type UpdateUserData = Partial<CreateUserData>;

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  courier_code: true,
  email_verified_at: true,
  role: true,
  branch_id: true,
  is_active: true,
  created_at: true,
  updated_at: true,
} satisfies Prisma.usersSelect;

export function createUser(data: CreateUserData) {
  return prisma.users.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      courier_code: data.courierCode ?? null,
      branch_id: data.branchId ? BigInt(data.branchId) : null,
      email_verified_at: new Date(),
      is_active: true,
    },
    select: publicUserSelect,
  });
}

export function updateUser(id: number, data: UpdateUserData) {
  return prisma.users.update({
    where: { id: BigInt(id) },
    data: {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      courier_code: data.courierCode,
      branch_id: data.branchId === undefined ? undefined : data.branchId ? BigInt(data.branchId) : null,
    },
    select: publicUserSelect,
  });
}

export function deleteUser(id: number) {
  return prisma.users.delete({ where: { id: BigInt(id) }, select: publicUserSelect });
}

export function findUserById(id: number) {
  return prisma.users.findUnique({ where: { id: BigInt(id) }, select: publicUserSelect });
}

export function findUsers(where: Prisma.usersWhereInput, skip: number, take: number) {
  return prisma.$transaction([
    prisma.users.count({ where }),
    prisma.users.findMany({ where, skip, take, orderBy: { created_at: "desc" }, select: publicUserSelect }),
  ]);
}

export function toggleUserStatus(id: number, isActive: boolean) {
  return prisma.users.update({
    where: { id: BigInt(id) },
    data: { is_active: isActive },
    select: publicUserSelect,
  });
}
