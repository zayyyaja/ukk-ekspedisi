import { PrismaClient, payments_payment_method, shipments_handover_method } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  try {
    const trackingNumber = `EXP-${randomBytes(6).toString('hex').toUpperCase()}`;
    
    // Get first customer
    const sender = await prisma.customers.findFirst();
    const receiver = await prisma.customers.findFirst({ skip: 1 });
    
    // Get branches
    const origin = await prisma.branches.findFirst();
    const dest = await prisma.branches.findFirst({ skip: 1 });
    
    // Get rate
    const rate = await prisma.rates.findFirst();

    if (!sender || !receiver || !origin || !dest || !rate) {
      console.log('Missing required data');
      return;
    }

    const shipment = await prisma.shipments.create({
      data: {
        tracking_number: trackingNumber,
        sender_id: sender.id,
        receiver_id: receiver.id,
        origin_branch_id: origin.id,
        destination_branch_id: dest.id,
        rate_id: rate.id,
        handover_method: shipments_handover_method.drop_off,
        total_weight: 1.5,
        total_price: 15000,
        shipment_date: new Date(),
        payments: {
          create: {
            amount: 15000,
            payment_method: payments_payment_method.cash,
            payment_date: null,
            transaction_reference: null,
            expired_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
          }
        }
      }
    });

    console.log('Success:', shipment.id);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
