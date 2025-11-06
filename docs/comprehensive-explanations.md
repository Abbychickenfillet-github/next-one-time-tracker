# 轉義、Prisma 表名與 Zeabur 資料夾完整說明

## 1. 轉義（Escape）是什麼？

### 簡單理解

**轉義 = 告訴電腦「這個符號是內容，不是語法」**

### 為什麼需要轉義？

當你在程式碼中寫特殊字符時，電腦可能會誤解：

```javascript
// ❌ 錯誤：JavaScript 認為字符串在這裡結束了
const text = 'It's a beautiful day';
//                  ↑ JavaScript 看到單引號，認為字符串結束
// 結果：語法錯誤！
```

```javascript
// ✅ 正確：使用轉義告訴 JavaScript 這是內容
const text = "It's a beautiful day"
//                  ↑ 反斜線 + 單引號 = 轉義的單引號
// 結果：It's a beautiful day（正常顯示）
```

### 轉義的實際例子

#### JavaScript 中的轉義

```javascript
// 單引號轉義
'It\'s' // It's
//   ↑ 轉義符號

// 雙引號轉義
"He said \"Hello\"" // He said "Hello"
//        ↑↑     ↑↑ 轉義的雙引號

// 反斜線轉義
'C:\\Users' // C:\Users
//  ↑↑ 轉義的反斜線
```

#### SQL 中的轉義

```sql
-- ❌ 錯誤：SQL 認為字符串在這裡結束
INSERT INTO users (name) VALUES ('O'Brien');
--                              ↑ 字符串結束，後面會報錯

-- ✅ 正確：兩個單引號 = 一個單引號字符
INSERT INTO users (name) VALUES ('O''Brien');
--                              ↑↑ 轉義成兩個單引號
-- 結果：O'Brien
```

### PostgreSQL 的 $$ 標記（避免轉義）

**`$$` 是 PostgreSQL 的「美元符號標記」**，用來標記字符串邊界，**不需要轉義**：

```sql
-- ❌ 使用單引號：需要轉義
DO '
BEGIN
    IF table_schema = ''public'' THEN ...  -- 需要轉義成 ''
END ';
--                       ↑↑ 轉義成兩個單引號

-- ✅ 使用 $$：不需要轉義
DO $$
BEGIN
    IF table_schema = 'public' THEN ...  -- 直接寫，不需要轉義
END $$;
--                       ↑ 不需要轉義，直接寫即可
```

**`$$` 的用途**：

- 標記字符串邊界（告訴 PostgreSQL「這裡開始/結束字符串」）
- 避免轉義（字符串內的單引號不需要轉義）
- 更清晰（比單引號更容易閱讀）

## 2. Prisma 表名大小寫規則

### Prisma 的預設行為

**Prisma 預設會將 model 名稱（PascalCase）直接映射為資料庫表名（PascalCase）**

```prisma
model User {
  user_id String @id
}
```

**Prisma 會生成**：

- 資料庫表名：`"User"`（大寫 U，使用雙引號保持大小寫）
- Prisma Client 訪問：`prisma.user`（小寫，但映射到 `"User"` 表）

### 為什麼是大寫？

1. **Prisma 的預設規則**：

   - Model 名稱是 `User`（PascalCase）
   - Prisma 會生成 `CREATE TABLE "User"`（保持 PascalCase）

2. **PostgreSQL 的大小寫處理**：

   - 不使用引號：`CREATE TABLE User` → PostgreSQL 轉為小寫 `user`
   - 使用引號：`CREATE TABLE "User"` → PostgreSQL 保持大寫 `User`

3. **查看證據**：
   ```sql
   -- prisma/migrations/0_init/migration.sql
   CREATE TABLE "public"."User" (
       "user_id" SERIAL NOT NULL,
       ...
   );
   -- ↑ Prisma 自動生成大寫表名
   ```

### 映射成小寫的寫法

使用 `@@map` 指令：

```prisma
model User {
  user_id String @id

  @@map("user")  // ← 映射到小寫表名 "user"
}
```

**完整範例**：

```prisma
model TimeLog {
  id String @id

  @@map("timelog")  // 資料庫表名：timelog（小寫）
}

model User {
  user_id String @id

  @@map("user")  // 資料庫表名：user（小寫）
}
```

## 3. Zeabur PostgreSQL 的兩個資料夾

### 問題：為什麼有 "zeabur" 和 "postgres" 兩個資料夾？

在 Zeabur 的 PostgreSQL 中，你會看到：

```
PostgreSQL Server
├── zeabur (資料夾/資料庫) ✅ 使用這個
│   └── public (schema)
│       └── User, TimeLog, ... (tables)
└── postgres (資料夾/資料庫) ❌ 系統資料庫
    └── public (schema)
        └── (系統表，不要在這裡創建應用程式表)
```

### 原因解釋

#### **zeabur** 資料庫（✅ 使用這個）

- **這是你的應用程式資料庫**
- 由 Zeabur 自動創建，名稱通常與你的專案名稱相關
- **所有應用程式的表都應該在這裡**
- 執行 SQL 時，確保連接到 `zeabur` 資料庫

#### **postgres** 資料庫（❌ 不要用）

- **這是 PostgreSQL 的預設系統資料庫**
- 每個 PostgreSQL 實例都會有這個資料庫
- 用於 PostgreSQL 內部管理（用戶、權限、系統表等）
- **不應該在這裡創建應用程式的表**

### 如何確認？

在 pgAdmin 中：

1. 展開 Server → 你會看到多個資料庫
2. **找到 "zeabur"** → 這是你的應用程式資料庫
3. 展開：zeabur → Schemas → public → Tables
4. **確認表在這裡** → 應該看到 `User`、`TimeLog` 等表

### 在 SQL 中指定資料庫

```sql
-- 連接到 zeabur 資料庫
\c zeabur

-- 或者直接在連接字串中指定
-- DATABASE_URL="postgresql://user:pass@host:5432/zeabur"
```

## 4. Login 頁面 Placeholder 修復

### 問題原因

Login 頁面的 input 沒有 `id` 屬性，所以無法使用 ID 選擇器提高優先級。

### 解決方案

1. **添加 ID 屬性**：

   ```jsx
   <input
     type="email"
     id="login-email"  // ← 添加 ID
     ...
   />
   ```

2. **使用 ID 選擇器**：

   ```css
   #login-email.form-control::placeholder {
     color: #ffffff !important;
   }
   ```

3. **為什麼 Register 可以但 Login 不行？**
   - Register 頁面的 input 有 `id` 屬性（如 `id="email"`）
   - Login 頁面的 input 原本沒有 `id` 屬性
   - 現在已經添加了 `id="login-email"` 和 `id="login-password"`

## 📊 總結

| 問題                         | 答案                                               |
| ---------------------------- | -------------------------------------------------- |
| **轉義是什麼？**             | 用特殊方式表示特殊字符，避免被誤認為語法           |
| **$$ 標記的用途？**          | PostgreSQL 的字符串標記，避免轉義單引號            |
| **Prisma 表名規則？**        | 預設使用 model 名稱（PascalCase）作為表名          |
| **映射成小寫？**             | 使用 `@@map("小寫表名")`                           |
| **Zeabur 兩個資料夾？**      | `zeabur` = 應用程式資料庫，`postgres` = 系統資料庫 |
| **Login placeholder 問題？** | 缺少 `id` 屬性，已添加並使用 ID 選擇器             |
