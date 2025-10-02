-- 更新数据库结构，添加新字段
-- 为 payment_links 表添加新字段

-- 检查并添加 product_image 字段
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'payment_links' 
   AND table_schema = 'fengshui_ecommerce' 
   AND column_name = 'product_image') = 0,
  'ALTER TABLE payment_links ADD COLUMN product_image TEXT NULL',
  'SELECT "product_image column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 max_uses 字段
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'payment_links' 
   AND table_schema = 'fengshui_ecommerce' 
   AND column_name = 'max_uses') = 0,
  'ALTER TABLE payment_links ADD COLUMN max_uses INT DEFAULT 1',
  'SELECT "max_uses column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 used_count 字段
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'payment_links' 
   AND table_schema = 'fengshui_ecommerce' 
   AND column_name = 'used_count') = 0,
  'ALTER TABLE payment_links ADD COLUMN used_count INT DEFAULT 0',
  'SELECT "used_count column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 检查并添加 is_single_use 字段
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'payment_links' 
   AND table_schema = 'fengshui_ecommerce' 
   AND column_name = 'is_single_use') = 0,
  'ALTER TABLE payment_links ADD COLUMN is_single_use BOOLEAN DEFAULT TRUE',
  'SELECT "is_single_use column already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 更新现有记录，设置默认值
UPDATE payment_links 
SET 
  max_uses = 1,
  used_count = 0,
  is_single_use = TRUE
WHERE max_uses IS NULL OR used_count IS NULL OR is_single_use IS NULL;

-- 显示更新结果
SELECT 
  COUNT(*) as total_links,
  COUNT(CASE WHEN product_image IS NOT NULL THEN 1 END) as links_with_images,
  AVG(max_uses) as avg_max_uses,
  AVG(used_count) as avg_used_count,
  COUNT(CASE WHEN is_single_use = TRUE THEN 1 END) as single_use_links
FROM payment_links;
