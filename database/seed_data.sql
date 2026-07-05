-- =============================================================================
-- Ekspedisi Online — Data Seeder (INSERT ONLY)
-- =============================================================================
-- Tidak mengubah struktur database. Hanya menambahkan data dummy untuk testing.
-- Password semua akun: password123
-- Hash bcrypt (Laravel $2y$10$...): password123
-- =============================================================================

USE `ekspedisi`;

START TRANSACTION;

SET @default_password = '$2y$10$E6om0xePps0F90THRIh2YutQm5T3yT15kAuEVh8Nycxpt83QhV3TW';

-- =============================================================================
-- 1. BRANCHES (5 cabang)
-- =============================================================================

INSERT INTO `branches` (`name`, `city`, `address`, `phone`)
SELECT 'Cabang Bandung', 'Bandung', 'Jl. Asia Afrika No. 65, Bandung', '0224201234'
WHERE NOT EXISTS (SELECT 1 FROM `branches` WHERE `city` = 'Bandung' AND `name` = 'Cabang Bandung');

INSERT INTO `branches` (`name`, `city`, `address`, `phone`)
SELECT 'Cabang Jakarta', 'Jakarta', 'Jl. Gatot Subroto No. 88, Jakarta Selatan', '0215551234'
WHERE NOT EXISTS (SELECT 1 FROM `branches` WHERE `city` = 'Jakarta' AND `name` = 'Cabang Jakarta');

INSERT INTO `branches` (`name`, `city`, `address`, `phone`)
SELECT 'Cabang Bekasi', 'Bekasi', 'Jl. Ahmad Yani No. 120, Bekasi', '0218899123'
WHERE NOT EXISTS (SELECT 1 FROM `branches` WHERE `city` = 'Bekasi' AND `name` = 'Cabang Bekasi');

INSERT INTO `branches` (`name`, `city`, `address`, `phone`)
SELECT 'Cabang Surabaya', 'Surabaya', 'Jl. Pemuda No. 45, Surabaya', '0315556789'
WHERE NOT EXISTS (SELECT 1 FROM `branches` WHERE `city` = 'Surabaya' AND `name` = 'Cabang Surabaya');

INSERT INTO `branches` (`name`, `city`, `address`, `phone`)
SELECT 'Cabang Yogyakarta', 'Yogyakarta', 'Jl. Malioboro No. 12, Yogyakarta', '0274512345'
WHERE NOT EXISTS (SELECT 1 FROM `branches` WHERE `city` = 'Yogyakarta' AND `name` = 'Cabang Yogyakarta');

