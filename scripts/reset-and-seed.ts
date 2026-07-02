import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting reset and seed script...");

  // 1. Reset Shipment Data
  console.log("Deleting payments...");
  await prisma.payments.deleteMany({});
  
  console.log("Deleting shipment trackings...");
  await prisma.shipment_trackings.deleteMany({});
  
  console.log("Deleting shipment items...");
  await prisma.shipment_items.deleteMany({});
  
  console.log("Deleting shipments...");
  await prisma.shipments.deleteMany({});
  
  console.log("Shipment data reset complete.");

  // 2. Seed Staff per Branch
  const branches = await prisma.branches.findMany();
  console.log(`Found ${branches.length} branches. Checking staff...`);

  const defaultPassword = await hash("password123", 10);

  for (const branch of branches) {
    const branchIdStr = branch.id.toString();
    const adminCount = await prisma.users.count({
      where: { branch_id: branch.id, role: "admin" },
    });
    const cashierCount = await prisma.users.count({
      where: { branch_id: branch.id, role: "cashier" },
    });
    const courierCount = await prisma.users.count({
      where: { branch_id: branch.id, role: "courier" },
    });

    // Admin
    if (adminCount === 0) {
      await prisma.users.create({
        data: {
          name: `Admin ${branch.name}`,
          email: `admin_${branchIdStr}@email.com`,
          password: defaultPassword,
          role: "admin",
          branch_id: branch.id,
          is_active: true,
          email_verified_at: new Date(),
        },
      });
      console.log(`Created admin for branch ${branchIdStr}`);
    }

    // Cashier
    if (cashierCount === 0) {
      await prisma.users.create({
        data: {
          name: `Cashier ${branch.name}`,
          email: `cashier_${branchIdStr}@email.com`,
          password: defaultPassword,
          role: "cashier",
          branch_id: branch.id,
          is_active: true,
          email_verified_at: new Date(),
        },
      });
      console.log(`Created cashier for branch ${branchIdStr}`);
    }

    // Couriers
    for (let i = courierCount; i < 2; i++) {
      const courierCode = `C${branchIdStr.padStart(2, '0')}${i + 1}`;
      await prisma.users.create({
        data: {
          name: `Courier ${i + 1} ${branch.name}`,
          email: `courier_${branchIdStr}_${i + 1}@email.com`,
          password: defaultPassword,
          role: "courier",
          branch_id: branch.id,
          is_active: true,
          courier_code: courierCode,
          email_verified_at: new Date(),
        },
      });
      console.log(`Created courier ${i + 1} for branch ${branchIdStr}`);
    }
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
