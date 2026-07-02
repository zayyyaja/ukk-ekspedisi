import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMissingRates() {
  const missingRates = [
    { origin_city: 'Jakarta', destination_city: 'Bogor', price_per_kg: 10000, estimated_days: 1 },
    { origin_city: 'Bogor', destination_city: 'Jakarta', price_per_kg: 10000, estimated_days: 1 },
    { origin_city: 'Jakarta', destination_city: 'Bandung', price_per_kg: 15000, estimated_days: 2 },
    { origin_city: 'Bandung', destination_city: 'Jakarta', price_per_kg: 15000, estimated_days: 2 },
    { origin_city: 'Jakarta', destination_city: 'Jakarta', price_per_kg: 5000, estimated_days: 1 },
    { origin_city: 'Bandung', destination_city: 'Bandung', price_per_kg: 5000, estimated_days: 1 },
  ];

  for (const rate of missingRates) {
    const existing = await prisma.rates.findFirst({
      where: {
        origin_city: rate.origin_city,
        destination_city: rate.destination_city
      }
    });
    
    if (!existing) {
      await prisma.rates.create({
        data: rate
      });
      console.log(`Inserted rate: ${rate.origin_city} -> ${rate.destination_city}`);
    } else {
      console.log(`Rate already exists: ${rate.origin_city} -> ${rate.destination_city}`);
    }
  }
}

addMissingRates()
  .then(() => console.log('Done'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
