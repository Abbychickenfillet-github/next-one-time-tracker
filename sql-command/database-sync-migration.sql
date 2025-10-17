-- =====================================================
-- 資料庫結構同步 SQL - 新增缺少的欄位
-- 執行日期: 2025-10-17
-- 目的: 同步 Prisma schema 與 Zeabur 資料庫的 User 表結構
-- =====================================================

-- 1. 新增 current_log_count 欄位 (預設值為 0)
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "current_log_count" INTEGER DEFAULT 0;

-- 2. 新增 due_date 欄位 (可為 NULL)
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "due_date" TIMESTAMP;

-- 3. 新增 paid 欄位 (預設值為 false)
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "paid" BOOLEAN DEFAULT false;

-- 4. 新增 paid_date 欄位 (可為 NULL)
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "paid_date" TIMESTAMP;

-- =====================================================
-- 驗證查詢 - 檢查所有欄位是否已正確新增
-- =====================================================

-- 檢查 User 表的所有欄位
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'User'
ORDER BY ordinal_position;

-- 檢查新增的欄位是否有正確的預設值
SELECT
    user_id,
    name,
    email,
    current_log_count,
    paid,
    due_date,
    paid_date
FROM "User"
LIMIT 5; -- 限制查詢結果為 5 筆

-- =====================================================
-- 備註說明
-- =====================================================
/*
執行此 SQL 後，你的 User 表將包含以下所有欄位：

必要欄位：
- user_id (主鍵)
- password (必填)
- email (必填，唯一)

可選欄位：
- name
- phone
- birthdate
- gender
- avatar
- level (預設 0)
- valid (預設 true)
- createdAt (自動設定)
- googleUid
- lineUid
- lineAccessToken
- refreshToken
- iat
- exp
- current_log_count (預設 0) ← 新增
- due_date ← 新增
- paid (預設 false) ← 新增
- paid_date ← 新增

這樣就能確保 Prisma 的 createUser 函數能正常運作，不會因為缺少欄位而導致註冊失敗。
*/
