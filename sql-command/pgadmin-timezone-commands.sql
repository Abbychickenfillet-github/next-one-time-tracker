-- =====================================================
-- pgAdmin 本地資料庫時區修正指令
-- 執行日期: 2025-10-17
-- 用途: 在 pgAdmin 中執行，修改本地 PostgreSQL 資料庫
-- =====================================================

-- 在 pgAdmin 的 Query Tool 中執行以下指令：

-- 1. 首先檢查目前的時區設定
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

-- 8. 修改 PaymentOrder 表的時間欄位
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
-- 這個查詢示範時區轉換的效果：
-- current_time: 顯示當前時間（帶時區資訊，例如 +08 表示台北時間）
-- taipei_time: 將當前時間轉換為台北時間的顯示格式（不帶時區資訊）
-- utc_time: 將當前時間轉換為 UTC 時間的顯示格式（不帶時區資訊）
--
-- 例如結果可能是：
-- current_time: 2025-01-17 19:00:00+08 (台北時間)
-- taipei_time: 2025-01-17 19:00:00 (台北時間顯示)
-- utc_time: 2025-01-17 11:00:00 (UTC 時間顯示，比台北時間早 8 小時)
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
-- pgAdmin 執行步驟
-- =====================================================
/*
在 pgAdmin 中執行的步驟：

1. 開啟 pgAdmin 4
2. 連接到你的本地 PostgreSQL 資料庫
3. 展開資料庫 → Schemas → public → Tables
4. 右鍵點擊任意表格 → Query Tool
5. 複製貼上上面的 SQL 指令
6. 點擊 Execute (F5) 執行
7. 檢查 Messages 標籤頁確認執行結果
8. 執行驗證指令確認修改成功

注意事項：
- 執行前建議先備份資料庫
- 如果遇到錯誤，檢查是否有其他連線正在使用這些表格
- 執行完成後重新啟動應用程式
*/
