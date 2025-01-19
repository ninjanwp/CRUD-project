-- First drop all junction/child tables in correct order
DROP TABLE IF EXISTS `wishlist_item`;
DROP TABLE IF EXISTS `wishlist`;
DROP TABLE IF EXISTS `review`;
DROP TABLE IF EXISTS `order_item`;
DROP TABLE IF EXISTS `cart_item`;
DROP TABLE IF EXISTS `product_image`;
DROP TABLE IF EXISTS `product_category`;
DROP TABLE IF EXISTS `inventory_transaction`;
DROP TABLE IF EXISTS `variant_attribute_value`;
DROP TABLE IF EXISTS `product_variant`;
DROP TABLE IF EXISTS `attribute_value`;
DROP TABLE IF EXISTS `attribute`;
DROP TABLE IF EXISTS `attribute_group`;
DROP TABLE IF EXISTS `discount_use`;
DROP TABLE IF EXISTS `order`;
DROP TABLE IF EXISTS `cart`;
DROP TABLE IF EXISTS `customer_profile`;
DROP TABLE IF EXISTS `product`;
DROP TABLE IF EXISTS `category`;
DROP TABLE IF EXISTS `manufacturer`;
DROP TABLE IF EXISTS `tax_class`;
DROP TABLE IF EXISTS `discount`;
DROP TABLE IF EXISTS `user`;

-- Create base tables
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100),
  `last_name` varchar(100),
  `role` enum('admin', 'customer') DEFAULT 'customer',
  `status` enum('active', 'inactive') DEFAULT 'active',
  `email_verified` boolean DEFAULT false,
  `reset_token` varchar(255),
  `reset_token_expires` timestamp NULL,
  `last_login` timestamp NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `customer_profile` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `phone` varchar(50),
  `address_line1` varchar(255),
  `address_line2` varchar(255),
  `city` varchar(100),
  `state` varchar(100),
  `postal_code` varchar(20),
  `country` varchar(100),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tax_class` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `rate` decimal(5,2) NOT NULL,
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `manufacturer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL UNIQUE,
  `contact_name` varchar(100),
  `email` varchar(255),
  `phone` varchar(50),
  `website` varchar(255),
  `address` text,
  `is_active` boolean DEFAULT true,
  `notes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `description` text,
  `display_order` int DEFAULT 0,
  `is_active` boolean DEFAULT true,
  `meta_title` varchar(255),
  `meta_description` text,
  `image_url` varchar(2048),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`parent_id`) REFERENCES `category`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `manufacturer_id` int,
  `tax_class_id` int,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL DEFAULT 0,
  `stock` int NOT NULL DEFAULT 0,
  `sku` varchar(64) UNIQUE,
  `is_active` boolean DEFAULT true,
  `is_featured` boolean DEFAULT false,
  `is_digital` boolean DEFAULT false,
  `cost_price` decimal(10,2),
  `compare_at_price` decimal(10,2),
  `weight` decimal(10,2),
  `width` decimal(10,2),
  `height` decimal(10,2),
  `length` decimal(10,2),
  `low_stock_threshold` int,
  `meta_title` varchar(255),
  `meta_description` text,
  `warranty_info` text,
  `return_policy` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`manufacturer_id`) REFERENCES `manufacturer`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`tax_class_id`) REFERENCES `tax_class`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_image` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `url` varchar(2048) NOT NULL,
  `alt_text` varchar(255),
  `display_order` int DEFAULT 0,
  `is_primary` boolean DEFAULT false,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `product_category` (
  `product_id` int NOT NULL,
  `category_id` int NOT NULL,
  PRIMARY KEY (`product_id`, `category_id`),
  FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `status` ENUM('active', 'converted', 'abandoned') DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cart_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT 1,
  `price_at_time` decimal(10,2) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`cart_id`) REFERENCES `cart`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `status` ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_address` text NOT NULL,
  `billing_address` text NOT NULL,
  `payment_method` varchar(50),
  `shipping_method` varchar(50),
  `tracking_number` varchar(100),
  `notes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order_item` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price_at_time` decimal(10,2) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `inventory_transaction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `type` ENUM('purchase', 'sale', 'adjustment', 'return') NOT NULL,
  `quantity` int NOT NULL,
  `reference_id` varchar(100),
  `notes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `discount` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) UNIQUE,
  `type` ENUM('percentage', 'fixed_amount', 'buy_x_get_y') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `min_purchase` decimal(10,2),
  `max_discount` decimal(10,2),
  `starts_at` timestamp NULL,
  `ends_at` timestamp NULL,
  `usage_limit` int,
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `discount_use` (
  `id` int NOT NULL AUTO_INCREMENT,
  `discount_id` int NOT NULL,
  `user_id` int NOT NULL,
  `order_id` int NOT NULL,
  `used_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`discount_id`) REFERENCES `discount`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `review` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `rating` int NOT NULL,
  `title` varchar(255),
  `content` text,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `wishlist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `wishlist_item` (
  `wishlist_id` int NOT NULL,
  `product_id` int NOT NULL,
  `added_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`wishlist_id`, `product_id`),
  FOREIGN KEY (`wishlist_id`) REFERENCES `wishlist`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for performance
CREATE INDEX idx_product_active ON `product`(is_active);
CREATE INDEX idx_product_featured ON `product`(is_featured);
CREATE INDEX idx_category_active ON `category`(is_active);
CREATE INDEX idx_category_parent ON `category`(parent_id);
CREATE INDEX idx_order_user ON `order`(user_id);
CREATE INDEX idx_order_status ON `order`(status);
CREATE INDEX idx_cart_user ON `cart`(user_id);
CREATE INDEX idx_cart_status ON `cart`(status);
CREATE INDEX idx_discount_code ON `discount`(code);
CREATE INDEX idx_discount_active ON `discount`(is_active);