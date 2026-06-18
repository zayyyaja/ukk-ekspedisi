import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { CreateBranchInput, UpdateBranchInput } from "@/validations/branch.validation";

export function createBranch(input: CreateBranchInput) {
  return prisma.branches.create({ data: input });
}

export function updateBranch(id: number, input: UpdateBranchInput) {
  return prisma.branches.update({
    where: { id: BigInt(id) },
    data: input,
  });
}

export function deleteBranch(id: number) {
  return prisma.branches.delete({ where: { id: BigInt(id) } });
}

export function findBranchById(id: number) {
  return prisma.branches.findUnique({ where: { id: BigInt(id) } });
}

export function findBranches(where: Prisma.branchesWhereInput, skip: number, take: number) {
  return prisma.$transaction([
    prisma.branches.count({ where }),
    prisma.branches.findMany({ where, skip, take, orderBy: { created_at: "desc" } }),
  ]);
}
