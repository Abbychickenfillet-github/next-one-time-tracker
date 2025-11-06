# PostgreSQL "public" Schema 說明

## 📚 什麼是 Schema？

**Schema（模式）** 是 PostgreSQL 中的**命名空間**，用來組織和管理資料庫物件（表、函數、視圖等）。

可以把它想像成：

- 📁 **資料夾**：用於組織檔案
- 📚 **書架**：用於分類書籍
- 🏢 **建築樓層**：用於分隔不同區域

## 🎯 為什麼有 "public"？

### 1. "public" 是 PostgreSQL 的預設 Schema

當你創建一個新的 PostgreSQL 資料庫時，系統會自動創建一個名為 `public` 的 schema：

```sql
-- 每個資料庫預設都有 public schema
CREATE DATABASE my_database;
-- 系統自動創建：public schema
```

### 2. 結構層級

```
PostgreSQL 資料庫結構：
├── Server (PostgreSQL 實例)
│   ├── Database (資料庫)
│   │   ├── Schema (模式/命名空間)
│   │   │   ├── Table (資料表)
│   │   │   ├── Function (函數)
│   │   │   └── View (視圖)
```

**實際範例：**

```
PostgreSQL Server
└── timelog_db (資料庫)
    └── public (schema) ← 預設的 schema
        ├── user (表)
        ├── timelog (表)
        └── step (表)
```

### 3. 為什麼要寫 "public"？

#### 寫上 "public" 的好處：

```sql
-- ✅ 明確指定 schema
CREATE TABLE "public"."user" (...);

-- ✅ 優點：
-- 1. 清楚表明表在 public schema
-- 2. 避免因 search_path 設定造成的歧義
-- 3. 符合 Prisma 的標準做法
```

#### 不寫 "public" 也可以：

```sql
-- ⚠️ 沒有指定 schema（會使用預設的 public）
CREATE TABLE "user" (...);

-- PostgreSQL 會自動解析為：
-- CREATE TABLE "public"."user" (...)
```

### 4. 何時需要多個 Schema？

#### 單一 Schema（最常見）：

```sql
-- 所有表都在 public schema
CREATE TABLE "public"."user" (...);
CREATE TABLE "public"."product" (...);
CREATE TABLE "public"."order" (...);
```

#### 多個 Schema（進階用法）：

```sql
-- 不同功能模組使用不同 schema
CREATE SCHEMA "auth";        -- 認證相關
CREATE SCHEMA "api";         -- API 相關
CREATE SCHEMA "analytics";   -- 分析相關

CREATE TABLE "auth"."user" (...);
CREATE TABLE "api"."endpoint" (...);
CREATE TABLE "analytics"."event" (...);
```

## 📝 實際範例對比

### 範例 1：完整寫法（Prisma 標準）

```sql
-- Prisma 生成的遷移檔案
CREATE TABLE "public"."user" (
    "user_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);
```

### 範例 2：簡化寫法（也可以）

```sql
-- 不寫 public，PostgreSQL 會自動使用 public
CREATE TABLE "user" (
    "user_id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);
```

### 範例 3：查詢時的差異

```sql
-- ✅ 明確指定 schema
SELECT * FROM "public"."user";

-- ✅ 簡化寫法（如果 search_path 包含 public）
SELECT * FROM "user";

-- ✅ 不同 schema 的表
SELECT * FROM "auth"."user";      -- auth schema 的 user 表
SELECT * FROM "public"."user";    -- public schema 的 user 表
```

## 🔍 檢查你的資料庫 Schema

### 查看所有 Schema：

```sql
-- 列出所有 schema
SELECT schema_name
FROM information_schema.schemata;

-- 結果範例：
-- schema_name
-- -----------
-- public
-- information_schema
-- pg_catalog
-- pg_toast
```

### 查看特定 Schema 的表：

```sql
-- 查看 public schema 的所有表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- 結果範例：
-- table_name
-- ----------
-- user
-- timelog
-- step
```

## ⚠️ 重要注意事項

### 1. Prisma 總是使用 "public"

Prisma 生成遷移時**總是會明確寫出 "public"**，這是 Prisma 的標準做法：

```sql
-- Prisma 生成的 SQL
CREATE TABLE "public"."user" (...);
-- ↑ 總是會寫 public

-- 而不是：
CREATE TABLE "user" (...);
-- ↑ Prisma 不會這樣寫
```

### 2. 可以省略 "public" 嗎？

**技術上可以**，但不建議：

```sql
-- ✅ 可以（功能相同）
CREATE TABLE "user" (...);

-- ✅ 更明確（Prisma 標準）
CREATE TABLE "public"."user" (...);
```

### 3. 為什麼 Prisma 要寫 "public"？

- **明確性**：清楚表明表的位置
- **可移植性**：避免因 search_path 設定造成的問題
- **多環境一致性**：在不同環境中行為一致

## 🎯 總結

| 問題                  | 答案                                 |
| --------------------- | ------------------------------------ |
| **"public" 是什麼？** | PostgreSQL 的預設 schema（命名空間） |
| **為什麼需要？**      | 用來組織和管理資料庫物件             |
| **能省略嗎？**        | 技術上可以，但 Prisma 會明確寫出     |
| **Prisma 為什麼寫？** | 為了明確性和一致性                   |

**簡單來說**：`public` 就像是資料庫中的「預設資料夾」，所有表預設都放在這裡。Prisma 明確寫出 `"public"` 是為了讓程式碼更清楚、更可靠。
