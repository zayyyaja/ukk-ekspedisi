USE `ekspedisi`;

START TRANSACTION;

SET @default_password = '$2y$10$E6om0xePps0F90THRIh2YutQm5T3yT15kAuEVh8Nycxpt83QhV3TW';

INSERT INTO `branches` (`name`, `city`, `address`, `phone`)
VALUES
  ('Jakarta Pusat', 'Jakarta', 'Jl. Merdeka No. 10, Jakarta Pusat', '021123456'),
  ('Depok', 'Depok', 'Jl. Margonda Raya No. 20, Depok', '021765432'),
  ('Bogor', 'Bogor', 'Jl. Pajajaran No. 30, Bogor', '0251838383'),
  ('Bandung', 'Bandung', 'Jl. Asia Afrika No. 40, Bandung', '022123789');

INSERT INTO `users` (`name`, `email`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
VALUES
  ('Admin Global', 'admin@ekspedisi.test', NOW(), @default_password, 'admin', NULL, NULL, TRUE),
  ('Manager Global', 'manager@ekspedisi.test', NOW(), @default_password, 'manager', NULL, NULL, TRUE),
  (
    'Cashier Depok',
    'cashier.depok@ekspedisi.test',
    NOW(),
    @default_password,
    'cashier',
    (SELECT `id` FROM `branches` WHERE `name` = 'Depok' AND `city` = 'Depok' LIMIT 1),
    NULL,
    TRUE
  ),
  (
    'Courier Depok',
    'courier.depok@ekspedisi.test',
    NOW(),
    @default_password,
    'courier',
    (SELECT `id` FROM `branches` WHERE `name` = 'Depok' AND `city` = 'Depok' LIMIT 1),
    NULL,
    TRUE
  ),
  (
    'Cashier Bogor',
    'cashier.bogor@ekspedisi.test',
    NOW(),
    @default_password,
    'cashier',
    (SELECT `id` FROM `branches` WHERE `name` = 'Bogor' AND `city` = 'Bogor' LIMIT 1),
    NULL,
    TRUE
  ),
  (
    'Courier Bogor',
    'courier.bogor@ekspedisi.test',
    NOW(),
    @default_password,
    'courier',
    (SELECT `id` FROM `branches` WHERE `name` = 'Bogor' AND `city` = 'Bogor' LIMIT 1),
    NULL,
    TRUE
  );

INSERT INTO `customers` (`name`, `email`, `email_verified_at`, `password`, `address`, `city`, `phone`, `photo`, `is_verified`)
VALUES
  ('Iqbal Depok', 'iqbal.depok@example.com', NOW(), @default_password, 'Jl. Melati No. 1, Depok', 'Depok', '081111111111', NULL, TRUE),
  ('Budi Bogor', 'budi.bogor@example.com', NOW(), @default_password, 'Jl. Mawar No. 2, Bogor', 'Bogor', '082222222222', NULL, TRUE),
  ('Siti Bandung', 'siti.bandung@example.com', NOW(), @default_password, 'Jl. Anggrek No. 3, Bandung', 'Bandung', '083333333333', NULL, TRUE),
  ('Andi Jakarta', 'andi.jakarta@example.com', NOW(), @default_password, 'Jl. Sudirman No. 4, Jakarta', 'Jakarta', '084444444444', NULL, TRUE),
  ('Rina Depok', 'rina.depok@example.com', NULL, @default_password, 'Jl. Kenanga No. 5, Depok', 'Depok', '085555555555', NULL, FALSE);

INSERT INTO `rates` (`origin_city`, `destination_city`, `price_per_kg`, `estimated_days`)
VALUES
  ('Depok', 'Bogor', 8000, 1),
  ('Bogor', 'Depok', 8000, 1),
  ('Depok', 'Bandung', 12000, 2),
  ('Bandung', 'Depok', 12000, 2),
  ('Bogor', 'Bandung', 10000, 2),
  ('Bandung', 'Bogor', 10000, 2),
  ('Jakarta', 'Depok', 7000, 1),
  ('Depok', 'Jakarta', 7000, 1),
  ('Depok', 'Depok', 5000, 1),
  ('Bogor', 'Bogor', 5000, 1);

INSERT INTO `vehicles` (`plate_number`, `type`, `courier_id`)
VALUES
  (
    'B 1234 DPK',
    'motor',
    (SELECT `id` FROM `users` WHERE `email` = 'courier.depok@ekspedisi.test' AND `role` = 'courier' LIMIT 1)
  ),
  (
    'F 5678 BGR',
    'motor',
    (SELECT `id` FROM `users` WHERE `email` = 'courier.bogor@ekspedisi.test' AND `role` = 'courier' LIMIT 1)
  );

INSERT INTO `shipments` (
  `tracking_number`,
  `sender_id`,
  `receiver_id`,
  `origin_branch_id`,
  `destination_branch_id`,
  `courier_id`,
  `rate_id`,
  `handover_method`,
  `total_weight`,
  `total_price`,
  `status`,
  `shipment_date`,
  `paid_at`,
  `delivered_at`,
  `photo`
)
VALUES
  (
    'EXP-DPK-BGR-0001',
    (SELECT `id` FROM `customers` WHERE `email` = 'iqbal.depok@example.com' LIMIT 1),
    (SELECT `id` FROM `customers` WHERE `email` = 'budi.bogor@example.com' LIMIT 1),
    (SELECT `id` FROM `branches` WHERE `name` = 'Depok' AND `city` = 'Depok' LIMIT 1),
    (SELECT `id` FROM `branches` WHERE `name` = 'Bogor' AND `city` = 'Bogor' LIMIT 1),
    NULL,
    (SELECT `id` FROM `rates` WHERE `origin_city` = 'Depok' AND `destination_city` = 'Bogor' LIMIT 1),
    'drop_off',
    2.00,
    16000,
    'pending',
    CURRENT_DATE,
    NULL,
    NULL,
    NULL
  ),
  (
    'EXP-BGR-BDG-0002',
    (SELECT `id` FROM `customers` WHERE `email` = 'budi.bogor@example.com' LIMIT 1),
    (SELECT `id` FROM `customers` WHERE `email` = 'siti.bandung@example.com' LIMIT 1),
    (SELECT `id` FROM `branches` WHERE `name` = 'Bogor' AND `city` = 'Bogor' LIMIT 1),
    (SELECT `id` FROM `branches` WHERE `name` = 'Bandung' AND `city` = 'Bandung' LIMIT 1),
    (SELECT `id` FROM `users` WHERE `email` = 'courier.bogor@ekspedisi.test' AND `role` = 'courier' LIMIT 1),
    (SELECT `id` FROM `rates` WHERE `origin_city` = 'Bogor' AND `destination_city` = 'Bandung' LIMIT 1),
    'pickup',
    3.00,
    30000,
    'picked_up',
    CURRENT_DATE,
    NOW(),
    NULL,
    NULL
  ),
  (
    'EXP-DPK-DPK-0003',
    (SELECT `id` FROM `customers` WHERE `email` = 'iqbal.depok@example.com' LIMIT 1),
    (SELECT `id` FROM `customers` WHERE `email` = 'rina.depok@example.com' LIMIT 1),
    (SELECT `id` FROM `branches` WHERE `name` = 'Depok' AND `city` = 'Depok' LIMIT 1),
    (SELECT `id` FROM `branches` WHERE `name` = 'Depok' AND `city` = 'Depok' LIMIT 1),
    (SELECT `id` FROM `users` WHERE `email` = 'courier.depok@ekspedisi.test' AND `role` = 'courier' LIMIT 1),
    (SELECT `id` FROM `rates` WHERE `origin_city` = 'Depok' AND `destination_city` = 'Depok' LIMIT 1),
    'drop_off',
    1.50,
    7500,
    'out_for_delivery',
    CURRENT_DATE,
    NOW(),
    NULL,
    NULL
  );

INSERT INTO `shipment_items` (`shipment_id`, `item_name`, `quantity`, `weight`, `photo`)
VALUES
  (
    (SELECT `id` FROM `shipments` WHERE `tracking_number` = 'EXP-DPK-BGR-0001' LIMIT 1),
    'Dokumen Sekolah',
    1,
    2.00,
    'https://example.com/items/dokumen.jpg'
  ),
  (
    (SELECT `id` FROM `shipments` WHERE `tracking_number` = 'EXP-BGR-BDG-0002' LIMIT 1),
    'Sepatu',
    1,
    1.50,
    'https://example.com/items/sepatu.jpg'
  ),
  (
    (SELECT `id` FROM `shipments` WHERE `tracking_number` = 'EXP-BGR-BDG-0002' LIMIT 1),
    'Jaket',
    1,
    1.50,
    'https://example.com/items/jaket.jpg'
  ),
  (
    (SELECT `id` FROM `shipments` WHERE `tracking_number` = 'EXP-DPK-DPK-0003' LIMIT 1),
    'Paket Makanan',
    1,
    1.50,
    'https://example.com/items/makanan.jpg'
  );

INSERT INTO `payments` (`shipment_id`, `amount`, `payment_method`, `payment_status`, `payment_date`, `transaction_reference`)
VALUES
  (
    (SELECT `id` FROM `shipments` WHERE `tracking_number` = 'EXP-DPK-BGR-0001' LIMIT 1),
    16000,
    'cash',
    'pending',
    NULL,
    NULL
  ),
  (
    (SELECT `id` FROM `shipments` WHERE `tracking_number` = 'EXP-BGR-BDG-0002' LIMIT 1),
    30000,
    'qris',
    'paid',
    CURRENT_DATE,
    'MIDTRANS-QRIS-0002'
  ),
  (
    (SELECT `id` FROM `shipments` WHERE `tracking_number` = 'EXP-DPK-DPK-0003' LIMIT 1),
    7500,
    'gopay',
    'paid',
    CURRENT_DATE,
    'MIDTRANS-GOPAY-0003'
  );

INSERT INTO `shipment_trackings` (`shipment_id`, `location`, `description`, `status`, `tracked_at`)
VALUES
  (
    (SELECT `id` FROM `shipments` WHERE `tracking_number` = 'EXP-BGR-BDG-0002' LIMIT 1),
    'Bogor',
    'Paket berhasil diambil oleh kurir dari alamat pengirim.',
    'picked_up',
    NOW()
  ),
  (
    (SELECT `id` FROM `shipments` WHERE `tracking_number` = 'EXP-DPK-DPK-0003' LIMIT 1),
    'Depok',
    'Paket diterima di Cabang Depok.',
    'picked_up',
    NOW()
  ),
  (
    (SELECT `id` FROM `shipments` WHERE `tracking_number` = 'EXP-DPK-DPK-0003' LIMIT 1),
    'Depok',
    'Paket sedang dibawa kurir menuju alamat penerima.',
    'out_for_delivery',
    NOW()
  );

COMMIT;

-- Validation queries:
-- SELECT COUNT(*) FROM branches;
-- SELECT COUNT(*) FROM users;
-- SELECT COUNT(*) FROM customers;
-- SELECT COUNT(*) FROM rates;
-- SELECT COUNT(*) FROM vehicles;
-- SELECT COUNT(*) FROM shipments;
-- SELECT COUNT(*) FROM shipment_items;
-- SELECT COUNT(*) FROM payments;
-- SELECT COUNT(*) FROM shipment_trackings;
