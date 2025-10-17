-- =====================================================
-- Zeabur 資料庫時區修正指令
-- 執行日期: 2025-01-17
-- 用途: 在 Zeabur 的資料庫管理介面中執行
-- =====================================================

-- 在 Zeabur 的資料庫管理介面中執行以下指令：

-- 1. 檢查目前的時區設定
SHOW timezone;

-- 2. 設定資料庫時區為台北時間（可選）
SET timezone = 'Asia/Taipei';

-- 3. 修改 Blog 表的時間欄位
-- ⚠️ 重要說明：AT TIME ZONE 'UTC' 的意思
-- 假設你現有的 created_at 欄位是 TIMESTAMP WITHOUT TIME ZONE
-- 例如：2025-01-17 19:00:00 (沒有時區資訊)
--
-- 使用 AT TIME ZONE 'UTC' 表示：
-- "我假設這個 19:00:00 是 UTC 時間"
-- 轉換後會變成：2025-01-17 19:00:00+00 (UTC 時間)
--
-- 如果你的舊資料實際上是台北時間，應該用：
-- USING "created_at" AT TIME ZONE 'Asia/Taipei'
-- 這樣 19:00:00 會被視為台北時間，轉換為 2025-01-17 19:00:00+08
ALTER TABLE "Blog"
ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE USING "created_at" AT TIME ZONE 'UTC';

-- updated_at 改為可為空值（因為不一定有更新）
ALTER TABLE "Blog"
ALTER COLUMN "updated_at" TYPE TIMESTAMP WITH TIME ZONE USING "updated_at" AT TIME ZONE 'UTC',
ALTER COLUMN "updated_at" DROP NOT NULL;

-- 4. 修改 TimeLog 表的時間欄位
ALTER TABLE "TimeLog"
ALTER COLUMN "start_time" TYPE TIMESTAMP WITH TIME ZONE USING "start_time" AT TIME ZONE 'UTC';

-- end_time 改為不可為空值（必須有結束時間）
ALTER TABLE "TimeLog"
ALTER COLUMN "end_time" TYPE TIMESTAMP WITH TIME ZONE USING "end_time" AT TIME ZONE 'UTC',
ALTER COLUMN "end_time" SET NOT NULL;

-- 5. 修改 Step 表的時間欄位
ALTER TABLE "Step"
ALTER COLUMN "start_time" TYPE TIMESTAMP WITH TIME ZONE USING "start_time" AT TIME ZONE 'UTC';

ALTER TABLE "Step"
ALTER COLUMN "end_time" TYPE TIMESTAMP WITH TIME ZONE USING "end_time" AT TIME ZONE 'UTC';

-- 6. 修改 Otp 表的時間欄位
ALTER TABLE "Otp"
ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "Otp"
ALTER COLUMN "expired_at" TYPE TIMESTAMP WITH TIME ZONE USING "expired_at" AT TIME ZONE 'UTC';

-- 7. 修改 User 表的時間欄位
ALTER TABLE "User"
ALTER COLUMN "birthdate" TYPE TIMESTAMP WITH TIME ZONE USING "birthdate" AT TIME ZONE 'UTC';

ALTER TABLE "User"
ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "User"
ALTER COLUMN "due_date" TYPE TIMESTAMP WITH TIME ZONE USING "due_date" AT TIME ZONE 'UTC';

ALTER TABLE "User"
ALTER COLUMN "paid_date" TYPE TIMESTAMP WITH TIME ZONE USING "paid_date" AT TIME ZONE 'UTC';

-- 8. 建立 PaymentOrder 表（如果尚未建立）
CREATE TABLE IF NOT EXISTS "PaymentOrder" (
    "id" SERIAL PRIMARY KEY,
    "orderId" VARCHAR(255) UNIQUE NOT NULL,
    "user_id" INTEGER,
    "amount" INTEGER NOT NULL,
    "currency" VARCHAR(10) DEFAULT 'TWD',
    "status" VARCHAR(50) DEFAULT 'PENDING',
    "transaction_id" VARCHAR(255) UNIQUE,
    "packages" JSONB NOT NULL,
    "redirect_urls" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE,
    "due_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    "is_current" BOOLEAN DEFAULT true,
    "paid_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    "subscription_status" VARCHAR(50) DEFAULT 'ACTIVE',
    CONSTRAINT "PaymentOrder_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id")
);

-- 建立 PaymentOrder 表的索引
CREATE INDEX IF NOT EXISTS "PaymentOrder_user_id_is_current_idx" ON "PaymentOrder"("user_id", "is_current");
CREATE INDEX IF NOT EXISTS "PaymentOrder_due_at_idx" ON "PaymentOrder"("due_at");

-- =====================================================
-- 驗證指令
-- =====================================================

-- 檢查所有時間欄位類型
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND data_type LIKE '%timestamp%'
ORDER BY table_name, column_name;

-- 測試時區轉換
SELECT
    NOW() as current_time,
    NOW() AT TIME ZONE 'Asia/Taipei' as taipei_time,
    NOW() AT TIME ZONE 'UTC' as utc_time;

-- 檢查 User 表的時間資料
SELECT
    user_id,
    name,
    created_at,
    created_at AT TIME ZONE 'Asia/Taipei' as created_at_taipei
FROM "User"
LIMIT 5;

-- =====================================================
-- Zeabur 執行步驟
-- =====================================================
/*
在 Zeabur 中執行的步驟：

1. 登入 Zeabur 控制台
2. 進入你的專案
3. 點擊 PostgreSQL 服務
4. 點擊「資料庫」標籤
5. 在 SQL 查詢介面中貼上上面的指令
6. 點擊執行按鈕
7. 檢查執行結果
8. 執行驗證指令確認修改成功

注意事項：
- 執行前建議先備份資料庫
- 如果遇到錯誤，檢查是否有其他連線正在使用這些表格
- 執行完成後重新部署應用程式
- 確保應用程式的 DATABASE_URL 環境變數正確設定

執行完成後，你的時間問題應該就解決了！
*/
