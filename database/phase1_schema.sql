CREATE DATABASE IF NOT EXISTS `ekspedisi`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `ekspedisi`;

CREATE TABLE IF NOT EXISTS `branches` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key cabang ekspedisi',
  `name` VARCHAR(255) NOT NULL COMMENT 'Nama cabang ekspedisi',
  `city` VARCHAR(255) NOT NULL COMMENT 'Kota cabang ekspedisi',
  `address` VARCHAR(255) NOT NULL COMMENT 'Alamat lengkap cabang',
  `phone` VARCHAR(25) NOT NULL COMMENT 'Nomor telepon cabang',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu data dibuat',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu data terakhir diperbarui',
  CONSTRAINT `pk_branches` PRIMARY KEY (`id`),
  INDEX `idx_branches_city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Menyimpan data cabang ekspedisi';

CREATE TABLE IF NOT EXISTS `customers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key customer',
  `name` VARCHAR(50) NOT NULL COMMENT 'Nama customer',
  `email` VARCHAR(255) NOT NULL COMMENT 'Email customer untuk login dan verifikasi',
  `email_verified_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Waktu email customer diverifikasi',
  `password` VARCHAR(255) NOT NULL COMMENT 'Password customer yang sudah di-hash',
  `address` TEXT NOT NULL COMMENT 'Alamat customer',
  `city` VARCHAR(255) NOT NULL COMMENT 'Kota customer',
  `phone` VARCHAR(15) NOT NULL COMMENT 'Nomor telepon customer',
  `photo` VARCHAR(255) NULL DEFAULT NULL COMMENT 'URL foto profil customer',
  `is_verified` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Status verifikasi email customer',
  `remember_token` VARCHAR(100) NULL DEFAULT NULL COMMENT 'Hash refresh token customer',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu data dibuat',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu data terakhir diperbarui',
  CONSTRAINT `pk_customers` PRIMARY KEY (`id`),
  CONSTRAINT `uq_customers_email` UNIQUE (`email`),
  INDEX `idx_customers_city` (`city`),
  INDEX `idx_customers_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Menyimpan data customer pengirim dan penerima';

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key staff internal',
  `name` VARCHAR(255) NOT NULL COMMENT 'Nama staff internal',
  `email` VARCHAR(255) NOT NULL COMMENT 'Email staff untuk login',
  `email_verified_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Waktu email staff diverifikasi',
  `password` VARCHAR(255) NOT NULL COMMENT 'Password staff yang sudah di-hash',
  `role` ENUM('admin','cashier','courier','manager') NOT NULL COMMENT 'Role staff internal',
  `branch_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Cabang staff; wajib untuk cashier dan courier',
  `remember_token` VARCHAR(100) NULL DEFAULT NULL COMMENT 'Token remember login',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Status aktif staff',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu data dibuat',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu data terakhir diperbarui',
  CONSTRAINT `pk_users` PRIMARY KEY (`id`),
  CONSTRAINT `uq_users_email` UNIQUE (`email`),
  CONSTRAINT `fk_users_branch_id` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `chk_users_branch_required_for_branch_roles` CHECK (`role` IN ('admin','manager') OR `branch_id` IS NOT NULL),
  INDEX `idx_users_branch_id` (`branch_id`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Menyimpan data staff internal';

CREATE TABLE IF NOT EXISTS `rates` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key tarif pengiriman',
  `origin_city` VARCHAR(255) NOT NULL COMMENT 'Kota asal pengiriman',
  `destination_city` VARCHAR(255) NOT NULL COMMENT 'Kota tujuan pengiriman',
  `price_per_kg` DECIMAL(15,2) NOT NULL COMMENT 'Harga pengiriman per kilogram',
  `estimated_days` INT NOT NULL COMMENT 'Estimasi lama pengiriman dalam hari',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu data dibuat',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu data terakhir diperbarui',
  CONSTRAINT `pk_rates` PRIMARY KEY (`id`),
  CONSTRAINT `uq_rates_origin_destination` UNIQUE (`origin_city`, `destination_city`),
  CONSTRAINT `chk_rates_price_per_kg_positive` CHECK (`price_per_kg` > 0),
  CONSTRAINT `chk_rates_estimated_days_positive` CHECK (`estimated_days` > 0),
  INDEX `idx_rates_origin_city` (`origin_city`),
  INDEX `idx_rates_destination_city` (`destination_city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tarif pengiriman';

CREATE TABLE IF NOT EXISTS `vehicles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key kendaraan kurir',
  `plate_number` VARCHAR(255) NOT NULL COMMENT 'Nomor plat kendaraan',
  `type` ENUM('motor','mobil','truck') NOT NULL COMMENT 'Jenis kendaraan kurir',
  `courier_id` BIGINT UNSIGNED NOT NULL COMMENT 'Staff courier pemilik atau pengguna kendaraan',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu data dibuat',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu data terakhir diperbarui',
  CONSTRAINT `pk_vehicles` PRIMARY KEY (`id`),
  CONSTRAINT `uq_vehicles_plate_number` UNIQUE (`plate_number`),
  CONSTRAINT `fk_vehicles_courier_id` FOREIGN KEY (`courier_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  INDEX `idx_vehicles_courier_id` (`courier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Kendaraan kurir';

CREATE TABLE IF NOT EXISTS `shipments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key transaksi pengiriman',
  `tracking_number` VARCHAR(255) NOT NULL COMMENT 'Nomor resi pengiriman',
  `sender_id` BIGINT UNSIGNED NOT NULL COMMENT 'Customer sebagai pengirim',
  `receiver_id` BIGINT UNSIGNED NOT NULL COMMENT 'Customer sebagai penerima',
  `origin_branch_id` BIGINT UNSIGNED NOT NULL COMMENT 'Cabang asal pengiriman',
  `destination_branch_id` BIGINT UNSIGNED NOT NULL COMMENT 'Cabang tujuan pengiriman',
  `courier_id` BIGINT UNSIGNED NULL DEFAULT NULL COMMENT 'Staff courier yang menangani pengiriman',
  `rate_id` BIGINT UNSIGNED NOT NULL COMMENT 'Tarif yang digunakan pada pengiriman',
  `handover_method` ENUM('drop_off','pickup') NOT NULL COMMENT 'Metode serah terima barang',
  `total_weight` DECIMAL(10,2) NOT NULL COMMENT 'Total berat barang dalam kilogram',
  `total_price` DECIMAL(15,2) NOT NULL COMMENT 'Total biaya pengiriman',
  `status` ENUM('pending','picked_up','in_transit','arrived_at_branch','out_for_delivery','delivered','cancelled') NOT NULL DEFAULT 'pending' COMMENT 'Status pengiriman',
  `shipment_date` DATE NOT NULL COMMENT 'Tanggal shipment dibuat',
  `paid_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Waktu pembayaran lunas',
  `delivered_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Waktu barang diterima',
  `photo` VARCHAR(255) NULL DEFAULT NULL COMMENT 'URL foto bukti atau barang shipment',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu data dibuat',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu data terakhir diperbarui',
  CONSTRAINT `pk_shipments` PRIMARY KEY (`id`),
  CONSTRAINT `uq_shipments_tracking_number` UNIQUE (`tracking_number`),
  CONSTRAINT `fk_shipments_sender_id` FOREIGN KEY (`sender_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_shipments_receiver_id` FOREIGN KEY (`receiver_id`) REFERENCES `customers` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_shipments_origin_branch_id` FOREIGN KEY (`origin_branch_id`) REFERENCES `branches` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_shipments_destination_branch_id` FOREIGN KEY (`destination_branch_id`) REFERENCES `branches` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_shipments_courier_id` FOREIGN KEY (`courier_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT `fk_shipments_rate_id` FOREIGN KEY (`rate_id`) REFERENCES `rates` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `chk_shipments_total_weight_positive` CHECK (`total_weight` > 0),
  CONSTRAINT `chk_shipments_total_price_not_negative` CHECK (`total_price` >= 0),
  INDEX `idx_shipments_sender_id` (`sender_id`),
  INDEX `idx_shipments_receiver_id` (`receiver_id`),
  INDEX `idx_shipments_origin_branch_id` (`origin_branch_id`),
  INDEX `idx_shipments_destination_branch_id` (`destination_branch_id`),
  INDEX `idx_shipments_courier_id` (`courier_id`),
  INDEX `idx_shipments_rate_id` (`rate_id`),
  INDEX `idx_shipments_status` (`status`),
  INDEX `idx_shipments_shipment_date` (`shipment_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Transaksi pengiriman';

CREATE TABLE IF NOT EXISTS `shipment_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key item shipment',
  `shipment_id` BIGINT UNSIGNED NOT NULL COMMENT 'Shipment pemilik item',
  `item_name` VARCHAR(255) NOT NULL COMMENT 'Nama barang',
  `quantity` INT NOT NULL COMMENT 'Jumlah barang',
  `weight` DECIMAL(10,2) NOT NULL COMMENT 'Berat barang dalam kilogram',
  `photo` VARCHAR(255) NULL DEFAULT NULL COMMENT 'URL foto barang yang diupload customer',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu data dibuat',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu data terakhir diperbarui',
  CONSTRAINT `pk_shipment_items` PRIMARY KEY (`id`),
  CONSTRAINT `fk_shipment_items_shipment_id` FOREIGN KEY (`shipment_id`) REFERENCES `shipments` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `chk_shipment_items_quantity_positive` CHECK (`quantity` > 0),
  CONSTRAINT `chk_shipment_items_weight_positive` CHECK (`weight` > 0),
  INDEX `idx_shipment_items_shipment_id` (`shipment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Daftar barang dalam shipment';

CREATE TABLE IF NOT EXISTS `payments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key pembayaran',
  `shipment_id` BIGINT UNSIGNED NOT NULL COMMENT 'Shipment yang dibayar',
  `amount` DECIMAL(15,2) NOT NULL COMMENT 'Nominal pembayaran',
  `payment_method` ENUM('cash','qris','gopay','shopeepay','bca_va','bni_va','bri_va','mandiri_va') NOT NULL COMMENT 'Metode pembayaran',
  `payment_status` ENUM('pending','paid','failed') NOT NULL DEFAULT 'pending' COMMENT 'Status pembayaran',
  `payment_date` DATE NULL DEFAULT NULL COMMENT 'Tanggal pembayaran',
  `transaction_reference` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Referensi transaksi cash atau Midtrans',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu data dibuat',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu data terakhir diperbarui',
  CONSTRAINT `pk_payments` PRIMARY KEY (`id`),
  CONSTRAINT `uq_payments_shipment_id` UNIQUE (`shipment_id`),
  CONSTRAINT `fk_payments_shipment_id` FOREIGN KEY (`shipment_id`) REFERENCES `shipments` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `chk_payments_amount_not_negative` CHECK (`amount` >= 0),
  INDEX `idx_payments_payment_method` (`payment_method`),
  INDEX `idx_payments_payment_status` (`payment_status`),
  INDEX `idx_payments_transaction_reference` (`transaction_reference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Data pembayaran shipment';

CREATE TABLE IF NOT EXISTS `shipment_trackings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary key tracking shipment',
  `shipment_id` BIGINT UNSIGNED NOT NULL COMMENT 'Shipment yang dilacak',
  `location` VARCHAR(255) NOT NULL COMMENT 'Lokasi status tracking',
  `description` TEXT NOT NULL COMMENT 'Deskripsi riwayat perjalanan shipment',
  `status` ENUM('picked_up','in_transit','arrived_at_branch','out_for_delivery','delivered','cancelled') NOT NULL COMMENT 'Status tracking shipment',
  `tracked_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu status tracking dicatat',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Waktu data dibuat',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Waktu data terakhir diperbarui',
  CONSTRAINT `pk_shipment_trackings` PRIMARY KEY (`id`),
  CONSTRAINT `fk_shipment_trackings_shipment_id` FOREIGN KEY (`shipment_id`) REFERENCES `shipments` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
  INDEX `idx_shipment_trackings_shipment_id` (`shipment_id`),
  INDEX `idx_shipment_trackings_status` (`status`),
  INDEX `idx_shipment_trackings_tracked_at` (`tracked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Riwayat perjalanan shipment';
