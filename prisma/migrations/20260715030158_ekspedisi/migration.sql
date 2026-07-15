-- CreateTable
CREATE TABLE `branches` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `city` VARCHAR(255) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(25) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_branches_city`(`city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customer_notifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `customer_id` BIGINT UNSIGNED NOT NULL,
    `shipment_id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_customer_notifications_customer_id`(`customer_id`),
    INDEX `idx_customer_notifications_is_read`(`is_read`),
    INDEX `idx_customer_notifications_shipment_id`(`shipment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NULL,
    `email_verified_at` TIMESTAMP(0) NULL,
    `password` VARCHAR(255) NULL,
    `address` TEXT NOT NULL,
    `city` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(15) NOT NULL,
    `photo` VARCHAR(255) NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `remember_token` VARCHAR(100) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_customers_email`(`email`),
    INDEX `idx_customers_city`(`city`),
    INDEX `idx_customers_phone`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `shipment_id` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `payment_method` ENUM('cash', 'qris', 'gopay', 'shopeepay', 'bca_va', 'bni_va', 'bri_va', 'mandiri_va') NOT NULL,
    `payment_status` ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
    `payment_date` DATE NULL,
    `transaction_reference` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `expired_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `uq_payments_shipment_id`(`shipment_id`),
    INDEX `idx_payments_payment_method`(`payment_method`),
    INDEX `idx_payments_payment_status`(`payment_status`),
    INDEX `idx_payments_transaction_reference`(`transaction_reference`),
    INDEX `idx_payments_expired_at`(`expired_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rates` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `origin_city` VARCHAR(255) NOT NULL,
    `destination_city` VARCHAR(255) NOT NULL,
    `price_per_kg` DECIMAL(15, 2) NOT NULL,
    `estimated_days` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_rates_destination_city`(`destination_city`),
    INDEX `idx_rates_origin_city`(`origin_city`),
    UNIQUE INDEX `uq_rates_origin_destination`(`origin_city`, `destination_city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipment_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `shipment_id` BIGINT UNSIGNED NOT NULL,
    `item_name` VARCHAR(255) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `weight` DECIMAL(10, 2) NOT NULL,
    `photo` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_shipment_items_shipment_id`(`shipment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipment_trackings` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `shipment_id` BIGINT UNSIGNED NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('picked_up', 'in_transit', 'arrived_at_branch', 'out_for_delivery', 'delivered', 'cancelled') NOT NULL,
    `tracked_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_shipment_trackings_shipment_id`(`shipment_id`),
    INDEX `idx_shipment_trackings_status`(`status`),
    INDEX `idx_shipment_trackings_tracked_at`(`tracked_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `tracking_number` VARCHAR(255) NOT NULL,
    `sender_id` BIGINT UNSIGNED NOT NULL,
    `receiver_id` BIGINT UNSIGNED NOT NULL,
    `origin_branch_id` BIGINT UNSIGNED NOT NULL,
    `destination_branch_id` BIGINT UNSIGNED NOT NULL,
    `courier_id` BIGINT UNSIGNED NULL,
    `rate_id` BIGINT UNSIGNED NOT NULL,
    `handover_method` ENUM('drop_off', 'pickup') NOT NULL,
    `total_weight` DECIMAL(10, 2) NOT NULL,
    `total_price` DECIMAL(15, 2) NOT NULL,
    `status` ENUM('pending', 'picked_up', 'in_transit', 'arrived_at_branch', 'out_for_delivery', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    `shipment_date` DATE NOT NULL,
    `paid_at` TIMESTAMP(0) NULL,
    `delivered_at` TIMESTAMP(0) NULL,
    `photo` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by_user_id` BIGINT UNSIGNED NULL,
    `created_source` ENUM('customer', 'cashier') NOT NULL DEFAULT 'customer',

    UNIQUE INDEX `uq_shipments_tracking_number`(`tracking_number`),
    INDEX `idx_shipments_courier_id`(`courier_id`),
    INDEX `idx_shipments_destination_branch_id`(`destination_branch_id`),
    INDEX `idx_shipments_origin_branch_id`(`origin_branch_id`),
    INDEX `idx_shipments_rate_id`(`rate_id`),
    INDEX `idx_shipments_receiver_id`(`receiver_id`),
    INDEX `idx_shipments_sender_id`(`sender_id`),
    INDEX `idx_shipments_shipment_date`(`shipment_date`),
    INDEX `idx_shipments_status`(`status`),
    INDEX `idx_shipments_created_source`(`created_source`),
    INDEX `idx_shipments_created_by_user_id`(`created_by_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `courier_code` VARCHAR(5) NULL,
    `email_verified_at` TIMESTAMP(0) NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'cashier', 'courier', 'manager', 'owner') NOT NULL,
    `branch_id` BIGINT UNSIGNED NULL,
    `remember_token` VARCHAR(100) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_users_email`(`email`),
    UNIQUE INDEX `uq_users_courier_code`(`courier_code`),
    INDEX `idx_users_branch_id`(`branch_id`),
    INDEX `idx_users_role`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `plate_number` VARCHAR(255) NOT NULL,
    `type` ENUM('motor', 'mobil', 'truck') NOT NULL,
    `courier_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_vehicles_plate_number`(`plate_number`),
    INDEX `idx_vehicles_courier_id`(`courier_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `customer_notifications` ADD CONSTRAINT `fk_customer_notifications_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customer_notifications` ADD CONSTRAINT `fk_customer_notifications_shipment_id` FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `fk_payments_shipment_id` FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipment_items` ADD CONSTRAINT `fk_shipment_items_shipment_id` FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipment_trackings` ADD CONSTRAINT `fk_shipment_trackings_shipment_id` FOREIGN KEY (`shipment_id`) REFERENCES `shipments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `fk_shipments_courier_id` FOREIGN KEY (`courier_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `fk_shipments_destination_branch_id` FOREIGN KEY (`destination_branch_id`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `fk_shipments_origin_branch_id` FOREIGN KEY (`origin_branch_id`) REFERENCES `branches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `fk_shipments_rate_id` FOREIGN KEY (`rate_id`) REFERENCES `rates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `fk_shipments_receiver_id` FOREIGN KEY (`receiver_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `fk_shipments_sender_id` FOREIGN KEY (`sender_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `fk_users_branch_id` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `vehicles` ADD CONSTRAINT `fk_vehicles_courier_id` FOREIGN KEY (`courier_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
