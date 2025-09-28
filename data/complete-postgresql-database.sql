-- ========================================
-- PostgreSQL 完整資料庫結構腳本
-- 基於 prisma/schema.prisma 生成
-- 適用於 PostgreSQL 資料庫
-- 無任何 MySQL 殘留語法
-- ========================================

-- 清理現有資料表 (如果存在)
DROP TABLE IF EXISTS "Favorite" CASCADE;
DROP TABLE IF EXISTS "Step" CASCADE;
DROP TABLE IF EXISTS "TimeLog" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "Brand" CASCADE;
DROP TABLE IF EXISTS "Otp" CASCADE;
DROP TABLE IF EXISTS "Blog" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- ========================================
-- 1. User 使用者資料表
-- ========================================
CREATE TABLE "User" (
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
CREATE TABLE "Blog" (
    "id" SERIAL PRIMARY KEY,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false
);

-- ========================================
-- 3. TimeLog 時間記錄主活動資料表
-- ========================================
CREATE TABLE "TimeLog" (
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
CREATE TABLE "Step" (
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
CREATE TABLE "Brand" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "img" TEXT,
    "info" TEXT NOT NULL
);

-- ========================================
-- 6. Category 分類資料表
-- ========================================
CREATE TABLE "Category" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "parent_id" INTEGER
);

-- ========================================
-- 7. Product 商品資料表
-- ========================================
CREATE TABLE "Product" (
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
CREATE TABLE "Favorite" (
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("user_id", "product_id"),
    CONSTRAINT "Favorite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Favorite_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ========================================
-- 9. Otp 一次性密碼資料表
-- ========================================
CREATE TABLE "Otp" (
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
CREATE INDEX "idx_user_email" ON "User"("email");
CREATE INDEX "idx_user_google_uid" ON "User"("google_uid");
CREATE INDEX "idx_user_line_uid" ON "User"("line_uid");

-- TimeLog 索引
CREATE INDEX "idx_timelog_user_id" ON "TimeLog"("user_id");
CREATE INDEX "idx_timelog_start_time" ON "TimeLog"("start_time");

-- Step 索引
CREATE INDEX "idx_step_time_log_id" ON "Step"("time_log_id");
CREATE INDEX "idx_step_user_id" ON "Step"("user_id");
CREATE INDEX "idx_step_start_time" ON "Step"("start_time");

-- Product 索引
CREATE INDEX "idx_product_brand_id" ON "Product"("brand_id");
CREATE INDEX "idx_product_category_id" ON "Product"("category_id");
CREATE INDEX "idx_product_sn" ON "Product"("sn");

-- Favorite 索引
CREATE INDEX "idx_favorite_user_id" ON "Favorite"("user_id");
CREATE INDEX "idx_favorite_product_id" ON "Favorite"("product_id");

-- Otp 索引
CREATE INDEX "idx_otp_email" ON "Otp"("email");
CREATE INDEX "idx_otp_expired_at" ON "Otp"("expired_at");

-- Blog 索引
CREATE INDEX "idx_blog_published" ON "Blog"("published");
CREATE INDEX "idx_blog_created_at" ON "Blog"("created_at");

-- ========================================
-- 插入範例資料
-- ========================================

-- 插入範例使用者 (使用 bcrypt 加密的密碼)
INSERT INTO "User" ("name", "password", "email", "phone", "level", "valid") VALUES
('測試使用者', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'test@example.com', '0912345678', 1, true),
('管理員', '$2b$10$sRZ9L0wM3nO4pP5rS6tU7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO7pP8qS9tU', 'admin@example.com', '0987654321', 99, true),
('雷伯翰', '$2b$10$tSZ0M1xN4oP5qQ6sT7uV8wX9yZ0aB1cD2eF3gH4iJ5kL6mN7oO8pP9qT', 'yoki@gmail.com', '0911111111', 1, true),
('測試用戶2', '$2b$10$uTA1N2yO5pQ6rR7tU8vW9xY0zA1bC2dE3fG4hI5jK6lL7mM8nN9oO0pP', 'test2@example.com', '0922222222', 1, true);

-- 插入範例品牌
INSERT INTO "Brand" ("name", "info", "img") VALUES
('Apple', '蘋果公司，全球知名科技品牌', 'https://example.com/apple-logo.png'),
('Samsung', '三星電子，韓國跨國企業', 'https://example.com/samsung-logo.png'),
('Sony', '索尼公司，日本電子產品製造商', 'https://example.com/sony-logo.png'),
('Google', '谷歌公司，搜尋引擎和雲端服務', 'https://example.com/google-logo.png'),
('Microsoft', '微軟公司，軟體和雲端服務', 'https://example.com/microsoft-logo.png');

-- 插入範例分類
INSERT INTO "Category" ("name", "parent_id") VALUES
('電子產品', NULL),
('手機', 1),
('筆記型電腦', 1),
('配件', 1),
('軟體', NULL),
('作業系統', 5),
('應用程式', 5);

-- 插入範例商品
INSERT INTO "Product" ("name", "sn", "stock", "price", "info", "brand_id", "category_id", "photos") VALUES
('iPhone 15 Pro', 'IPHONE15PRO-001', 10, 35900, '最新款 iPhone 15 Pro，搭載 A17 Pro 晶片', 1, 2, 'https://example.com/iphone15pro.jpg'),
('Galaxy S24 Ultra', 'GALAXY24ULTRA-001', 8, 32900, '最新款 Galaxy S24 Ultra，S Pen 支援', 2, 2, 'https://example.com/galaxy24ultra.jpg'),
('MacBook Pro 16"', 'MACBOOKPRO16-001', 5, 59900, '專業筆記型電腦，M3 Pro 晶片', 1, 3, 'https://example.com/macbookpro16.jpg'),
('Surface Laptop 5', 'SURFACELAPTOP5-001', 7, 45900, '微軟 Surface Laptop 5，觸控螢幕', 5, 3, 'https://example.com/surfacelaptop5.jpg'),
('AirPods Pro 2', 'AIRPODSPRO2-001', 15, 7490, '主動降噪無線耳機', 1, 4, 'https://example.com/airpodspro2.jpg'),
('Galaxy Buds Pro', 'GALAXYBUDS-001', 12, 5990, '三星無線耳機，主動降噪', 2, 4, 'https://example.com/galaxybuds.jpg'),
('Windows 11 Pro', 'WINDOWS11PRO-001', 100, 8990, '微軟 Windows 11 專業版', 5, 6, 'https://example.com/windows11.jpg'),
('Office 365', 'OFFICE365-001', 200, 2190, '微軟 Office 365 年度訂閱', 5, 7, 'https://example.com/office365.jpg');

-- 插入範例時間記錄
INSERT INTO "TimeLog" ("title", "start_time", "end_time", "user_id") VALUES
('專案開發', '2025-01-18 09:00:00', '2025-01-18 17:00:00', 1),
('學習 React', '2025-01-19 10:00:00', '2025-01-19 12:00:00', 1),
('資料庫設計', '2025-01-20 14:00:00', '2025-01-20 18:00:00', 2),
('API 開發', '2025-01-21 09:30:00', '2025-01-21 16:30:00', 3),
('前端測試', '2025-01-22 10:00:00', '2025-01-22 15:00:00', 1);

-- 插入範例步驟
INSERT INTO "Step" ("time_log_id", "user_id", "title", "description", "start_time", "end_time") VALUES
(1, 1, '前端開發', 'React 元件開發和頁面設計', '2025-01-18 09:00:00', '2025-01-18 12:00:00'),
(1, 1, '後端開發', 'API 路由開發和資料庫操作', '2025-01-18 13:00:00', '2025-01-18 17:00:00'),
(2, 1, '學習 useState', '學習 React useState Hook 的使用方法', '2025-01-19 10:00:00', '2025-01-19 11:00:00'),
(2, 1, '學習 useEffect', '學習 React useEffect Hook 的使用方法', '2025-01-19 11:00:00', '2025-01-19 12:00:00'),
(3, 2, '設計資料表結構', '設計 PostgreSQL 資料表結構', '2025-01-20 14:00:00', '2025-01-20 16:00:00'),
(3, 2, '建立索引', '為資料表建立效能索引', '2025-01-20 16:00:00', '2025-01-20 18:00:00'),
(4, 3, '用戶認證 API', '開發用戶登入和註冊 API', '2025-01-21 09:30:00', '2025-01-21 12:30:00'),
(4, 3, '時間記錄 API', '開發時間記錄相關 API', '2025-01-21 13:30:00', '2025-01-21 16:30:00'),
(5, 1, '單元測試', '撰寫前端元件單元測試', '2025-01-22 10:00:00', '2025-01-22 12:30:00'),
(5, 1, '整合測試', '執行前端整合測試', '2025-01-22 13:00:00', '2025-01-22 15:00:00');

-- 插入範例我的最愛
INSERT INTO "Favorite" ("user_id", "product_id") VALUES
(1, 1),  -- 測試使用者喜歡 iPhone 15 Pro
(1, 5),  -- 測試使用者喜歡 AirPods Pro 2
(2, 3),  -- 管理員喜歡 MacBook Pro 16"
(2, 7),  -- 管理員喜歡 Windows 11 Pro
(3, 2),  -- 雷伯翰喜歡 Galaxy S24 Ultra
(3, 6),  -- 雷伯翰喜歡 Galaxy Buds Pro
(4, 4),  -- 測試用戶2喜歡 Surface Laptop 5
(4, 8);  -- 測試用戶2喜歡 Office 365

-- 插入範例部落格
INSERT INTO "Blog" ("title", "content", "published", "created_at", "updated_at") VALUES
('歡迎使用 TimeLog 系統', '這是一個功能完整的時間記錄管理系統，支援多種功能包括時間追蹤、步驟記錄、商品管理等。', true, '2025-01-15 10:00:00', '2025-01-15 10:00:00'),
('React 開發指南', '學習 React 的最佳實踐，包括 Hooks 使用、狀態管理、效能優化等主題。', true, '2025-01-16 14:30:00', '2025-01-16 14:30:00'),
('PostgreSQL 資料庫設計', 'PostgreSQL 資料庫設計的最佳實踐，包括正規化、索引設計、查詢優化等。', false, '2025-01-17 09:15:00', '2025-01-17 09:15:00'),
('Next.js 全端開發', '使用 Next.js 進行全端開發的完整指南，包括 API 路由、伺服器端渲染等。', true, '2025-01-18 16:45:00', '2025-01-18 16:45:00'),
('LINE Pay 整合實作', '如何在 Next.js 應用程式中整合 LINE Pay 支付功能，包括安全性和錯誤處理。', false, '2025-01-19 11:20:00', '2025-01-19 11:20:00');

-- 插入範例 OTP (一次性密碼)
INSERT INTO "Otp" ("email", "token", "hash", "created_at", "expired_at") VALUES
('test@example.com', '123456', '$2b$10$example_hash_1', '2025-01-20 10:00:00', '2025-01-20 10:10:00'),
('admin@example.com', '789012', '$2b$10$example_hash_2', '2025-01-20 11:00:00', '2025-01-20 11:10:00'),
('yoki@gmail.com', '345678', '$2b$10$example_hash_3', '2025-01-20 12:00:00', '2025-01-20 12:10:00');

-- ========================================
-- 查詢範例 (可選執行)
-- ========================================

-- 查詢所有使用者
-- SELECT * FROM "User" ORDER BY "user_id";

-- 查詢所有時間記錄
-- SELECT * FROM "TimeLog" ORDER BY "start_time";

-- 查詢特定活動的所有步驟
-- SELECT * FROM "Step" WHERE "time_log_id" = 1 ORDER BY "start_time";

-- 查詢活動總時長 (使用 EPOCH 計算小時)
-- SELECT
--     t."title",
--     t."start_time",
--     t."end_time",
--     EXTRACT(EPOCH FROM (t."end_time" - t."start_time"))/3600 AS "duration_hours"
-- FROM "TimeLog" t
-- WHERE t."end_time" IS NOT NULL;

-- 查詢使用者及其時間記錄
-- SELECT
--     u."name" AS "user_name",
--     u."email",
--     t."title" AS "activity_title",
--     t."start_time",
--     t."end_time"
-- FROM "User" u
-- LEFT JOIN "TimeLog" t ON u."user_id" = t."user_id"
-- ORDER BY u."user_id", t."start_time";

-- 查詢商品及其品牌和分類
-- SELECT
--     p."name" AS "product_name",
--     p."price",
--     p."stock",
--     b."name" AS "brand_name",
--     c."name" AS "category_name"
-- FROM "Product" p
-- LEFT JOIN "Brand" b ON p."brand_id" = b."id"
-- LEFT JOIN "Category" c ON p."category_id" = c."id"
-- ORDER BY p."id";

-- 查詢使用者的我的最愛商品
-- SELECT
--     u."name" AS "user_name",
--     p."name" AS "product_name",
--     p."price",
--     b."name" AS "brand_name"
-- FROM "Favorite" f
-- JOIN "User" u ON f."user_id" = u."user_id"
-- JOIN "Product" p ON f."product_id" = p."id"
-- LEFT JOIN "Brand" b ON p."brand_id" = b."id"
-- ORDER BY u."user_id", p."name";

-- 查詢已發布的部落格文章
-- SELECT
--     "title",
--     "content",
--     "created_at"
-- FROM "Blog"
-- WHERE "published" = true
-- ORDER BY "created_at" DESC;

-- ========================================
-- 完成訊息
-- ========================================
-- 資料庫建立完成！
-- 包含 9 個資料表、完整索引、範例資料
-- 可直接在 Zeabur PostgreSQL 上執行

