# PostgreSQL DO $$ 語句說明

## 📚 什麼是 DO $$ 語句？

**`DO $$`** 是 PostgreSQL 的**匿名代碼塊（Anonymous Code Block）**語法，允許你執行一段 PL/pgSQL 代碼，而不需要創建函數。

### 基本語法

```sql
DO $$
BEGIN
    -- 你的 PL/pgSQL 代碼
    -- 可以在這裡執行邏輯判斷、迴圈等
END $$;
```

## 🎯 為什麼需要 DO $$？

### 問題背景

在 PostgreSQL 中，某些 SQL 語句**不支持條件執行**：

```sql
-- ❌ 錯誤：PostgreSQL 不支持 IF EXISTS 語法
TRUNCATE TABLE IF EXISTS "public"."user";
-- 這會報錯！
```

### 解決方案：使用 DO $$ 語句

```sql
-- ✅ 正確：使用 DO $$ 檢查表是否存在後再執行
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'user') THEN
        TRUNCATE TABLE "public"."user" CASCADE;
    END IF;
END $$;
```

## 📝 語法詳解

### 1. 基本結構

```sql
DO $$
BEGIN
    -- 代碼塊
END $$;
```

### 2. 使用變數

```sql
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public';

    RAISE NOTICE '資料庫中有 % 個表', table_count;
END $$;
```

### 3. 條件判斷

```sql
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'user') THEN
        -- 表存在，執行操作
        TRUNCATE TABLE "public"."user";
        RAISE NOTICE '已清空 user 表';
    ELSE
        -- 表不存在
        RAISE NOTICE 'user 表不存在';
    END IF;
END $$;
```

### 4. 迴圈處理

```sql
DO $$
DECLARE
    table_name TEXT;
BEGIN
    -- 遍歷所有表並清空
    FOR table_name IN
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('TRUNCATE TABLE %I CASCADE', table_name);
        RAISE NOTICE '已清空表: %', table_name;
    END LOOP;
END $$;
```

## 🔍 在 migration-zeabur.sql 中的應用

### 原始問題

```sql
-- ❌ 這樣寫會報錯
TRUNCATE TABLE IF EXISTS "public"."user";
```

### 解決方案

```sql
-- ✅ 使用 DO $$ 檢查表是否存在
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'user') THEN
        TRUNCATE TABLE "public"."user" CASCADE;
    END IF;
END $$;
```

## 💡 為什麼使用 $$？

### 什麼是 $$？

**`$$`** 是 PostgreSQL 的**美元符號標記（Dollar-quoting）**，用於標記字符串邊界。

### 為什麼不用單引號？

```sql
-- ❌ 複雜：需要轉義單引號
DO '
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables
               WHERE table_schema = ''public'' AND table_name = ''user'') THEN
        TRUNCATE TABLE "public"."user" CASCADE;
    END IF;
END ';
-- 注意：單引號需要轉義成兩個單引號 ''
```

```sql
-- ✅ 簡單：使用 $$ 不需要轉義
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'user') THEN
        TRUNCATE TABLE "public"."user" CASCADE;
    END IF;
END $$;
```

### $$ 的其他用法

```sql
-- 可以使用不同的標記（如 $tag$）
DO $tag$
BEGIN
    -- 代碼
END $tag$;

-- 多層嵌套時很有用
DO $$
BEGIN
    -- 內層可以使用不同的標記
    EXECUTE $inner$
        SELECT * FROM "user"
    $inner$;
END $$;
```

## 🎯 實際範例

### 範例 1：檢查並清空表

```sql
DO $$
BEGIN
    -- 檢查 user 表是否存在
    IF EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'user'
    ) THEN
        -- 表存在，清空數據
        TRUNCATE TABLE "public"."user" CASCADE;
        RAISE NOTICE '已清空 user 表';
    ELSE
        -- 表不存在
        RAISE NOTICE 'user 表不存在，跳過清空操作';
    END IF;
END $$;
```

### 範例 2：動態創建索引

```sql
DO $$
BEGIN
    -- 檢查索引是否存在，不存在則創建
    IF NOT EXISTS (
        SELECT FROM pg_indexes
        WHERE schemaname = 'public'
        AND indexname = 'user_email_idx'
    ) THEN
        CREATE INDEX "user_email_idx" ON "public"."user"("email");
        RAISE NOTICE '已創建索引 user_email_idx';
    END IF;
END $$;
```

### 範例 3：批量處理多個表

```sql
DO $$
DECLARE
    table_name TEXT;
    tables_to_truncate TEXT[] := ARRAY['user', 'timelog', 'step'];
BEGIN
    FOREACH table_name IN ARRAY tables_to_truncate
    LOOP
        IF EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = table_name
        ) THEN
            EXECUTE format('TRUNCATE TABLE %I CASCADE', table_name);
            RAISE NOTICE '已清空表: %', table_name;
        END IF;
    END LOOP;
END $$;
```

## 📊 對比表

| 特性         | 單引號           | $$ 標記              |
| ------------ | ---------------- | -------------------- |
| **轉義需求** | 需要轉義（`''`） | 不需要轉義           |
| **可讀性**   | 較差             | 較好                 |
| **嵌套支持** | 困難             | 容易（使用不同標記） |
| **推薦使用** | ❌               | ✅                   |

## ⚠️ 注意事項

### 1. 事務處理

```sql
-- DO $$ 語句在一個事務中執行
DO $$
BEGIN
    TRUNCATE TABLE "public"."user";
    -- 如果這裡出錯，整個 DO $$ 語句會回滾
    TRUNCATE TABLE "public"."timelog";
END $$;
```

### 2. 錯誤處理

```sql
DO $$
BEGIN
    BEGIN
        TRUNCATE TABLE "public"."user";
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '清空表時發生錯誤: %', SQLERRM;
    END;
END $$;
```

### 3. 權限要求

```sql
-- 執行 DO $$ 需要適當的權限
-- 例如：TRUNCATE TABLE 需要表的所有者權限或 TRUNCATE 權限
```

## 🎯 總結

| 問題               | 答案                                           |
| ------------------ | ---------------------------------------------- |
| **DO $$ 是什麼？** | PostgreSQL 的匿名代碼塊語法                    |
| **為什麼需要？**   | 執行條件邏輯，處理不支持 IF EXISTS 的 SQL 語句 |
| **$$ 是什麼？**    | 美元符號標記，用於標記字符串邊界（不需要轉義） |
| **什麼時候用？**   | 需要條件執行 SQL 語句時                        |
| **替代方案？**     | 創建函數，但 DO $$ 更簡單直接                  |

**簡單來說**：`DO $$` 讓你可以寫一段「臨時的程序代碼」來執行複雜的邏輯判斷，而不需要創建正式的函數。這樣就可以在 SQL 腳本中實現「如果表存在就清空」這樣的操作。
