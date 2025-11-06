-- ========================================
-- Zeabur 資料庫遷移腳本
-- 使用大寫表名（與 Prisma 預設一致）
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- ========================================
-- 步驟 1: 刪除所有小寫表名的表（如果有）
-- ========================================

-- 先清空數據（使用 DO 語句檢查表是否存在後再 TRUNCATE）
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user') THEN
        TRUNCATE TABLE "public"."user" CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'timelog') THEN
        TRUNCATE TABLE "public"."timelog" CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'step') THEN
        TRUNCATE TABLE "public"."step" CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'otp') THEN
        TRUNCATE TABLE "public"."otp" CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'paymentorder') THEN
        TRUNCATE TABLE "public"."paymentorder" CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'featuredshare') THEN
        TRUNCATE TABLE "public"."featuredshare" CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'favorite') THEN
        TRUNCATE TABLE "public"."favorite" CASCADE;
    END IF;
END $$;

-- 刪除小寫表名（會自動刪除所有約束和索引）
DROP TABLE IF EXISTS "public"."user" CASCADE;
DROP TABLE IF EXISTS "public"."timelog" CASCADE;
DROP TABLE IF EXISTS "public"."step" CASCADE;
DROP TABLE IF EXISTS "public"."otp" CASCADE;
DROP TABLE IF EXISTS "public"."paymentorder" CASCADE;
DROP TABLE IF EXISTS "public"."featuredshare" CASCADE;
DROP TABLE IF EXISTS "public"."favorite" CASCADE;

-- ========================================
-- 步驟 2: 刪除所有大寫表名的表（如果有）
-- ========================================

DROP TABLE IF EXISTS "public"."Blog" CASCADE;
DROP TABLE IF EXISTS "public"."TimeLog" CASCADE;
DROP TABLE IF EXISTS "public"."Step" CASCADE;
DROP TABLE IF EXISTS "public"."PaymentOrder" CASCADE;
DROP TABLE IF EXISTS "public"."Otp" CASCADE;
DROP TABLE IF EXISTS "public"."User" CASCADE;
DROP TABLE IF EXISTS "public"."FeaturedShare" CASCADE;
DROP TABLE IF EXISTS "public"."Favorite" CASCADE;

-- ========================================
-- 步驟 3: 重新創建所有表（使用大寫表名）
-- ========================================

-- CreateTable: User
CREATE TABLE "public"."User" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "birthdate" TIMESTAMP(3),
    "gender" TEXT,
    "avatar" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "google_uid" TEXT,
    "line_uid" TEXT,
    "lineAccessToken" TEXT,
    "refreshToken" TEXT,
    "iat" TEXT,
    "exp" TEXT,
    "current_log_count" INTEGER NOT NULL DEFAULT 0,
    "due_date" TIMESTAMP(3),
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paid_date" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable: TimeLog
CREATE TABLE "public"."TimeLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "user_id" UUID,
    "memo" TEXT,

    CONSTRAINT "TimeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Step
CREATE TABLE "public"."Step" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "time_log_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),

    CONSTRAINT "Step_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Otp
CREATE TABLE "public"."Otp" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expired_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable: PaymentOrder
CREATE TABLE "public"."PaymentOrder" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orderId" TEXT NOT NULL,
    "user_id" UUID,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TWD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "transaction_id" TEXT,
    "packages" JSONB NOT NULL,
    "redirect_urls" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "due_at" TIMESTAMP(3),
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "paid_at" TIMESTAMP(3),
    "subscription_status" TEXT DEFAULT 'ACTIVE',

    CONSTRAINT "PaymentOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable: FeaturedShare
CREATE TABLE "public"."FeaturedShare" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "time_log_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "share_reason" TEXT,
    "star_count" INTEGER NOT NULL DEFAULT 0,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturedShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Favorite
CREATE TABLE "public"."Favorite" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "featured_share_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- ========================================
-- 步驟 4: 創建索引
-- ========================================

-- CreateIndex: User email unique
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex: User google_uid unique
CREATE UNIQUE INDEX "User_google_uid_key" ON "public"."User"("google_uid");

-- CreateIndex: User line_uid unique
CREATE UNIQUE INDEX "User_line_uid_key" ON "public"."User"("line_uid");

-- CreateIndex: User email index
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- CreateIndex: User google_uid index
CREATE INDEX "User_google_uid_idx" ON "public"."User"("google_uid");

-- CreateIndex: User line_uid index
CREATE INDEX "User_line_uid_idx" ON "public"."User"("line_uid");

-- CreateIndex: Otp email unique
CREATE UNIQUE INDEX "Otp_email_key" ON "public"."Otp"("email");

-- CreateIndex: PaymentOrder orderId unique
CREATE UNIQUE INDEX "PaymentOrder_orderId_key" ON "public"."PaymentOrder"("orderId");

-- CreateIndex: PaymentOrder transaction_id unique
CREATE UNIQUE INDEX "PaymentOrder_transaction_id_key" ON "public"."PaymentOrder"("transaction_id");

-- CreateIndex: PaymentOrder user_id and is_current composite index
CREATE INDEX "PaymentOrder_user_id_is_current_idx" ON "public"."PaymentOrder"("user_id", "is_current");

-- CreateIndex: PaymentOrder due_at index
CREATE INDEX "PaymentOrder_due_at_idx" ON "public"."PaymentOrder"("due_at");

-- CreateIndex: FeaturedShare user_id index
CREATE INDEX "FeaturedShare_user_id_idx" ON "public"."FeaturedShare"("user_id");

-- CreateIndex: FeaturedShare is_public and created_at composite index
CREATE INDEX "FeaturedShare_is_public_created_at_idx" ON "public"."FeaturedShare"("is_public", "created_at");

-- CreateIndex: FeaturedShare star_count index
CREATE INDEX "FeaturedShare_star_count_idx" ON "public"."FeaturedShare"("star_count");

-- CreateIndex: Favorite user_id and featured_share_id unique
CREATE UNIQUE INDEX "Favorite_user_id_featured_share_id_key" ON "public"."Favorite"("user_id", "featured_share_id");

-- CreateIndex: Favorite user_id index
CREATE INDEX "Favorite_user_id_idx" ON "public"."Favorite"("user_id");

-- CreateIndex: Favorite featured_share_id index
CREATE INDEX "Favorite_featured_share_id_idx" ON "public"."Favorite"("featured_share_id");

-- ========================================
-- 步驟 5: 創建外鍵約束
-- ========================================

-- AddForeignKey: TimeLog -> User
ALTER TABLE "public"."TimeLog" ADD CONSTRAINT "TimeLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Step -> TimeLog
ALTER TABLE "public"."Step" ADD CONSTRAINT "Step_time_log_id_fkey" FOREIGN KEY ("time_log_id") REFERENCES "public"."TimeLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: PaymentOrder -> User
ALTER TABLE "public"."PaymentOrder" ADD CONSTRAINT "PaymentOrder_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: FeaturedShare -> User
ALTER TABLE "public"."FeaturedShare" ADD CONSTRAINT "FeaturedShare_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: FeaturedShare -> TimeLog
ALTER TABLE "public"."FeaturedShare" ADD CONSTRAINT "FeaturedShare_time_log_id_fkey" FOREIGN KEY ("time_log_id") REFERENCES "public"."TimeLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Favorite -> User
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Favorite -> FeaturedShare
ALTER TABLE "public"."Favorite" ADD CONSTRAINT "Favorite_featured_share_id_fkey" FOREIGN KEY ("featured_share_id") REFERENCES "public"."FeaturedShare"("id") ON DELETE CASCADE ON UPDATE CASCADE;
