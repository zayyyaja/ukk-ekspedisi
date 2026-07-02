USE `ekspedisi`;

START TRANSACTION;

SET @default_password = '$2y$10$E6om0xePps0F90THRIh2YutQm5T3yT15kAuEVh8Nycxpt83QhV3TW';

INSERT INTO `branches` (`name`, `city`, `address`, `phone`)
VALUES
  ('Jakarta Pusat', 'Jakarta', 'Jl. Merdeka No. 10, Jakarta Pusat', '021123456'),
  ('Depok', 'Depok', 'Jl. Margonda Raya No. 20, Depok', '021765432'),
  ('Bogor', 'Bogor', 'Jl. Pajajaran No. 30, Bogor', '0251838383'),
  ('Bandung', 'Bandung', 'Jl. Asia Afrika No. 40, Bandung', '022123789');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
VALUES
  (
    'Admin Jakarta Pusat',
    'admin.jakarta@ekspedisi.test',
    NULL,
    NOW(),
    @default_password,
    'admin',
    (SELECT `id` FROM `branches` WHERE `name` = 'Jakarta Pusat' AND `city` = 'Jakarta' LIMIT 1),
    NULL,
    TRUE
  ),
  (
    'Admin Depok',
    'admin.depok@ekspedisi.test',
    NULL,
    NOW(),
    @default_password,
    'admin',
    (SELECT `id` FROM `branches` WHERE `name` = 'Depok' AND `city` = 'Depok' LIMIT 1),
    NULL,
    TRUE
  ),
  (
    'Admin Bogor',
    'admin.bogor@ekspedisi.test',
    NULL,
    NOW(),
    @default_password,
    'admin',
    (SELECT `id` FROM `branches` WHERE `name` = 'Bogor' AND `city` = 'Bogor' LIMIT 1),
    NULL,
    TRUE
  ),
  (
    'Admin Bandung',
    'admin.bandung@ekspedisi.test',
    NULL,
    NOW(),
    @default_password,
    'admin',
    (SELECT `id` FROM `branches` WHERE `name` = 'Bandung' AND `city` = 'Bandung' LIMIT 1),
    NULL,
    TRUE
  ),
  ('Manager Global', 'manager@ekspedisi.test', NULL, NOW(), @default_password, 'manager', NULL, NULL, TRUE),
  (
    'Cashier Depok',
    'cashier.depok@ekspedisi.test',
    NULL,
    NOW(),
    @default_password,
    'cashier',
    (SELECT `id` FROM `branches` WHERE `name` = 'Depok' AND `city` = 'Depok' LIMIT 1),
    NULL,
    TRUE
  ),
  (
    'Courier 1 Depok',
    'courier1.depok@ekspedisi.test',
    '00201',
    NOW(),
    @default_password,
    'courier',
    (SELECT `id` FROM `branches` WHERE `name` = 'Depok' AND `city` = 'Depok' LIMIT 1),
    NULL,
    TRUE
  ),
  (
    'Courier 2 Depok',
    'courier2.depok@ekspedisi.test',
    '00202',
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
    NULL,
    NOW(),
    @default_password,
    'cashier',
    (SELECT `id` FROM `branches` WHERE `name` = 'Bogor' AND `city` = 'Bogor' LIMIT 1),
    NULL,
    TRUE
  ),
  (
    'Courier 1 Bogor',
    'courier1.bogor@ekspedisi.test',
    '00101',
    NOW(),
    @default_password,
    'courier',
    (SELECT `id` FROM `branches` WHERE `name` = 'Bogor' AND `city` = 'Bogor' LIMIT 1),
    NULL,
    TRUE
  ),
  (
    'Courier 2 Bogor',
    'courier2.bogor@ekspedisi.test',
    '00102',
    NOW(),
    @default_password,
    'courier',
    (SELECT `id` FROM `branches` WHERE `name` = 'Bogor' AND `city` = 'Bogor' LIMIT 1),
    NULL,
    TRUE
  ),
  (
    'Courier 1 Bandung',
    'courier1.bandung@ekspedisi.test',
    '00301',
    NOW(),
    @default_password,
    'courier',
    (SELECT `id` FROM `branches` WHERE `name` = 'Bandung' AND `city` = 'Bandung' LIMIT 1),
    NULL,
    TRUE
  ),
  (
    'Courier 2 Bandung',
    'courier2.bandung@ekspedisi.test',
    '00302',
    NOW(),
    @default_password,
    'courier',
    (SELECT `id` FROM `branches` WHERE `name` = 'Bandung' AND `city` = 'Bandung' LIMIT 1),
    NULL,
    TRUE
  ),
  (
    'Courier 1 Jakarta Pusat',
    'courier1.jakarta@ekspedisi.test',
    '00501',
    NOW(),
    @default_password,
    'courier',
    (SELECT `id` FROM `branches` WHERE `name` = 'Jakarta Pusat' AND `city` = 'Jakarta' LIMIT 1),
    NULL,
    TRUE
  ),
  (
    'Courier 2 Jakarta Pusat',
    'courier2.jakarta@ekspedisi.test',
    '00502',
    NOW(),
    @default_password,
    'courier',
    (SELECT `id` FROM `branches` WHERE `name` = 'Jakarta Pusat' AND `city` = 'Jakarta' LIMIT 1),
    NULL,
    TRUE
  );

-- Customer seed removed intentionally.
-- Customers are now expected to register through the real registration flow
-- and verify their email before login.

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
    (SELECT `id` FROM `users` WHERE `email` = 'courier1.depok@ekspedisi.test' AND `role` = 'courier' LIMIT 1)
  ),
  (
    'F 5678 BGR',
    'motor',
    (SELECT `id` FROM `users` WHERE `email` = 'courier1.bogor@ekspedisi.test' AND `role` = 'courier' LIMIT 1)
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
