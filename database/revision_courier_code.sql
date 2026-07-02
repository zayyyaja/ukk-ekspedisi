USE `ekspedisi`;

START TRANSACTION;

ALTER TABLE `users`
  ADD COLUMN `courier_code` VARCHAR(5) NULL DEFAULT NULL COMMENT 'Kode bisnis kurir dengan format kode cabang dan nomor urut' AFTER `email`,
  ADD UNIQUE KEY `uq_users_courier_code` (`courier_code`);

UPDATE `users`
SET `courier_code` = CASE
  WHEN `email` = 'courier1.bogor@ekspedisi.test' OR `email` = 'courier.bogor@ekspedisi.test' THEN '00101'
  WHEN `email` = 'courier2.bogor@ekspedisi.test' THEN '00102'
  WHEN `email` = 'courier1.depok@ekspedisi.test' OR `email` = 'courier.depok@ekspedisi.test' THEN '00201'
  WHEN `email` = 'courier2.depok@ekspedisi.test' THEN '00202'
  WHEN `email` = 'courier1.bandung@ekspedisi.test' THEN '00301'
  WHEN `email` = 'courier2.bandung@ekspedisi.test' THEN '00302'
  ELSE `courier_code`
END
WHERE `role` = 'courier';

UPDATE `users`
SET `name` = 'Courier 1 Bogor',
    `email` = 'courier1.bogor@ekspedisi.test'
WHERE `email` = 'courier.bogor@ekspedisi.test'
  AND `role` = 'courier';

UPDATE `users`
SET `name` = 'Courier 1 Depok',
    `email` = 'courier1.depok@ekspedisi.test'
WHERE `email` = 'courier.depok@ekspedisi.test'
  AND `role` = 'courier';

SET @default_password = '$2y$10$E6om0xePps0F90THRIh2YutQm5T3yT15kAuEVh8Nycxpt83QhV3TW';

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Courier 2 Bogor', 'courier2.bogor@ekspedisi.test', '00102', NOW(), @default_password, 'courier', `id`, NULL, TRUE
FROM `branches`
WHERE `name` = 'Bogor' AND `city` = 'Bogor'
  AND NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'courier2.bogor@ekspedisi.test');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Courier 2 Depok', 'courier2.depok@ekspedisi.test', '00202', NOW(), @default_password, 'courier', `id`, NULL, TRUE
FROM `branches`
WHERE `name` = 'Depok' AND `city` = 'Depok'
  AND NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'courier2.depok@ekspedisi.test');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Courier 1 Bandung', 'courier1.bandung@ekspedisi.test', '00301', NOW(), @default_password, 'courier', `id`, NULL, TRUE
FROM `branches`
WHERE `name` = 'Bandung' AND `city` = 'Bandung'
  AND NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'courier1.bandung@ekspedisi.test');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Courier 2 Bandung', 'courier2.bandung@ekspedisi.test', '00302', NOW(), @default_password, 'courier', `id`, NULL, TRUE
FROM `branches`
WHERE `name` = 'Bandung' AND `city` = 'Bandung'
  AND NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'courier2.bandung@ekspedisi.test');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Courier 1 Jakarta Pusat', 'courier1.jakarta@ekspedisi.test', '00501', NOW(), @default_password, 'courier', `id`, NULL, TRUE
FROM `branches`
WHERE `name` = 'Jakarta Pusat' AND `city` = 'Jakarta'
  AND NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'courier1.jakarta@ekspedisi.test');

INSERT INTO `users` (`name`, `email`, `courier_code`, `email_verified_at`, `password`, `role`, `branch_id`, `remember_token`, `is_active`)
SELECT 'Courier 2 Jakarta Pusat', 'courier2.jakarta@ekspedisi.test', '00502', NOW(), @default_password, 'courier', `id`, NULL, TRUE
FROM `branches`
WHERE `name` = 'Jakarta Pusat' AND `city` = 'Jakarta'
  AND NOT EXISTS (SELECT 1 FROM `users` WHERE `email` = 'courier2.jakarta@ekspedisi.test');

COMMIT;
