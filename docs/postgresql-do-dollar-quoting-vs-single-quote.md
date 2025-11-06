# PostgreSQL DO $$ vs DO ' 完整對比

## 🤔 你的疑問

> "`DO $$` 的 Dollar-quoting 可以避免轉義，所以不這樣寫的話，它要怎樣轉義？用 `DO '` 的話要再怎麼改？"

## 📚 核心概念

PostgreSQL 的 `DO` 語句需要一個字符串來包含 PL/pgSQL 代碼。有兩種方式來標記這個字符串：

1. **單引號 `'`**：需要轉義內部的單引號
2. **美元符號標記 `$$`**：不需要轉義

## ✅ 使用 DO $$（推薦）

### 語法

```sql
DO $$
BEGIN
    -- 你的 PL/pgSQL 代碼
    -- 單引號不需要轉義！
    IF EXISTS (SELECT FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'user') THEN
        TRUNCATE TABLE "public"."user" CASCADE;
    END IF;
END $$;
```

### 優點

- ✅ **不需要轉義**：字符串內的單引號可以直接寫
- ✅ **可讀性好**：代碼清晰易讀
- ✅ **支持嵌套**：可以使用不同的標記（如 `$tag$`）

## ❌ 使用 DO '（需要轉義）

### 語法

```sql
DO '
BEGIN
    -- 你的 PL/pgSQL 代碼
    -- 單引號需要轉義成兩個單引號 ''
    IF EXISTS (SELECT FROM information_schema.tables
               WHERE table_schema = ''public'' AND table_name = ''user'') THEN
        TRUNCATE TABLE "public"."user" CASCADE;
    END IF;
END ';
```

### 轉義規則

**在 SQL 字符串中，單引號需要轉義成兩個單引號 `''`**

| 你想寫的   | 實際寫法     | 說明                        |
| ---------- | ------------ | --------------------------- |
| `'public'` | `''public''` | 兩個單引號 = 一個單引號字符 |
| `'user'`   | `''user''`   | 兩個單引號 = 一個單引號字符 |

## 🔍 詳細對比

### 範例 1：簡單的條件判斷

#### 使用 DO $$（不需要轉義）

```sql
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'user') THEN
        TRUNCATE TABLE "public"."user" CASCADE;
    END IF;
END $$;
```

#### 使用 DO '（需要轉義）

```sql
DO '
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables
               WHERE table_schema = ''public'' AND table_name = ''user'') THEN
        TRUNCATE TABLE "public"."user" CASCADE;
    END IF;
END ';
```

**對比**：

- `DO $$`：`'public'` 直接寫
- `DO '`：`'public'` 需要寫成 `''public''`

### 範例 2：複雜的字符串操作

#### 使用 DO $$（不需要轉義）

```sql
DO $$
BEGIN
    DECLARE
        message TEXT := 'User table exists';
    BEGIN
        IF EXISTS (SELECT FROM information_schema.tables
                   WHERE table_schema = 'public' AND table_name = 'user') THEN
            RAISE NOTICE 'Table % exists', 'user';
            RAISE NOTICE 'Message: %', message;
        END IF;
    END;
END $$;
```

#### 使用 DO '（需要轉義）

```sql
DO '
BEGIN
    DECLARE
        message TEXT := ''User table exists'';
    BEGIN
        IF EXISTS (SELECT FROM information_schema.tables
                   WHERE table_schema = ''public'' AND table_name = ''user'') THEN
            RAISE NOTICE ''Table % exists'', ''user'';
            RAISE NOTICE ''Message: %'', message;
        END IF;
    END;
END ';
```

**對比**：

- `DO $$`：所有單引號都可以直接寫
- `DO '`：所有單引號都需要轉義成 `''`

### 範例 3：你的 migration-zeabur.sql 中的實際例子

#### 使用 DO $$（當前寫法）

```sql
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'user') THEN
        TRUNCATE TABLE "public"."user" CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'timelog') THEN
        TRUNCATE TABLE "public"."timelog" CASCADE;
    END IF;
END $$;
```

#### 使用 DO '（需要轉義的寫法）

```sql
DO '
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables
               WHERE table_schema = ''public'' AND table_name = ''user'') THEN
        TRUNCATE TABLE "public"."user" CASCADE;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables
               WHERE table_schema = ''public'' AND table_name = ''timelog'') THEN
        TRUNCATE TABLE "public"."timelog" CASCADE;
    END IF;
END ';
```

**轉義說明**：

- `'public'` → `''public''`
- `'user'` → `''user''`
- `'timelog'` → `''timelog''`

## 📊 轉義規則詳細說明

### SQL 單引號轉義規則

在 SQL 字符串中，單引號有特殊意義（標記字符串邊界），所以：

| 情況                 | 寫法    | 說明                        |
| -------------------- | ------- | --------------------------- |
| **字符串開始/結束**  | `'...'` | 標記字符串邊界              |
| **字符串內的單引號** | `''`    | 兩個單引號 = 一個單引號字符 |

### 實際例子

```sql
-- 你想寫的字符串內容：It's a beautiful day
-- 在 SQL 中需要寫成：
'It''s a beautiful day'
--   ↑↑ 兩個單引號 = 一個單引號字符

-- 你想寫的字符串內容：O'Brien
-- 在 SQL 中需要寫成：
'O''Brien'
--   ↑↑ 兩個單引號 = 一個單引號字符
```

### 在 DO ' 中的應用

```sql
-- 你想在 DO 語句中寫：table_schema = 'public'
-- 在 DO ' 中需要寫成：
DO '
BEGIN
    IF table_schema = ''public'' THEN
--                    ↑↑     ↑↑ 兩個單引號 = 一個單引號字符
        -- ...
    END IF;
END ';
```

## 🎯 為什麼需要轉義？

