import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const shipment = await prisma.shipments.findFirst({
    include: {
      shipment_trackings: true
    }
  });

  console.log("Found Tracking Number:", shipment?.tracking_number, "Status:", shipment?.status);
}

main().catch(console.error).finally(() => prisma.$disconnect());
