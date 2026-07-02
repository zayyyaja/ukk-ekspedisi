import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkRates() {
  const branches = await prisma.branches.findMany();
  console.log("Branches:", branches.map(b => `${b.city} (${b.name})`));

  const rates = await prisma.rates.findMany();
  console.log("Rates:", rates.map(r => `${r.origin_city} -> ${r.destination_city} : ${r.price_per_kg}`));
}

checkRates().finally(() => prisma.$disconnect());
