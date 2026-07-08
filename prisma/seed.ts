import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai data seeding...');

  // =============================================================================
  // 1. SEEDING BRANCHES (Cabang)
  // =============================================================================
  const branchesData = [
    { name: 'Cabang Bogor', city: 'Bogor', address: 'Jl. Raya Pajajaran No. 12, Bogor', phone: '02518312345' },
    { name: 'Cabang Jakarta', city: 'Jakarta', address: 'Jl. Gatot Subroto No. 88, Jakarta Selatan', phone: '0215551234' },
    { name: 'Cabang Bekasi', city: 'Bekasi', address: 'Jl. Ahmad Yani No. 120, Bekasi', phone: '0218899123' },
    { name: 'Cabang Surabaya', city: 'Surabaya', address: 'Jl. Pemuda No. 45, Surabaya', phone: '0315556789' },
    { name: 'Cabang Sukabumi', city: 'Sukabumi', address: 'Jl. Jendral Sudirman No. 45, Sukabumi', phone: '0266212345' },
  ];

  const branchMap: { [key: string]: bigint } = {};

  for (const b of branchesData) {
    let branch = await prisma.branches.findFirst({
      where: { city: b.city, name: b.name },
    });
    if (!branch) {
      branch = await prisma.branches.create({ data: b });
    }
    branchMap[b.city] = branch.id;
  }
  console.log('✅ Seeding Branches selesai.');

  // =============================================================================
  // 2. SEEDING RATES (Tarif Antar Kota)
  // =============================================================================
  const ratesData = [
    // Bogor (Replacing Bandung)
    { origin_city: 'Bogor', destination_city: 'Bogor', price_per_kg: 5000.00, estimated_days: 1 },
    { origin_city: 'Bogor', destination_city: 'Jakarta', price_per_kg: 8000.00, estimated_days: 1 },
    { origin_city: 'Bogor', destination_city: 'Bekasi', price_per_kg: 9000.00, estimated_days: 1 },
    { origin_city: 'Bogor', destination_city: 'Surabaya', price_per_kg: 14000.00, estimated_days: 2 },
    { origin_city: 'Bogor', destination_city: 'Sukabumi', price_per_kg: 10000.00, estimated_days: 2 },

    // Jakarta
    { origin_city: 'Jakarta', destination_city: 'Bogor', price_per_kg: 8000.00, estimated_days: 1 },
    { origin_city: 'Jakarta', destination_city: 'Jakarta', price_per_kg: 5000.00, estimated_days: 1 },
    { origin_city: 'Jakarta', destination_city: 'Bekasi', price_per_kg: 6000.00, estimated_days: 1 },
    { origin_city: 'Jakarta', destination_city: 'Surabaya', price_per_kg: 12000.00, estimated_days: 2 },
    { origin_city: 'Jakarta', destination_city: 'Sukabumi', price_per_kg: 11000.00, estimated_days: 2 },

    // Bekasi
    { origin_city: 'Bekasi', destination_city: 'Bogor', price_per_kg: 9000.00, estimated_days: 1 },
    { origin_city: 'Bekasi', destination_city: 'Jakarta', price_per_kg: 6000.00, estimated_days: 1 },
    { origin_city: 'Bekasi', destination_city: 'Bekasi', price_per_kg: 5000.00, estimated_days: 1 },
    { origin_city: 'Bekasi', destination_city: 'Surabaya', price_per_kg: 11500.00, estimated_days: 2 },
    { origin_city: 'Bekasi', destination_city: 'Sukabumi', price_per_kg: 10500.00, estimated_days: 2 },

    // Surabaya
    { origin_city: 'Surabaya', destination_city: 'Bogor', price_per_kg: 14000.00, estimated_days: 2 },
    { origin_city: 'Surabaya', destination_city: 'Jakarta', price_per_kg: 12000.00, estimated_days: 2 },
    { origin_city: 'Surabaya', destination_city: 'Bekasi', price_per_kg: 11500.00, estimated_days: 2 },
    { origin_city: 'Surabaya', destination_city: 'Surabaya', price_per_kg: 5000.00, estimated_days: 1 },
    { origin_city: 'Surabaya', destination_city: 'Sukabumi', price_per_kg: 8000.00, estimated_days: 1 },

    // Sukabumi (Replacing Yogyakarta)
    { origin_city: 'Sukabumi', destination_city: 'Bogor', price_per_kg: 10000.00, estimated_days: 2 },
    { origin_city: 'Sukabumi', destination_city: 'Jakarta', price_per_kg: 11000.00, estimated_days: 2 },
    { origin_city: 'Sukabumi', destination_city: 'Bekasi', price_per_kg: 10500.00, estimated_days: 2 },
    { origin_city: 'Sukabumi', destination_city: 'Surabaya', price_per_kg: 8000.00, estimated_days: 1 },
    { origin_city: 'Sukabumi', destination_city: 'Sukabumi', price_per_kg: 5000.00, estimated_days: 1 },
  ];

  for (const r of ratesData) {
    await prisma.rates.upsert({
      where: {
        origin_city_destination_city: {
          origin_city: r.origin_city,
          destination_city: r.destination_city,
        },
      },
      update: {},
      create: r,
    });
  }
  console.log('✅ Seeding Rates selesai.');

  // =============================================================================
  // 3. SEEDING USERS (Pengguna)
  // =============================================================================
  const usersData = [
    // Global Roles
    { name: 'Owner Ekspedisi', email: 'owner@ekspedisi.com', courier_code: null, role: 'owner', city: null, pass: 'owner123' },
    { name: 'Manager Ekspedisi', email: 'manager@ekspedisi.com', courier_code: null, role: 'manager', city: null, pass: 'manager123' },

    // Admin per Cabang
    { name: 'Admin Bogor', email: 'admin-bogor@ekspedisi.com', courier_code: null, role: 'admin', city: 'Bogor', pass: 'adminbogor123' },
    { name: 'Admin Jakarta', email: 'admin-jakarta@ekspedisi.com', courier_code: null, role: 'admin', city: 'Jakarta', pass: 'adminjakarta123' },
    { name: 'Admin Bekasi', email: 'admin-bekasi@ekspedisi.com', courier_code: null, role: 'admin', city: 'Bekasi', pass: 'adminbekasi123' },
    { name: 'Admin Surabaya', email: 'admin-surabaya@ekspedisi.com', courier_code: null, role: 'admin', city: 'Surabaya', pass: 'adminsurabaya123' },
    { name: 'Admin Sukabumi', email: 'admin-sukabumi@ekspedisi.com', courier_code: null, role: 'admin', city: 'Sukabumi', pass: 'adminsukabumi123' },

    // Kasir per Cabang
    { name: 'Kasir Bogor 1', email: 'kasir1-bogor@ekspedisi.com', courier_code: null, role: 'cashier', city: 'Bogor', pass: 'kasirbogor1' },
    { name: 'Kasir Bogor 2', email: 'kasir2-bogor@ekspedisi.com', courier_code: null, role: 'cashier', city: 'Bogor', pass: 'kasirbogor2' },
    { name: 'Kasir Jakarta 1', email: 'kasir1-jakarta@ekspedisi.com', courier_code: null, role: 'cashier', city: 'Jakarta', pass: 'kasirjakarta1' },
    { name: 'Kasir Jakarta 2', email: 'kasir2-jakarta@ekspedisi.com', courier_code: null, role: 'cashier', city: 'Jakarta', pass: 'kasirjakarta2' },
    { name: 'Kasir Bekasi 1', email: 'kasir1-bekasi@ekspedisi.com', courier_code: null, role: 'cashier', city: 'Bekasi', pass: 'kasirbekasi1' },
    { name: 'Kasir Bekasi 2', email: 'kasir2-bekasi@ekspedisi.com', courier_code: null, role: 'cashier', city: 'Bekasi', pass: 'kasirbekasi2' },
    { name: 'Kasir Surabaya 1', email: 'kasir1-surabaya@ekspedisi.com', courier_code: null, role: 'cashier', city: 'Surabaya', pass: 'kasirsurabaya1' },
    { name: 'Kasir Surabaya 2', email: 'kasir2-surabaya@ekspedisi.com', courier_code: null, role: 'cashier', city: 'Surabaya', pass: 'kasirsurabaya2' },
    { name: 'Kasir Sukabumi 1', email: 'kasir1-sukabumi@ekspedisi.com', courier_code: null, role: 'cashier', city: 'Sukabumi', pass: 'kasirsukabumi1' },
    { name: 'Kasir Sukabumi 2', email: 'kasir2-sukabumi@ekspedisi.com', courier_code: null, role: 'cashier', city: 'Sukabumi', pass: 'kasirsukabumi2' },

    // Kurir per Cabang (Kode kurir disesuaikan: Bogor=003, Bekasi=004, Jakarta=005, Surabaya=006, Sukabumi=007)
    { name: 'Kurir Bogor Motor', email: 'kurir-motor.bogor@ekspedisi.com', courier_code: '00301', role: 'courier', city: 'Bogor', pass: 'kurirbogor1' },
    { name: 'Kurir Bogor Mobil', email: 'kurir-mobil.bogor@ekspedisi.com', courier_code: '00302', role: 'courier', city: 'Bogor', pass: 'kurirbogor2' },
    { name: 'Kurir Bogor Truck', email: 'kurir-truck.bogor@ekspedisi.com', courier_code: '00303', role: 'courier', city: 'Bogor', pass: 'kurirbogor3' },

    { name: 'Kurir Jakarta Motor', email: 'kurir-motor.jakarta@ekspedisi.com', courier_code: '00501', role: 'courier', city: 'Jakarta', pass: 'kurirjakarta1' },
    { name: 'Kurir Jakarta Mobil', email: 'kurir-mobil.jakarta@ekspedisi.com', courier_code: '00502', role: 'courier', city: 'Jakarta', pass: 'kurirjakarta2' },
    { name: 'Kurir Jakarta Truck', email: 'kurir-truck.jakarta@ekspedisi.com', courier_code: '00503', role: 'courier', city: 'Jakarta', pass: 'kurirjakarta3' },

    { name: 'Kurir Bekasi Motor', email: 'kurir-motor.bekasi@ekspedisi.com', courier_code: '00401', role: 'courier', city: 'Bekasi', pass: 'kurirbekasi1' },
    { name: 'Kurir Bekasi Mobil', email: 'kurir-mobil.bekasi@ekspedisi.com', courier_code: '00402', role: 'courier', city: 'Bekasi', pass: 'kurirbekasi2' },
    { name: 'Kurir Bekasi Truck', email: 'kurir-truck.bekasi@ekspedisi.com', courier_code: '00403', role: 'courier', city: 'Bekasi', pass: 'kurirbekasi3' },

    { name: 'Kurir Surabaya Motor', email: 'kurir-motor.surabaya@ekspedisi.com', courier_code: '00601', role: 'courier', city: 'Surabaya', pass: 'kurirsurabaya1' },
    { name: 'Kurir Surabaya Mobil', email: 'kurir-mobil.surabaya@ekspedisi.com', courier_code: '00602', role: 'courier', city: 'Surabaya', pass: 'kurirsurabaya2' },
    { name: 'Kurir Surabaya Truck', email: 'kurir-truck.surabaya@ekspedisi.com', courier_code: '00603', role: 'courier', city: 'Surabaya', pass: 'kurirsurabaya3' },

    { name: 'Kurir Sukabumi Motor', email: 'kurir-motor.sukabumi@ekspedisi.com', courier_code: '00701', role: 'courier', city: 'Sukabumi', pass: 'kurirsukabumi1' },
    { name: 'Kurir Sukabumi Mobil', email: 'kurir-mobil.sukabumi@ekspedisi.com', courier_code: '00702', role: 'courier', city: 'Sukabumi', pass: 'kurirsukabumi2' },
    { name: 'Kurir Sukabumi Truck', email: 'kurir-truck.sukabumi@ekspedisi.com', courier_code: '00703', role: 'courier', city: 'Sukabumi', pass: 'kurirsukabumi3' },
  ];

  const courierMap: { [key: string]: bigint } = {};

  for (const u of usersData) {
    const branchId = u.city ? branchMap[u.city] : null;
    const passwordHash = bcrypt.hashSync(u.pass, 10);

    let user = await prisma.users.findUnique({
      where: { email: u.email },
    });

    if (!user) {
      user = await prisma.users.create({
        data: {
          name: u.name,
          email: u.email,
          courier_code: u.courier_code,
          email_verified_at: new Date(),
          password: passwordHash,
          role: u.role as any,
          branch_id: branchId,
          is_active: true,
        },
      });
    }

    if (u.role === 'courier') {
      courierMap[u.email] = user.id;
    }
  }
  console.log('✅ Seeding Users selesai.');

  // =============================================================================
  // 4. SEEDING VEHICLES (Kendaraan Kurir)
  // =============================================================================
  const vehiclesData = [
    // Bogor (Ubah plat dari D jadi F)
    { plate_number: 'F 1234 ABC', type: 'motor', email: 'kurir-motor.bogor@ekspedisi.com' },
    { plate_number: 'F 5678 ABD', type: 'mobil', email: 'kurir-mobil.bogor@ekspedisi.com' },
    { plate_number: 'F 9012 TRK', type: 'truck', email: 'kurir-truck.bogor@ekspedisi.com' },

    // Jakarta
    { plate_number: 'B 1111 JKT', type: 'motor', email: 'kurir-motor.jakarta@ekspedisi.com' },
    { plate_number: 'B 2222 JKT', type: 'mobil', email: 'kurir-mobil.jakarta@ekspedisi.com' },
    { plate_number: 'B 3333 JKT', type: 'truck', email: 'kurir-truck.jakarta@ekspedisi.com' },

    // Bekasi
    { plate_number: 'B 4444 BKS', type: 'motor', email: 'kurir-motor.bekasi@ekspedisi.com' },
    { plate_number: 'B 5555 BKS', type: 'mobil', email: 'kurir-mobil.bekasi@ekspedisi.com' },
    { plate_number: 'B 6666 BKS', type: 'truck', email: 'kurir-truck.bekasi@ekspedisi.com' },

    // Surabaya
    { plate_number: 'L 7777 SBY', type: 'motor', email: 'kurir-motor.surabaya@ekspedisi.com' },
    { plate_number: 'L 8888 SBY', type: 'mobil', email: 'kurir-mobil.surabaya@ekspedisi.com' },
    { plate_number: 'L 9999 SBY', type: 'truck', email: 'kurir-truck.surabaya@ekspedisi.com' },

    // Sukabumi (Ubah plat dari AB jadi F)
    { plate_number: 'F 1212 SKM', type: 'motor', email: 'kurir-motor.sukabumi@ekspedisi.com' },
    { plate_number: 'F 3434 SKM', type: 'mobil', email: 'kurir-mobil.sukabumi@ekspedisi.com' },
    { plate_number: 'F 5656 SKM', type: 'truck', email: 'kurir-truck.sukabumi@ekspedisi.com' },
  ];

  for (const v of vehiclesData) {
    const courierId = courierMap[v.email];
    if (courierId) {
      await prisma.vehicles.upsert({
        where: { plate_number: v.plate_number },
        update: { courier_id: courierId },
        create: {
          plate_number: v.plate_number,
          type: v.type as any,
          courier_id: courierId,
        },
      });
    }
  }
  console.log('✅ Seeding Vehicles selesai.');
  console.log('🚀 Semua data sukses di-seed ke database!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });