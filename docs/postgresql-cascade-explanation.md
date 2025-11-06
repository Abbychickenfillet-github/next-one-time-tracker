# PostgreSQL CASCADE 完整說明

## 📚 CASCADE 是什麼？

**CASCADE** 是 PostgreSQL 中的一個關鍵字，用於**級聯操作**，意思是「自動處理相關的依賴對象」。

## ⚠️ 重要澄清

**CASCADE 不會刪除子表本身，而是刪除子表中的相關記錄或依賴對象！**

## 🎯 CASCADE 的三種使用場景

### 1. DROP TABLE CASCADE（刪除表時）

**作用**：刪除表及其所有依賴對象（外鍵約束、索引、視圖等）

```sql
DROP TABLE IF EXISTS "public"."User" CASCADE;
```

**會發生什麼**：

- ✅ 刪除 `User` 表
- ✅ 自動刪除所有引用 `User` 表的外鍵約束
- ✅ 自動刪除所有依賴 `User` 表的視圖、函數等
- ❌ **不會刪除子表本身**（如 `TimeLog` 表仍然存在，只是外鍵約束被刪除）

**實際例子**：

```sql
-- 假設有這樣的關係：
-- User (父表)
--   └── TimeLog (子表，有外鍵指向 User)

DROP TABLE "User" CASCADE;
-- 結果：
-- ✅ User 表被刪除
-- ✅ TimeLog 表的外鍵約束被刪除
-- ✅ TimeLog 表本身仍然存在（但 user_id 欄位變成普通欄位）
```

### 2. TRUNCATE TABLE CASCADE（清空表時）

**作用**：清空表及其所有相關表的數據

```sql
TRUNCATE TABLE "public"."User" CASCADE;
```

**會發生什麼**：

- ✅ 清空 `User` 表的所有數據
- ✅ 自動清空所有引用 `User` 表的子表數據（如 `TimeLog`、`PaymentOrder` 等）
- ❌ **不會刪除表結構**（表仍然存在，只是數據被清空）

**實際例子**：

```sql
-- 假設有這樣的關係：
-- User (父表)
--   ├── TimeLog (子表，有外鍵指向 User)
--   └── PaymentOrder (子表，有外鍵指向 User)

TRUNCATE TABLE "User" CASCADE;
-- 結果：
-- ✅ User 表的所有記錄被刪除
-- ✅ TimeLog 表的所有記錄被刪除（因為外鍵指向 User）
-- ✅ PaymentOrder 表的所有記錄被刪除（因為外鍵指向 User）
-- ✅ 所有表結構仍然存在
```

### 3. ON DELETE CASCADE（外鍵約束）

**作用**：當父表記錄被刪除時，自動刪除子表的相關記錄

```sql
ALTER TABLE "public"."TimeLog"
ADD CONSTRAINT "TimeLog_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "public"."User"("user_id")
ON DELETE CASCADE
ON UPDATE CASCADE;
```

**會發生什麼**：

- ✅ 當 `User` 表中的某個用戶被刪除時
- ✅ 自動刪除 `TimeLog` 表中所有 `user_id` 匹配的記錄
- ❌ **不會刪除 `TimeLog` 表本身**（只是刪除相關記錄）

**實際例子**：

```sql
-- 假設數據：
-- User 表：
--   user_id: 1, name: "Alice"
--   user_id: 2, name: "Bob"

-- TimeLog 表：
--   id: 1, user_id: 1, title: "Work"
--   id: 2, user_id: 1, title: "Study"
--   id: 3, user_id: 2, title: "Exercise"

-- 執行：
DELETE FROM "User" WHERE user_id = 1;

-- 結果（因為 ON DELETE CASCADE）：
-- ✅ User 表中 user_id=1 的記錄被刪除
-- ✅ TimeLog 表中 id=1 和 id=2 的記錄被自動刪除（因為 user_id=1）
-- ✅ TimeLog 表中 id=3 的記錄保留（因為 user_id=2）
-- ✅ TimeLog 表本身仍然存在
```

## 📊 三種 CASCADE 的對比

| 場景                       | 語法                             | 作用                                 | 是否刪除子表  |
| -------------------------- | -------------------------------- | ------------------------------------ | ------------- |
| **DROP TABLE CASCADE**     | `DROP TABLE "User" CASCADE;`     | 刪除表及其依賴對象                   | ❌ 不刪除子表 |
| **TRUNCATE TABLE CASCADE** | `TRUNCATE TABLE "User" CASCADE;` | 清空表及其相關表的數據               | ❌ 不刪除子表 |
| **ON DELETE CASCADE**      | `ON DELETE CASCADE`              | 刪除父表記錄時，自動刪除子表相關記錄 | ❌ 不刪除子表 |

