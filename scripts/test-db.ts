import { prisma } from "../src/lib/prisma";

async function main() {
  const branches = await prisma.branches.findMany({
    orderBy: {
      id: "asc",
    },
  });

  console.dir({ branches }, { depth: null });

  const shipments = await prisma.shipments.findMany({
    include: {
      customers_shipments_sender_idTocustomers: true,
      customers_shipments_receiver_idTocustomers: true,
      payments: true,
      shipment_trackings: true,
    },
    orderBy: {
      tracking_number: "asc",
    },
  });

  console.dir({ shipments }, { depth: null });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