-- =============================================================================
-- 2. RATES (seluruh kombinasi kota cabang: 5 x 5 = 25 tarif)
-- =============================================================================

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Bandung', 'Bandung', 5000.00, 1
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Bandung' AND `destination_city` = 'Bandung');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Bandung', 'Jakarta', 8000.00, 1
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Bandung' AND `destination_city` = 'Jakarta');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Bandung', 'Bekasi', 9000.00, 1
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Bandung' AND `destination_city` = 'Bekasi');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Bandung', 'Surabaya', 14000.00, 2
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Bandung' AND `destination_city` = 'Surabaya');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Bandung', 'Yogyakarta', 10000.00, 2
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Bandung' AND `destination_city` = 'Yogyakarta');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Jakarta', 'Bandung', 8000.00, 1
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Jakarta' AND `destination_city` = 'Bandung');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Jakarta', 'Jakarta', 5000.00, 1
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Jakarta' AND `destination_city` = 'Jakarta');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Jakarta', 'Bekasi', 6000.00, 1
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Jakarta' AND `destination_city` = 'Bekasi');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Jakarta', 'Surabaya', 12000.00, 2
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Jakarta' AND `destination_city` = 'Surabaya');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Jakarta', 'Yogyakarta', 11000.00, 2
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Jakarta' AND `destination_city` = 'Yogyakarta');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Bekasi', 'Bandung', 9000.00, 1
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Bekasi' AND `destination_city` = 'Bandung');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Bekasi', 'Jakarta', 6000.00, 1
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Bekasi' AND `destination_city` = 'Jakarta');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Bekasi', 'Bekasi', 5000.00, 1
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Bekasi' AND `destination_city` = 'Bekasi');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Bekasi', 'Surabaya', 11500.00, 2
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Bekasi' AND `destination_city` = 'Surabaya');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Bekasi', 'Yogyakarta', 10500.00, 2
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Bekasi' AND `destination_city` = 'Yogyakarta');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Surabaya', 'Bandung', 14000.00, 2
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Surabaya' AND `destination_city` = 'Bandung');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Surabaya', 'Jakarta', 12000.00, 2
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Surabaya' AND `destination_city` = 'Jakarta');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Surabaya', 'Bekasi', 11500.00, 2
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Surabaya' AND `destination_city` = 'Bekasi');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Surabaya', 'Surabaya', 5000.00, 1
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Surabaya' AND `destination_city` = 'Surabaya');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Surabaya', 'Yogyakarta', 8000.00, 1
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Surabaya' AND `destination_city` = 'Yogyakarta');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Yogyakarta', 'Bandung', 10000.00, 2
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Yogyakarta' AND `destination_city` = 'Bandung');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Yogyakarta', 'Jakarta', 11000.00, 2
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Yogyakarta' AND `destination_city` = 'Jakarta');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Yogyakarta', 'Bekasi', 10500.00, 2
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Yogyakarta' AND `destination_city` = 'Bekasi');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Yogyakarta', 'Surabaya', 8000.00, 1
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Yogyakarta' AND `destination_city` = 'Surabaya');

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
SELECT 'Yogyakarta', 'Yogyakarta', 5000.00, 1
WHERE NOT EXISTS (SELECT 1 FROM `rates` WHERE `origin_city` = 'Yogyakarta' AND `destination_city` = 'Yogyakarta');

-- =============================================================================
-- 3. USERS
-- =============================================================================

-- Owner (1 akun, tanpa cabang)
INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Owner Ekspedisi', 'owner@ekspedisi.com', NULL, NOW(), @default_password, 'owner', NULL, NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'owner@ekspedisi.com');

-- Manager (1 akun, tanpa cabang)
INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Manager Ekspedisi', 'manager@ekspedisi.com', NULL, NOW(), @default_password, 'manager', NULL, NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'manager@ekspedisi.com');