## 🔍 你的 migration-zeabur.sql 中的 CASCADE

### 1. DROP TABLE CASCADE（第 43-49 行，55-62 行）

```sql
DROP TABLE IF EXISTS "public"."user" CASCADE;
DROP TABLE IF EXISTS "public"."timelog" CASCADE;
```

**作用**：

- 刪除表（如果存在）
- 自動刪除所有依賴對象（外鍵約束、索引等）
- **不會刪除其他表**，只是刪除依賴關係

### 2. TRUNCATE TABLE CASCADE（第 20-38 行）

```sql
TRUNCATE TABLE "public"."user" CASCADE;
```

**作用**：

- 清空 `user` 表的所有數據
- 自動清空所有引用 `user` 表的子表數據（如 `timelog`、`paymentorder` 等）
- **不會刪除表結構**

### 3. ON DELETE CASCADE（第 238-256 行）

```sql
ALTER TABLE "public"."TimeLog"
ADD CONSTRAINT "TimeLog_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "public"."User"("user_id")
ON DELETE CASCADE
ON UPDATE CASCADE;
```

**作用**：

- 當 `User` 表中的某個用戶被刪除時
- 自動刪除 `TimeLog` 表中所有相關的記錄
- **不會刪除 `TimeLog` 表本身**

## 🎯 常見誤解

### ❌ 誤解 1：CASCADE 會刪除子表

**錯誤理解**：

> "如果父表被刪除，子表也會被刪除"

**正確理解**：

- `DROP TABLE CASCADE` 只會刪除表及其依賴對象，**不會刪除子表本身**
- 子表仍然存在，只是外鍵約束被刪除

### ❌ 誤解 2：ON DELETE CASCADE 會刪除整個子表

**錯誤理解**：

> "如果父表記錄被刪除，整個子表也會被刪除"

**正確理解**：

- `ON DELETE CASCADE` 只會刪除子表中**相關的記錄**
- 子表本身仍然存在，只是數據被刪除

## 📝 實際應用場景

### 場景 1：用戶註銷

```sql
-- 當用戶註銷時，希望刪除該用戶的所有相關數據
-- User 表：user_id = 1
-- TimeLog 表：有 10 筆記錄的 user_id = 1
-- PaymentOrder 表：有 3 筆記錄的 user_id = 1

DELETE FROM "User" WHERE user_id = 1;
-- 因為 ON DELETE CASCADE：
-- ✅ TimeLog 表中的 10 筆記錄被自動刪除
-- ✅ PaymentOrder 表中的 3 筆記錄被自動刪除（如果外鍵是 CASCADE）
-- ✅ User 表中的記錄被刪除
-- ✅ 所有表結構仍然存在
```

### 場景 2：重置資料庫

```sql
-- 清空所有數據，但保留表結構
TRUNCATE TABLE "User" CASCADE;
-- 結果：
-- ✅ User 表的所有記錄被清空
-- ✅ TimeLog 表的所有記錄被清空（因為外鍵指向 User）
-- ✅ PaymentOrder 表的所有記錄被清空（因為外鍵指向 User）
-- ✅ 所有表結構仍然存在
```

### 場景 3：刪除表結構

```sql
-- 完全刪除表及其所有依賴
DROP TABLE "User" CASCADE;
-- 結果：
-- ✅ User 表被刪除
-- ✅ TimeLog 表的外鍵約束被刪除（但 TimeLog 表仍然存在）
-- ✅ PaymentOrder 表的外鍵約束被刪除（但 PaymentOrder 表仍然存在）
```

## 🎯 總結

**CASCADE 的核心概念**：

1. **DROP TABLE CASCADE**：

   - 刪除表及其依賴對象
   - ❌ 不會刪除子表本身

2. **TRUNCATE TABLE CASCADE**：

   - 清空表及其相關表的數據
   - ❌ 不會刪除表結構

3. **ON DELETE CASCADE**：
   - 刪除父表記錄時，自動刪除子表相關記錄
   - ❌ 不會刪除子表本身

**簡單記憶**：

- CASCADE = 級聯操作，自動處理相關依賴
- **不會刪除子表本身**，只會刪除依賴關係或相關數據