### 問題場景

```sql
-- ❌ 錯誤：PostgreSQL 認為字符串在這裡結束了
DO '
BEGIN
    IF table_schema = 'public' THEN
--                    ↑ 字符串在這裡結束
--  PostgreSQL 認為：'BEGIN\n    IF table_schema = ' 是一個字符串
--  然後 'public' 是另一個字符串
--  然後 ' THEN\n...' 是語法錯誤
    END IF;
END ';
```

**PostgreSQL 的解析過程**：

1. 看到第一個 `'` → 「字符串開始」
2. 讀到 `BEGIN\n    IF table_schema = ` → 「字符串內容」
3. 看到第二個 `'` → 「字符串結束」（PostgreSQL 認為這裡結束了）
4. 讀到 `public` → 「這是什麼？語法錯誤！」

### 解決方案：轉義

```sql
-- ✅ 正確：使用兩個單引號表示一個單引號字符
DO '
BEGIN
    IF table_schema = ''public'' THEN
--                    ↑↑     ↑↑ 兩個單引號 = 一個單引號字符
    END IF;
END ';
```

**PostgreSQL 的解析過程**：

1. 看到第一個 `'` → 「字符串開始」
2. 讀到 `BEGIN\n    IF table_schema = ` → 「字符串內容」
3. 看到 `''` → 「這是轉義的單引號，是字符串內容的一部分」
4. 讀到 `public` → 「字符串內容」
5. 看到 `''` → 「這是轉義的單引號，是字符串內容的一部分」
6. 讀到 ` THEN\n...` → 「字符串內容」
7. 看到最後的 `'` → 「字符串結束」
8. 結果：成功解析

## 💡 Dollar-quoting 如何避免轉義？

### 核心原理

**`$$` 是 PostgreSQL 的「美元符號標記（Dollar-quoting）」**，它用不同的方式標記字符串邊界：

```sql
-- 使用單引號：字符串邊界是 '
'這是一個字符串'

-- 使用 $$：字符串邊界是 $$
$$這是一個字符串$$
```

### 為什麼不需要轉義？

因為 `$$` 和 `'` 是不同的標記，所以：

```sql
DO $$
BEGIN
    -- 這裡面的單引號 ' 不會被誤認為字符串邊界
    -- 因為字符串邊界是 $$，不是 '
    IF table_schema = 'public' THEN
--                    ↑ 這個單引號不會被誤認為字符串邊界
        -- ...
    END IF;
END $$;
```

**對比**：

| 標記方式  | 字符串邊界 | 內部單引號 | 是否需要轉義        |
| --------- | ---------- | ---------- | ------------------- |
| `'...'`   | `'`        | `'`        | ✅ 需要轉義（`''`） |
| `$$...$$` | `$$`       | `'`        | ❌ 不需要轉義       |

## 🔬 實際測試範例

### 測試 1：簡單的 DO 語句

#### 使用 DO $$

```sql
DO $$
BEGIN
    RAISE NOTICE 'Hello, World!';
END $$;
```

#### 使用 DO '

```sql
DO '
BEGIN
    RAISE NOTICE ''Hello, World!'';
END ';
```

### 測試 2：包含多個單引號的 DO 語句

#### 使用 DO $$

```sql
DO $$
BEGIN
    DECLARE
        name TEXT := 'John''s Table';
    BEGIN
        RAISE NOTICE 'Table name: %', name;
        RAISE NOTICE 'It''s a beautiful day';
    END;
END $$;
```

**注意**：即使使用 `$$`，如果字符串**內容本身**包含單引號（如 `John's Table`），仍然需要轉義成 `''`。

#### 使用 DO '

```sql
DO '
BEGIN
    DECLARE
        name TEXT := ''John''''s Table'';
--                    ↑↑  ↑↑↑↑  ↑↑
--                    轉義的單引號  轉義的單引號
    BEGIN
        RAISE NOTICE ''Table name: %'', name;
        RAISE NOTICE ''It''''s a beautiful day'';
--                    ↑↑  ↑↑↑↑
--                    轉義的單引號
    END;
END ';
```

**說明**：

- `'John's Table'` → `''John''''s Table''`
  - `'` → `''`（字符串開始）
  - `John` → `John`
  - `'` → `''`（字符串內的單引號）
  - `s Table` → `s Table`
  - `'` → `''`（字符串結束）

## 📝 總結

### 核心概念

1. **`DO $$`**：

   - ✅ 不需要轉義字符串邊界的單引號
   - ✅ 代碼清晰易讀
   - ✅ 推薦使用

2. **`DO '`**：
   - ❌ 需要轉義所有單引號（`'` → `''`）
   - ❌ 代碼難以閱讀
   - ❌ 不推薦使用

### 轉義規則

| 情況                   | DO $$            | DO '             |
| ---------------------- | ---------------- | ---------------- |
| **字符串邊界的單引號** | 不需要轉義       | 需要轉義（`''`） |
| **字符串內容的單引號** | 需要轉義（`''`） | 需要轉義（`''`） |

### 簡單記憶

- **`DO $$`**：字符串邊界是 `$$`，所以內部的 `'` 不需要轉義
- **`DO '`**：字符串邊界是 `'`，所以內部的 `'` 需要轉義成 `''`

### 實際應用

```sql
-- ✅ 推薦：使用 DO $$
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = 'user') THEN
        TRUNCATE TABLE "public"."user" CASCADE;
    END IF;
END $$;

-- ❌ 不推薦：使用 DO '（需要轉義）
DO '
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables
               WHERE table_schema = ''public'' AND table_name = ''user'') THEN
        TRUNCATE TABLE "public"."user" CASCADE;
    END IF;
END ';
```

**記住**：使用 `DO $$` 可以避免轉義，讓代碼更清晰易讀！