-- Admin per cabang (5 akun)
INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Admin Bandung', 'admin-bandung@ekspedisi.com', NULL, NOW(), @default_password, 'admin',
  (SELECT `id` FROM `branches` WHERE `city` = 'Bandung' AND `name` = 'Cabang Bandung' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'admin-bandung@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Admin Jakarta', 'admin-jakarta@ekspedisi.com', NULL, NOW(), @default_password, 'admin',
  (SELECT `id` FROM `branches` WHERE `city` = 'Jakarta' AND `name` = 'Cabang Jakarta' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'admin-jakarta@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Admin Bekasi', 'admin-bekasi@ekspedisi.com', NULL, NOW(), @default_password, 'admin',
  (SELECT `id` FROM `branches` WHERE `city` = 'Bekasi' AND `name` = 'Cabang Bekasi' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'admin-bekasi@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Admin Surabaya', 'admin-surabaya@ekspedisi.com', NULL, NOW(), @default_password, 'admin',
  (SELECT `id` FROM `branches` WHERE `city` = 'Surabaya' AND `name` = 'Cabang Surabaya' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'admin-surabaya@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Admin Yogyakarta', 'admin-yogyakarta@ekspedisi.com', NULL, NOW(), @default_password, 'admin',
  (SELECT `id` FROM `branches` WHERE `city` = 'Yogyakarta' AND `name` = 'Cabang Yogyakarta' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'admin-yogyakarta@ekspedisi.com');

-- Kasir per cabang (2 kasir x 5 cabang = 10 akun)
INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kasir Bandung 1', 'kasir1-bandung@ekspedisi.com', NULL, NOW(), @default_password, 'cashier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Bandung' AND `name` = 'Cabang Bandung' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kasir1-bandung@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kasir Bandung 2', 'kasir2-bandung@ekspedisi.com', NULL, NOW(), @default_password, 'cashier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Bandung' AND `name` = 'Cabang Bandung' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kasir2-bandung@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kasir Jakarta 1', 'kasir1-jakarta@ekspedisi.com', NULL, NOW(), @default_password, 'cashier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Jakarta' AND `name` = 'Cabang Jakarta' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kasir1-jakarta@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kasir Jakarta 2', 'kasir2-jakarta@ekspedisi.com', NULL, NOW(), @default_password, 'cashier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Jakarta' AND `name` = 'Cabang Jakarta' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kasir2-jakarta@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kasir Bekasi 1', 'kasir1-bekasi@ekspedisi.com', NULL, NOW(), @default_password, 'cashier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Bekasi' AND `name` = 'Cabang Bekasi' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kasir1-bekasi@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kasir Bekasi 2', 'kasir2-bekasi@ekspedisi.com', NULL, NOW(), @default_password, 'cashier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Bekasi' AND `name` = 'Cabang Bekasi' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kasir2-bekasi@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kasir Surabaya 1', 'kasir1-surabaya@ekspedisi.com', NULL, NOW(), @default_password, 'cashier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Surabaya' AND `name` = 'Cabang Surabaya' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kasir1-surabaya@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kasir Surabaya 2', 'kasir2-surabaya@ekspedisi.com', NULL, NOW(), @default_password, 'cashier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Surabaya' AND `name` = 'Cabang Surabaya' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kasir2-surabaya@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kasir Yogyakarta 1', 'kasir1-yogyakarta@ekspedisi.com', NULL, NOW(), @default_password, 'cashier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Yogyakarta' AND `name` = 'Cabang Yogyakarta' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kasir1-yogyakarta@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kasir Yogyakarta 2', 'kasir2-yogyakarta@ekspedisi.com', NULL, NOW(), @default_password, 'cashier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Yogyakarta' AND `name` = 'Cabang Yogyakarta' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kasir2-yogyakarta@ekspedisi.com');

-- Kurir per cabang (3 kurir: Motor, Mobil, Truck — 5 x 3 = 15 akun)
-- Kode kurir: {kode_cabang}{urut} — Bandung=003, Jakarta=005, Bekasi=004, Surabaya=006, Yogyakarta=007

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kurir Bandung Motor', 'kurir-motor.bandung@ekspedisi.com', '00301', NOW(), @default_password, 'courier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Bandung' AND `name` = 'Cabang Bandung' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kurir-motor.bandung@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kurir Bandung Mobil', 'kurir-mobil.bandung@ekspedisi.com', '00302', NOW(), @default_password, 'courier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Bandung' AND `name` = 'Cabang Bandung' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kurir-mobil.bandung@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kurir Bandung Truck', 'kurir-truck.bandung@ekspedisi.com', '00303', NOW(), @default_password, 'courier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Bandung' AND `name` = 'Cabang Bandung' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kurir-truck.bandung@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kurir Jakarta Motor', 'kurir-motor.jakarta@ekspedisi.com', '00501', NOW(), @default_password, 'courier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Jakarta' AND `name` = 'Cabang Jakarta' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kurir-motor.jakarta@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kurir Jakarta Mobil', 'kurir-mobil.jakarta@ekspedisi.com', '00502', NOW(), @default_password, 'courier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Jakarta' AND `name` = 'Cabang Jakarta' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kurir-mobil.jakarta@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kurir Jakarta Truck', 'kurir-truck.jakarta@ekspedisi.com', '00503', NOW(), @default_password, 'courier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Jakarta' AND `name` = 'Cabang Jakarta' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kurir-truck.jakarta@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kurir Bekasi Motor', 'kurir-motor.bekasi@ekspedisi.com', '00401', NOW(), @default_password, 'courier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Bekasi' AND `name` = 'Cabang Bekasi' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kurir-motor.bekasi@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kurir Bekasi Mobil', 'kurir-mobil.bekasi@ekspedisi.com', '00402', NOW(), @default_password, 'courier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Bekasi' AND `name` = 'Cabang Bekasi' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kurir-mobil.bekasi@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kurir Bekasi Truck', 'kurir-truck.bekasi@ekspedisi.com', '00403', NOW(), @default_password, 'courier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Bekasi' AND `name` = 'Cabang Bekasi' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kurir-truck.bekasi@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kurir Surabaya Motor', 'kurir-motor.surabaya@ekspedisi.com', '00601', NOW(), @default_password, 'courier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Surabaya' AND `name` = 'Cabang Surabaya' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kurir-motor.surabaya@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kurir Surabaya Mobil', 'kurir-mobil.surabaya@ekspedisi.com', '00602', NOW(), @default_password, 'courier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Surabaya' AND `name` = 'Cabang Surabaya' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kurir-mobil.surabaya@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kurir Surabaya Truck', 'kurir-truck.surabaya@ekspedisi.com', '00603', NOW(), @default_password, 'courier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Surabaya' AND `name` = 'Cabang Surabaya' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kurir-truck.surabaya@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kurir Yogyakarta Motor', 'kurir-motor.yogyakarta@ekspedisi.com', '00701', NOW(), @default_password, 'courier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Yogyakarta' AND `name` = 'Cabang Yogyakarta' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kurir-motor.yogyakarta@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kurir Yogyakarta Mobil', 'kurir-mobil.yogyakarta@ekspedisi.com', '00702', NOW(), @default_password, 'courier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Yogyakarta' AND `name` = 'Cabang Yogyakarta' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kurir-mobil.yogyakarta@ekspedisi.com');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Kurir Yogyakarta Truck', 'kurir-truck.yogyakarta@ekspedisi.com', '00703', NOW(), @default_password, 'courier',
  (SELECT `id` FROM `branches` WHERE `city` = 'Yogyakarta' AND `name` = 'Cabang Yogyakarta' LIMIT 1), NULL, TRUE
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'kurir-truck.yogyakarta@ekspedisi.com');

-- =============================================================================
-- 4. VEHICLES (1 kendaraan per kurir = 15 kendaraan)
-- =============================================================================

INSERT INTO `vehicles` (`plate_number`, `type`, `courier_id`)
SELECT 'D 1234 ABC', 'motor',
  (SELECT `id` FROM `users` WHERE `email` = 'kurir-motor.bandung@ekspedisi.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM `vehicles` WHERE `plate_number` = 'D 1234 ABC');

INSERT INTO `vehicles` (`plate_number`, `type`, `courier_id`)
SELECT 'D 5678 ABD', 'mobil',
  (SELECT `id` FROM `users` WHERE `email` = 'kurir-mobil.bandung@ekspedisi.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM `vehicles` WHERE `plate_number` = 'D 5678 ABD');

INSERT INTO `vehicles` (`plate_number`, `type`, `courier_id`)
SELECT 'D 9012 TRK', 'truck',
  (SELECT `id` FROM `users` WHERE `email` = 'kurir-truck.bandung@ekspedisi.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM `vehicles` WHERE `plate_number` = 'D 9012 TRK');

INSERT INTO `vehicles` (`plate_number`, `type`, `courier_id`)
SELECT 'B 1111 JKT', 'motor',
  (SELECT `id` FROM `users` WHERE `email` = 'kurir-motor.jakarta@ekspedisi.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM `vehicles` WHERE `plate_number` = 'B 1111 JKT');

INSERT INTO `vehicles` (`plate_number`, `type`, `courier_id`)
SELECT 'B 2222 JKT', 'mobil',
  (SELECT `id` FROM `users` WHERE `email` = 'kurir-mobil.jakarta@ekspedisi.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM `vehicles` WHERE `plate_number` = 'B 2222 JKT');

INSERT INTO `vehicles` (`plate_number`, `type`, `courier_id`)
SELECT 'B 3333 JKT', 'truck',
  (SELECT `id` FROM `users` WHERE `email` = 'kurir-truck.jakarta@ekspedisi.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM `vehicles` WHERE `plate_number` = 'B 3333 JKT');

INSERT INTO `vehicles` (`plate_number`, `type`, `courier_id`)
SELECT 'B 4444 BKS', 'motor',
  (SELECT `id` FROM `users` WHERE `email` = 'kurir-motor.bekasi@ekspedisi.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM `vehicles` WHERE `plate_number` = 'B 4444 BKS');

INSERT INTO `vehicles` (`plate_number`, `type`, `courier_id`)
SELECT 'B 5555 BKS', 'mobil',
  (SELECT `id` FROM `users` WHERE `email` = 'kurir-mobil.bekasi@ekspedisi.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM `vehicles` WHERE `plate_number` = 'B 5555 BKS');

INSERT INTO `vehicles` (`plate_number`, `type`, `courier_id`)
SELECT 'B 6666 BKS', 'truck',
  (SELECT `id` FROM `users` WHERE `email` = 'kurir-truck.bekasi@ekspedisi.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM `vehicles` WHERE `plate_number` = 'B 6666 BKS');

INSERT INTO `vehicles` (`plate_number`, `type`, `courier_id`)
SELECT 'L 7777 SBY', 'motor',
  (SELECT `id` FROM `users` WHERE `email` = 'kurir-motor.surabaya@ekspedisi.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM `vehicles` WHERE `plate_number` = 'L 7777 SBY');

INSERT INTO `vehicles` (`plate_number`, `type`, `courier_id`)
SELECT 'L 8888 SBY', 'mobil',
  (SELECT `id` FROM `users` WHERE `email` = 'kurir-mobil.surabaya@ekspedisi.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM `vehicles` WHERE `plate_number` = 'L 8888 SBY');

INSERT INTO `vehicles` (`plate_number`, `type`, `courier_id`)
SELECT 'L 9999 SBY', 'truck',
  (SELECT `id` FROM `users` WHERE `email` = 'kurir-truck.surabaya@ekspedisi.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM `vehicles` WHERE `plate_number` = 'L 9999 SBY');

INSERT INTO `vehicles` (`plate_number`, `type`, `courier_id`)
SELECT 'AB 1212 YK', 'motor',
  (SELECT `id` FROM `users` WHERE `email` = 'kurir-motor.yogyakarta@ekspedisi.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM `vehicles` WHERE `plate_number` = 'AB 1212 YK');

INSERT INTO `vehicles` (`plate_number`, `type`, `courier_id`)
SELECT 'AB 3434 YK', 'mobil',
  (SELECT `id` FROM `users` WHERE `email` = 'kurir-mobil.yogyakarta@ekspedisi.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM `vehicles` WHERE `plate_number` = 'AB 3434 YK');

INSERT INTO `vehicles` (`plate_number`, `type`, `courier_id`)
SELECT 'AB 5656 YK', 'truck',
  (SELECT `id` FROM `users` WHERE `email` = 'kurir-truck.yogyakarta@ekspedisi.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM `vehicles` WHERE `plate_number` = 'AB 5656 YK');

COMMIT;

-- =============================================================================
-- Validasi setelah import
-- =============================================================================
-- SELECT COUNT(*) AS total_branches FROM branches;
-- SELECT COUNT(*) AS total_rates FROM rates;
-- SELECT COUNT(*) AS total_users FROM users;
-- SELECT COUNT(*) AS total_vehicles FROM vehicles;
--
-- SELECT role, COUNT(*) AS jumlah FROM users GROUP BY role;
-- SELECT city, COUNT(*) AS jumlah FROM branches GROUP BY city;
--
-- Akun login testing:
--   owner@ekspedisi.com / password123
--   manager@ekspedisi.com / password123
--   admin-bandung@ekspedisi.com / password123
--   kasir1-bandung@ekspedisi.com / password123
--   kurir-motor.bandung@ekspedisi.com / password123
