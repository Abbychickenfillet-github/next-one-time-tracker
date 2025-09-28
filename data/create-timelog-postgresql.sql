-- PostgreSQL 完整資料庫結構腳本
-- 基於 prisma/schema.prisma 生成
-- 適用於 PostgreSQL 資料庫

-- ========================================
-- 1. User 使用者資料表
-- ========================================
CREATE TABLE IF NOT EXISTS "User" (
    "user_id" SERIAL PRIMARY KEY,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "phone" TEXT,
    "birthdate" TIMESTAMP(3),
    "gender" TEXT,
    "avatar" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "google_uid" TEXT UNIQUE,
    "line_uid" TEXT UNIQUE,
    "lineAccessToken" TEXT,
    "refreshToken" TEXT,
    "iat" TEXT,
    "exp" TEXT
);

-- ========================================
-- 2. Blog 部落格資料表
-- ========================================
CREATE TABLE IF NOT EXISTS "Blog" (
    "id" SERIAL PRIMARY KEY,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false
);

-- ========================================
-- 3. TimeLog 時間記錄主活動資料表
-- ========================================
CREATE TABLE IF NOT EXISTS "TimeLog" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "user_id" INTEGER,
    CONSTRAINT "TimeLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ========================================
-- 4. Step 步驟資料表
-- ========================================
CREATE TABLE IF NOT EXISTS "Step" (
    "id" SERIAL PRIMARY KEY,
    "time_log_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    CONSTRAINT "Step_time_log_id_fkey" FOREIGN KEY ("time_log_id") REFERENCES "TimeLog"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Step_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ========================================
-- 5. Brand 品牌資料表
-- ========================================
CREATE TABLE IF NOT EXISTS "Brand" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "img" TEXT,
    "info" TEXT NOT NULL
);

-- ========================================
-- 6. Category 分類資料表
-- ========================================
CREATE TABLE IF NOT EXISTS "Category" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "parent_id" INTEGER
);

-- ========================================
-- 7. Product 商品資料表
-- ========================================
CREATE TABLE IF NOT EXISTS "Product" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sn" TEXT NOT NULL UNIQUE,
    "photos" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL DEFAULT 0,
    "info" TEXT NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    CONSTRAINT "Product_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ========================================
-- 8. Favorite 我的最愛資料表 (複合主鍵)
-- ========================================
CREATE TABLE IF NOT EXISTS "Favorite" (
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("user_id", "product_id"),
    CONSTRAINT "Favorite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Favorite_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ========================================
-- 9. Otp 一次性密碼資料表
-- ========================================
CREATE TABLE IF NOT EXISTS "Otp" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "token" TEXT NOT NULL,
    "hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expired_at" TIMESTAMP(3) NOT NULL
);

-- ========================================
-- 建立索引以提升查詢效能
-- ========================================

-- User 索引
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
CREATE INDEX IF NOT EXISTS "idx_user_google_uid" ON "User"("google_uid");
CREATE INDEX IF NOT EXISTS "idx_user_line_uid" ON "User"("line_uid");

-- TimeLog 索引
CREATE INDEX IF NOT EXISTS "idx_timelog_user_id" ON "TimeLog"("user_id");
CREATE INDEX IF NOT EXISTS "idx_timelog_start_time" ON "TimeLog"("start_time");

-- Step 索引
CREATE INDEX IF NOT EXISTS "idx_step_time_log_id" ON "Step"("time_log_id");
CREATE INDEX IF NOT EXISTS "idx_step_user_id" ON "Step"("user_id");
CREATE INDEX IF NOT EXISTS "idx_step_start_time" ON "Step"("start_time");

-- Product 索引
CREATE INDEX IF NOT EXISTS "idx_product_brand_id" ON "Product"("brand_id");
CREATE INDEX IF NOT EXISTS "idx_product_category_id" ON "Product"("category_id");
CREATE INDEX IF NOT EXISTS "idx_product_sn" ON "Product"("sn");

-- Favorite 索引
CREATE INDEX IF NOT EXISTS "idx_favorite_user_id" ON "Favorite"("user_id");
CREATE INDEX IF NOT EXISTS "idx_favorite_product_id" ON "Favorite"("product_id");

-- Otp 索引
CREATE INDEX IF NOT EXISTS "idx_otp_email" ON "Otp"("email");
CREATE INDEX IF NOT EXISTS "idx_otp_expired_at" ON "Otp"("expired_at");

-- Blog 索引
CREATE INDEX IF NOT EXISTS "idx_blog_published" ON "Blog"("published");
CREATE INDEX IF NOT EXISTS "idx_blog_created_at" ON "Blog"("created_at");

-- ========================================
-- 插入範例資料
-- ========================================

