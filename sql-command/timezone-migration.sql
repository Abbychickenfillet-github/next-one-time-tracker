-- =====================================================
-- 時區修正 SQL Migration
-- 執行日期: 2025-01-17
-- 目的: 將所有 TIMESTAMP 欄位改為 TIMESTAMP WITH TIMEZONE
-- =====================================================

-- 1. 修改 Blog 表的時間欄位
ALTER TABLE "Blog"
ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE USING "created_at" AT TIME ZONE 'UTC';

-- updated_at 改為可為空值（因為不一定有更新）
ALTER TABLE "Blog"
ALTER COLUMN "updated_at" TYPE TIMESTAMP WITH TIME ZONE USING "updated_at" AT TIME ZONE 'UTC',
ALTER COLUMN "updated_at" DROP NOT NULL;

-- 2. 修改 TimeLog 表的時間欄位
ALTER TABLE "TimeLog"
ALTER COLUMN "start_time" TYPE TIMESTAMP WITH TIME ZONE USING "start_time" AT TIME ZONE 'UTC';

-- end_time 改為不可為空值（必須有結束時間）
ALTER TABLE "TimeLog"
ALTER COLUMN "end_time" TYPE TIMESTAMP WITH TIME ZONE USING "end_time" AT TIME ZONE 'UTC',
ALTER COLUMN "end_time" SET NOT NULL;

-- 3. 修改 Step 表的時間欄位
ALTER TABLE "Step"
ALTER COLUMN "start_time" TYPE TIMESTAMP WITH TIME ZONE USING "start_time" AT TIME ZONE 'UTC';

ALTER TABLE "Step"
ALTER COLUMN "end_time" TYPE TIMESTAMP WITH TIME ZONE USING "end_time" AT TIME ZONE 'UTC';

-- 4. 修改 Otp 表的時間欄位
ALTER TABLE "Otp"
ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "Otp"
ALTER COLUMN "expired_at" TYPE TIMESTAMP WITH TIME ZONE USING "expired_at" AT TIME ZONE 'UTC';

-- 5. 修改 User 表的時間欄位
ALTER TABLE "User"
ALTER COLUMN "birthdate" TYPE TIMESTAMP WITH TIME ZONE USING "birthdate" AT TIME ZONE 'UTC';

ALTER TABLE "User"
ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "User"
ALTER COLUMN "due_date" TYPE TIMESTAMP WITH TIME ZONE USING "due_date" AT TIME ZONE 'UTC';

ALTER TABLE "User"
ALTER COLUMN "paid_date" TYPE TIMESTAMP WITH TIME ZONE USING "paid_date" AT TIME ZONE 'UTC';

-- 6. 修改 PaymentOrder 表的時間欄位
-- 注意：PaymentOrder 表可能尚未建立，如果遇到錯誤請跳過此步驟
ALTER TABLE "PaymentOrder"
ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE USING "created_at" AT TIME ZONE 'UTC';

-- updated_at 改為可為空值（因為不一定有更新）
ALTER TABLE "PaymentOrder"
ALTER COLUMN "updated_at" TYPE TIMESTAMP WITH TIME ZONE USING "updated_at" AT TIME ZONE 'UTC',
ALTER COLUMN "updated_at" DROP NOT NULL;

-- due_at 改為不可為空值（必須有到期時間）
ALTER TABLE "PaymentOrder"
ALTER COLUMN "due_at" TYPE TIMESTAMP WITH TIME ZONE USING "due_at" AT TIME ZONE 'UTC',
ALTER COLUMN "due_at" SET NOT NULL;

-- paid_at 改為不可為空值（必須有付款時間）
ALTER TABLE "PaymentOrder"
ALTER COLUMN "paid_at" TYPE TIMESTAMP WITH TIME ZONE USING "paid_at" AT TIME ZONE 'UTC',
ALTER COLUMN "paid_at" SET NOT NULL;

-- =====================================================
-- 驗證查詢 - 檢查所有時間欄位是否已正確修改
-- =====================================================

-- 檢查所有表的時間欄位類型
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND data_type LIKE '%timestamp%'
ORDER BY table_name, column_name;

-- 檢查 User 表的時間欄位資料
SELECT
    user_id,
    name,
    birthdate,
    created_at,
    due_date,
    paid_date
FROM "User"
LIMIT 3;

-- =====================================================
-- 備註說明
-- =====================================================
/*
執行此 SQL 後的效果：

1. 所有時間欄位都會變成 TIMESTAMP WITH TIME ZONE
2. 現有資料會被轉換為 UTC 時區
3. 新插入的資料會自動包含時區資訊
4. 查詢時可以指定時區進行轉換

範例查詢：
-- 查詢台北時間
SELECT created_at AT TIME ZONE 'Asia/Taipei' FROM "User";

-- 插入帶時區的時間
INSERT INTO "User" (created_at) VALUES (NOW() AT TIME ZONE 'Asia/Taipei');
*/
