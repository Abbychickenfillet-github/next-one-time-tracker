# Zeabur 資料庫遷移指南

## 📝 問題解答

### 1. 為什麼 migration.sql 會有雙引號和 "public"？

**雙引號的作用：**

- PostgreSQL 使用雙引號包裹標識符（identifier）來確保**大小寫敏感**
- 例如：`"Blog"` 和 `blog` 是不同的表名
- 不使用引號時，PostgreSQL 會自動轉為小寫

**"public" schema：**

- `public` 是 PostgreSQL 的**預設 schema**（不是 Prisma 的語法）
- Schema 是資料庫中的命名空間，用來組織資料表
- Prisma 在生成遷移時會自動添加 `"public"` schema 前綴
- 所有表都在 `public` schema 中，除非特別指定其他 schema

**範例：**

```sql
-- 帶引號（大小寫敏感）
CREATE TABLE "public"."Blog" (...);  -- 表名是 "Blog"（大寫 B）

-- 不帶引號（自動轉小寫）
CREATE TABLE public.blog (...);      -- 表名是 "blog"（小寫 b）
```

### 2. 為什麼無法使用 `npx prisma migrate deploy` 更新 Zeabur？

**原因：**
`prisma migrate deploy` 需要 `_prisma_migrations` 表來追蹤遷移歷史。

**解決方案：**

#### 方案 A：初始化遷移歷史表（推薦）

在 Zeabur 資料庫中手動創建遷移歷史表：

```sql
-- 創建 Prisma 遷移歷史表
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP(3),
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);
```

然後手動插入初始遷移記錄：

```sql
-- 插入初始遷移記錄（需要根據實際情況調整 checksum）
INSERT INTO "_prisma_migrations" (
    "id",
    "checksum",
    "migration_name",
    "started_at",
    "finished_at",
    "applied_steps_count"
) VALUES (
    gen_random_uuid()::text,
    '初始遷移的 checksum',  -- 需要從 migration.sql 檔案計算
    '0_init',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    1
);
```

#### 方案 B：使用 migration-zeabur.sql 一次性執行

直接在 Zeabur 的資料庫管理介面執行 `migration-zeabur.sql`：

1. 登入 Zeabur 資料庫管理介面（pgAdmin 或其他）
2. 執行 `prisma/migrations/0_init/migration-zeabur.sql` 中的完整 SQL
3. 之後就可以使用 `npx prisma migrate deploy` 了

#### 方案 C：使用 `prisma db push`（開發環境）

如果你只想快速同步結構（不保留遷移歷史）：

```bash
npx prisma db push
```

**注意：** 這不會記錄遷移歷史，不適合生產環境。

### 3. 表名改為小寫的原因

在 `migration-zeabur.sql` 中，所有表名都使用**小寫**：

- ✅ `CREATE TABLE "public"."user"` （小寫）
- ❌ `CREATE TABLE "public"."User"` （大寫）

**原因：**

- PostgreSQL 預設不區分大小寫（除非使用雙引號）
- 使用小寫表名是 PostgreSQL 的最佳實踐
- 避免在不同環境中出現大小寫問題

## 🚀 使用 migration-zeabur.sql

### 步驟 1：備份現有資料（如果有）

```bash
# 使用 pg_dump 備份
pg_dump -U your_user -h your_host -d your_database > backup.sql
```

### 步驟 2：執行遷移腳本

在 Zeabur 資料庫管理介面執行 `migration-zeabur.sql`：

1. 登入 Zeabur PostgreSQL 資料庫
2. 打開 SQL 編輯器
3. 複製 `migration-zeabur.sql` 的全部內容
4. 執行 SQL

### 步驟 3：驗證遷移

```bash
# 檢查遷移狀態
npx prisma migrate status

# 檢查資料庫結構
npx prisma studio
```

### 步驟 4：初始化 Prisma 遷移歷史（如果需要）

如果之後想使用 `prisma migrate deploy`，需要初始化遷移歷史表（見方案 A）。

## 📋 migration-zeabur.sql 內容說明

### 包含的資料表

1. **user** - 用戶資料表
2. **timelog** - 時間記錄表
3. **step** - 步驟記錄表
4. **otp** - OTP 驗證碼表
5. **paymentorder** - 付款訂單表
6. **featuredshare** - 精選分享表
7. **favorite** - 收藏表

### 特點

- ✅ 所有 ID 使用 UUID 類型
- ✅ 所有表名使用小寫
- ✅ 所有欄位名使用 snake_case
- ✅ 包含所有索引和外鍵約束
- ✅ 啟用 UUID 擴展

## ⚠️ 注意事項

1. **執行前請備份資料**：此腳本會創建新表，如果表已存在會出錯
2. **UUID 欄位**：所有 ID 欄位都使用 UUID，不是 INTEGER
3. **表名大小寫**：表名全部小寫，符合 PostgreSQL 最佳實踐
4. **欄位映射**：Prisma schema 中的 camelCase 欄位會自動轉為 snake_case

## 🔧 故障排除

### 錯誤：表已存在

```sql
-- 如果表已存在，需要先刪除
DROP TABLE IF EXISTS "public"."favorite" CASCADE;
DROP TABLE IF EXISTS "public"."featuredshare" CASCADE;
DROP TABLE IF EXISTS "public"."paymentorder" CASCADE;
DROP TABLE IF EXISTS "public"."step" CASCADE;
DROP TABLE IF EXISTS "public"."timelog" CASCADE;
DROP TABLE IF EXISTS "public"."otp" CASCADE;
DROP TABLE IF EXISTS "public"."user" CASCADE;
```

### 錯誤：擴展不存在

```sql
-- 確保有權限創建擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- 或者使用 PostgreSQL 內建的
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### 檢查遷移是否成功

```sql
-- 檢查所有表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 檢查 _prisma_migrations 表
SELECT * FROM "_prisma_migrations";
```
