import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Drop existing CHECK constraint that prevents owner (no branch_id)
  try {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE users DROP CHECK chk_users_branch_required_for_branch_roles",
    );
    console.log("✅ Dropped old branch constraint.");
  } catch {
    console.log("ℹ️  Constraint tidak ada atau sudah dihapus, lanjut...");
  }

  // Re-add constraint that allows owner and manager without branch_id
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE users
      ADD CONSTRAINT chk_users_branch_required_for_branch_roles
      CHECK (
        role IN ('admin', 'manager', 'owner')
        OR (role IN ('cashier', 'courier') AND branch_id IS NOT NULL)
      )
    `);
    console.log("✅ Added updated branch constraint (owner & manager allowed without branch).");
  } catch (e) {
    console.log("ℹ️  Gagal re-add constraint:", (e as Error).message);
  }

  const email = "owner@ekspedisi.com";
  const password = await hash("owner123", 10);

  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) {
    console.log(`ℹ️  Owner account already exists: ${email}`);
    return;
  }

  const owner = await prisma.users.create({
    data: {
      name: "Owner Ekspedisi",
      email,
      password,
      role: "owner",
      branch_id: null,
      is_active: true,
      email_verified_at: new Date(),
    },
  });

  console.log(`\n✅ Owner account created!`);
  console.log(`   Email   : ${owner.email}`);
  console.log(`   Password: owner123`);
  console.log(`   Role    : ${owner.role}`);
  console.log(`   ID      : ${owner.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
