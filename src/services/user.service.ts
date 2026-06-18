import type { Prisma } from "@prisma/client";
import { users_role } from "@prisma/client";

import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { toJsonSafe } from "@/lib/serialize";
import {
  createUser,
  deleteUser,
  findUserById,
  findUsers,
  toggleUserStatus,
  updateUser,
} from "@/repositories/user.repository";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserFilterInput,
} from "@/validations/user.validation";

function paginate(query: UserFilterInput) {
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

function buildUserWhere(query: UserFilterInput): Prisma.usersWhereInput {
  return {
    role: query.role ? (query.role as users_role) : undefined,
    branch_id: query.branchId ? BigInt(query.branchId) : undefined,
    is_active: query.isActive,
  };
}

async function ensureBranchExists(branchId?: number | null) {
  if (!branchId) {
    return;
  }

  const branch = await prisma.branches.findUnique({
    where: { id: BigInt(branchId) },
  });

  if (!branch) {
    throw new ValidationError("Branch not found");
  }
}

async function ensureEmailAvailable(email: string, exceptId?: number) {
  const user = await prisma.users.findUnique({ where: { email } });

  if (user && Number(user.id) !== exceptId) {
    throw new ConflictError("Email already used");
  }
}

function ensureRoleBranchRule(role?: string, branchId?: number | null) {
  if ((role === "cashier" || role === "courier") && !branchId) {
    throw new ValidationError("Cashier and courier must have branchId");
  }
}

export async function getUsers(query: UserFilterInput) {
  const { page, limit, skip, take } = paginate(query);
  const [total, users] = await findUsers(buildUserWhere(query), skip, take);

  return {
    data: toJsonSafe(users),
    meta: paginationMeta(total, page, limit),
  };
}

export async function getUserDetail(id: number) {
  const user = await findUserById(id);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return toJsonSafe(user);
}

export async function createUserData(input: CreateUserInput) {
  ensureRoleBranchRule(input.role, input.branchId);
  await ensureBranchExists(input.branchId);
  await ensureEmailAvailable(input.email);

  const password = await hashPassword(input.password ?? "Password123");

  return toJsonSafe(
    await createUser({
      name: input.name,
      email: input.email,
      password,
      role: input.role as users_role,
      branchId: input.branchId,
    }),
  );
}

export async function updateUserData(id: number, input: UpdateUserInput) {
  const existing = await findUserById(id);

  if (!existing) {
    throw new NotFoundError("User not found");
  }

  const nextRole = input.role ?? existing.role;
  const nextBranchId =
    input.branchId === undefined
      ? existing.branch_id
        ? Number(existing.branch_id)
        : null
      : input.branchId;

  ensureRoleBranchRule(nextRole, nextBranchId);
  await ensureBranchExists(nextBranchId);

  if (input.email) {
    await ensureEmailAvailable(input.email, id);
  }

  return toJsonSafe(
    await updateUser(id, {
      name: input.name,
      email: input.email,
      password: input.password ? await hashPassword(input.password) : undefined,
      role: input.role as users_role | undefined,
      branchId: input.branchId,
    }),
  );
}

export async function deleteUserData(id: number) {
  await getUserDetail(id);

  return toJsonSafe(await deleteUser(id));
}

export async function activateUser(id: number) {
  await getUserDetail(id);

  return toJsonSafe(await toggleUserStatus(id, true));
}

export async function deactivateUser(id: number) {
  await getUserDetail(id);

  return toJsonSafe(await toggleUserStatus(id, false));
}
