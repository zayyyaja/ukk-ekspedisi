import type { Prisma } from "@prisma/client";

import { NotFoundError } from "@/lib/errors";
import { toJsonSafe } from "@/lib/serialize";
import {
  createBranch,
  deleteBranch,
  findBranchById,
  findBranches,
  updateBranch,
} from "@/repositories/branch.repository";
import type {
  BranchFilterInput,
  CreateBranchInput,
  UpdateBranchInput,
} from "@/validations/branch.validation";

function paginate(query: BranchFilterInput) {
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

function buildBranchWhere(query: BranchFilterInput): Prisma.branchesWhereInput {
  return {
    city: query.city ? { contains: query.city } : undefined,
  };
}

export async function getBranches(query: BranchFilterInput) {
  const { page, limit, skip, take } = paginate(query);
  const [total, branches] = await findBranches(buildBranchWhere(query), skip, take);

  return {
    data: toJsonSafe(branches),
    meta: paginationMeta(total, page, limit),
  };
}

export async function getBranchDetail(id: number) {
  const branch = await findBranchById(id);

  if (!branch) {
    throw new NotFoundError("Branch not found");
  }

  return toJsonSafe(branch);
}

export async function createBranchData(input: CreateBranchInput) {
  return toJsonSafe(await createBranch(input));
}

export async function updateBranchData(id: number, input: UpdateBranchInput) {
  await getBranchDetail(id);

  return toJsonSafe(await updateBranch(id, input));
}

export async function deleteBranchData(id: number) {
  await getBranchDetail(id);

  return toJsonSafe(await deleteBranch(id));
}