-- 插入範例使用者
INSERT INTO "User" ("name", "password", "email", "phone", "level") VALUES
('測試使用者', '$2b$10$example_hash', 'test@example.com', '0912345678', 1),
('管理員', '$2b$10$admin_hash', 'admin@example.com', '0987654321', 99);

-- 插入範例品牌
INSERT INTO "Brand" ("name", "info") VALUES
('Apple', '蘋果公司'),
('Samsung', '三星電子'),
('Sony', '索尼公司');

-- 插入範例分類
INSERT INTO "Category" ("name", "parent_id") VALUES
('電子產品', NULL),
('手機', 1),
('筆記型電腦', 1),
('配件', 1);

-- 插入範例商品
INSERT INTO "Product" ("name", "sn", "stock", "price", "info", "brand_id", "category_id") VALUES
('iPhone 15', 'IPHONE15-001', 10, 35900, '最新款 iPhone', 1, 2),
('Galaxy S24', 'GALAXY24-001', 8, 32900, '最新款 Galaxy', 2, 2),
('MacBook Pro', 'MACBOOK-001', 5, 59900, '專業筆記型電腦', 1, 3);

-- 插入範例時間記錄
INSERT INTO "TimeLog" ("title", "start_time", "end_time", "user_id") VALUES
('專案開發', '2025-01-18 09:00:00', '2025-01-18 17:00:00', 1),
('學習 React', '2025-01-19 10:00:00', '2025-01-19 12:00:00', 1);

-- 插入範例步驟
INSERT INTO "Step" ("time_log_id", "user_id", "title", "description", "start_time", "end_time") VALUES
(1, 1, '前端開發', 'React 元件開發', '2025-01-18 09:00:00', '2025-01-18 12:00:00'),
(1, 1, '後端開發', 'API 路由開發', '2025-01-18 13:00:00', '2025-01-18 17:00:00'),
(1, 1, '測試階段', '功能測試與除錯', '2025-01-18 17:00:00', '2025-01-18 18:00:00'),
(2, 1, '學習 useState', '學習 useState Hook', '2025-01-19 10:00:00', '2025-01-19 11:00:00'),
(2, 1, '學習 useEffect', '學習 useEffect Hook', '2025-01-19 11:00:00', '2025-01-19 12:00:00');

-- 插入範例我的最愛
INSERT INTO "Favorite" ("user_id", "product_id") VALUES
(1, 1),
(1, 2);

-- 插入範例部落格
INSERT INTO "Blog" ("title", "content", "published") VALUES
('歡迎使用 TimeLog 系統', '這是一個時間記錄管理系統', true),
('React 開發指南', '學習 React 的最佳實踐', false);

-- ========================================
-- 查詢範例
-- ========================================

-- 查詢所有主活動
SELECT * FROM "TimeLog" ORDER BY "start_time";

-- 查詢特定活動的所有步驟
SELECT * FROM "Step" WHERE "time_log_id" = 1 ORDER BY "start_time";

-- 查詢活動總時長 (使用 EPOCH 計算小時)
SELECT
    t."title",
    t."start_time",
    t."end_time",
    EXTRACT(EPOCH FROM (t."end_time" - t."start_time"))/3600 AS "duration_hours"
FROM "TimeLog" t
WHERE t."end_time" IS NOT NULL;

-- 查詢活動及其步驟 (JOIN 查詢)
SELECT
    t."title" AS "activity_title",
    s."title" AS "step_title",
    s."start_time" AS "step_start",
    s."end_time" AS "step_end"
FROM "TimeLog" t
LEFT JOIN "Step" s ON t."id" = s."time_log_id"
ORDER BY t."start_time", s."start_time";

-- 查詢使用者及其時間記錄
SELECT
    u."name" AS "user_name",
    u."email",
    t."title" AS "activity_title",
    t."start_time",
    t."end_time"
FROM "User" u
LEFT JOIN "TimeLog" t ON u."user_id" = t."user_id"
ORDER BY u."user_id", t."start_time";

-- 查詢商品及其品牌和分類
SELECT
    p."name" AS "product_name",
    p."price",
    p."stock",
    b."name" AS "brand_name",
    c."name" AS "category_name"
FROM "Product" p
LEFT JOIN "Brand" b ON p."brand_id" = b."id"
LEFT JOIN "Category" c ON p."category_id" = c."id"
ORDER BY p."id";

-- 查詢使用者的我的最愛商品
SELECT
    u."name" AS "user_name",
    p."name" AS "product_name",
    p."price",
    b."name" AS "brand_name"
FROM "Favorite" f
JOIN "User" u ON f."user_id" = u."user_id"
JOIN "Product" p ON f."product_id" = p."id"
LEFT JOIN "Brand" b ON p."brand_id" = b."id"
ORDER BY u."user_id", p."name";
