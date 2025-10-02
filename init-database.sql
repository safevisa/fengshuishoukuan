-- 风水摆件电商系统数据库初始化脚本
-- 创建时间: 2025-09-28
-- 版本: 1.0

-- 创建数据库
CREATE DATABASE IF NOT EXISTS fengshui_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fengshui_ecommerce;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role ENUM('admin', 'user') DEFAULT 'user',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    balance DECIMAL(10,2) DEFAULT 0.00,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    total_withdrawals DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 支付链接表
CREATE TABLE IF NOT EXISTS payment_links (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active', -- 支持更长的状态值，如 'Order Timeout'
    payment_url TEXT,
    payment_method VARCHAR(50) DEFAULT 'jkopay',
    transaction_id VARCHAR(255),
    -- 新增字段
    product_image TEXT NULL,
    max_uses INT DEFAULT 1,
    used_count INT DEFAULT 0,
    is_single_use BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 支持更长的状态值
    payment_link_id VARCHAR(50),
    payment_method VARCHAR(50) DEFAULT 'jkopay',
    transaction_id VARCHAR(255),
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_link_id) REFERENCES payment_links(id) ON DELETE SET NULL
);

-- 支付记录表
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 支持更长的状态值
    payment_method VARCHAR(50) DEFAULT 'jkopay',
    transaction_id VARCHAR(255),
    currency_code VARCHAR(10) DEFAULT 'TWD',
    resp_code VARCHAR(10),
    resp_msg VARCHAR(255),
    mer_no VARCHAR(50),
    ter_no VARCHAR(50),
    trans_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 提现记录表
CREATE TABLE IF NOT EXISTS withdrawals (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 支持更长的状态值
    bank_account TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_payment_links_user_id ON payment_links(user_id);
CREATE INDEX idx_payment_links_status ON payment_links(status);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_link_id ON orders(payment_link_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);

-- 插入默认管理员用户
INSERT IGNORE INTO users (id, email, name, password, role, status, created_at, updated_at) VALUES
('admin-001', 'admin@jinshiying.com', '系统管理员', '$2b$10$rQZ8K9vQZ8K9vQZ8K9vQZ8K9vQZ8K9vQZ8K9vQZ8K9vQZ8K9vQZ8K9vQ', 'admin', 'active', NOW(), NOW());

-- 显示表结构
SHOW TABLES;
DESCRIBE users;
DESCRIBE payment_links;
DESCRIBE orders;
DESCRIBE payments;
DESCRIBE withdrawals;