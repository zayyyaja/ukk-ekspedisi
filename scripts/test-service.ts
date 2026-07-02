import { createCashierOrder } from '../src/services/shipment.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const origin = await prisma.branches.findFirst();
    const dest = await prisma.branches.findFirst({ skip: 1 });
    const rate = await prisma.rates.findFirst();

    if (!origin || !dest || !rate) {
      console.log('Missing data');
      return;
    }

    const mockUser = {
      id: 1, // Assumes user 1 exists
      email: 'test@example.com',
      name: 'Cashier Test',
      role: 'cashier',
      branchId: Number(origin.id)
    } as any;

    const input = {
      sender: {
        name: 'Sender Test',
        email: 'sender@example.com',
        phone: '08123456789',
        address: 'Jl Test',
        city: 'Jakarta'
      },
      receiver: {
        name: 'Receiver Test',
        phone: '08987654321',
        address: 'Jl Test 2',
        city: 'Bandung'
      },
      originBranchId: Number(origin.id),
      destinationBranchId: Number(dest.id),
      rateId: Number(rate.id),
      handoverMethod: 'drop_off' as any,
      paymentMethod: 'cash' as any,
      items: [
        {
          itemName: 'Paket 1',
          quantity: 1,
          weight: 1,
          photo: null
        }
      ]
    };

    console.log('Creating order...');
    const result = await createCashierOrder(mockUser, input);
    console.log('Success!', result);
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
