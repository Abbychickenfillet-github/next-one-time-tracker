# Prisma 表名映射與 Zeabur 資料夾說明

## 1. Prisma 表名映射成小寫的寫法

### 使用 @@map 指令

在 Prisma schema 中，使用 `@@map` 指令可以將 model 名稱映射到不同的資料庫表名：

```prisma
model User {
  user_id String @id
  email   String

  @@map("user")  // ← 映射到小寫表名 "user"
}
```

### 完整範例

```prisma
// 映射到小寫表名
model TimeLog {
  id String @id

  @@map("timelog")  // 資料庫表名：timelog（小寫）
}

model User {
  user_id String @id

  @@map("user")  // 資料庫表名：user（小寫）
}

model PaymentOrder {
  id String @id

  @@map("paymentorder")  // 資料庫表名：paymentorder（小寫）
}
```

### 不使用 @@map（預設行為）

```prisma
// 不使用 @@map，Prisma 會使用 model 名稱作為表名
model User {
  user_id String @id
  // 沒有 @@map
}

// Prisma 會生成：CREATE TABLE "User"（大寫）
```

## 2. Zeabur PostgreSQL 的兩個資料夾說明

### 問題：為什麼有 "zeabur" 和 "postgres" 兩個資料夾？

在 Zeabur 的 PostgreSQL 資料庫中，你可能會看到：

```
PostgreSQL Server
├── zeabur (資料夾)
│   └── public (schema)
│       └── User, TimeLog, ... (tables)
└── postgres (資料夾)
    └── public (schema)
        └── (可能是空的或系統表)
```

### 原因解釋

#### 1. **zeabur** 資料夾

- **這是你的應用程式資料庫**
- 由 Zeabur 自動創建，名稱通常與你的專案或服務名稱相關
- **這是你要使用的資料庫** ✅
- 所有應用程式的表都應該在這裡

#### 2. **postgres** 資料夾

- **這是 PostgreSQL 的預設系統資料庫**
- 每個 PostgreSQL 實例都會有這個資料庫
- 用於 PostgreSQL 內部管理（用戶、權限等）
- **不應該在這裡創建應用程式的表** ❌

### 如何選擇？

**✅ 正確：使用 "zeabur" 資料庫**

- 這是你的應用程式資料庫
- 執行 SQL 時，確保連接到 "zeabur" 資料庫
- 所有表都應該在 `zeabur.public` schema 中

**❌ 錯誤：使用 "postgres" 資料庫**

- 這是系統資料庫
- 不應該在這裡創建應用程式表
- 可能會造成混淆

### 在 pgAdmin 中確認

1. **展開 Server** → 你會看到多個資料庫
2. **找到 "zeabur"** → 這是你的應用程式資料庫
3. **展開 zeabur** → Databases → zeabur → Schemas → public → Tables
4. **確認表在這裡** → 應該看到 `User`、`TimeLog` 等表

### 在 SQL 中指定資料庫

```sql
-- 連接到 zeabur 資料庫
\c zeabur

-- 或者直接在連接字串中指定
-- DATABASE_URL="postgresql://user:pass@host:5432/zeabur"
```

## 📊 總結

| 問題                      | 答案                                               |
| ------------------------- | -------------------------------------------------- |
| **映射成小寫的寫法？**    | 使用 `@@map("小寫表名")`                           |
| **Zeabur 的兩個資料夾？** | `zeabur` = 應用程式資料庫，`postgres` = 系統資料庫 |
| **應該用哪個？**          | 使用 `zeabur` 資料庫                               |
