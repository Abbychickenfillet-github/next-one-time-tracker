# Prisma vs PostgreSQL 語法差異完整說明

## 📚 概述

**Prisma** 是一個 **ORM（Object-Relational Mapping）工具**，它使用自己的語法來定義資料庫結構，然後**自動生成**對應的 PostgreSQL SQL 語句。

## 🎯 核心差異

| 特性         | Prisma                | PostgreSQL          |
| ------------ | --------------------- | ------------------- |
| **語法類型** | 聲明式（聲明結構）    | 命令式（執行命令）  |
| **檔案格式** | `.prisma`（專用格式） | `.sql`（標準 SQL）  |
| **自動生成** | ✅ 自動生成 SQL       | ❌ 手動編寫 SQL     |
| **類型系統** | Prisma 類型           | PostgreSQL 原生類型 |

## 📝 詳細對比

### 1. 資料表定義

#### Prisma 語法

```prisma
model User {
  user_id  String  @id @default(uuid()) @map("user_id") @db.Uuid
  name     String?
  email    String  @unique
  createdAt DateTime @default(now()) @map("created_at")

  @@index([email])
}
```

#### PostgreSQL 語法

```sql
CREATE TABLE "public"."User" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");
CREATE INDEX "User_email_idx" ON "public"."User"("email");
```

**差異說明**：

- Prisma：使用 `model` 關鍵字，聲明式語法
- PostgreSQL：使用 `CREATE TABLE`，命令式語法
- Prisma：自動生成主鍵約束和索引
- PostgreSQL：需要手動創建約束和索引

### 2. 資料類型對應

#### Prisma 類型 → PostgreSQL 類型

| Prisma 類型       | PostgreSQL 類型    | 說明               |
| ----------------- | ------------------ | ------------------ |
| `String`          | `TEXT`             | 字符串             |
| `String @db.Uuid` | `UUID`             | UUID 類型          |
| `Int`             | `INTEGER`          | 整數               |
| `Boolean`         | `BOOLEAN`          | 布林值             |
| `DateTime`        | `TIMESTAMP(3)`     | 時間戳（毫秒精度） |
| `Json`            | `JSONB`            | JSON 數據          |
| `Float`           | `DOUBLE PRECISION` | 浮點數             |

**範例**：

```prisma
// Prisma
model Product {
  id        String   @id @default(uuid()) @db.Uuid
  name      String
  price     Int
  rating    Float?
  metadata  Json
  createdAt DateTime @default(now())
}
```

```sql
-- PostgreSQL
CREATE TABLE "public"."Product" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION,
    "metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
```

### 3. 主鍵定義

#### Prisma 語法

```prisma
model User {
  user_id String @id @default(uuid()) @db.Uuid
  // 或
  id      Int    @id @default(autoincrement())
}
```

#### PostgreSQL 語法

```sql
-- UUID 主鍵
CREATE TABLE "public"."User" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- SERIAL 主鍵（自動遞增）
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
```

**差異說明**：

- Prisma：`@id` 標記主鍵，`@default(uuid())` 或 `@default(autoincrement())` 設定預設值
- PostgreSQL：`PRIMARY KEY` 約束，`SERIAL` 或 `gen_random_uuid()` 設定預設值

### 4. 外鍵關係

#### Prisma 語法

```prisma
model TimeLog {
  id     String  @id @default(uuid()) @db.Uuid
  userId String? @map("user_id") @db.Uuid
  user   User?   @relation(fields: [userId], references: [user_id], onDelete: Cascade)
}

model User {
  user_id  String    @id @default(uuid()) @db.Uuid
  timeLogs TimeLog[]
}
```

#### PostgreSQL 語法

```sql
CREATE TABLE "public"."TimeLog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,

    CONSTRAINT "TimeLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."User" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- 外鍵約束（分開創建）
ALTER TABLE "public"."TimeLog"
ADD CONSTRAINT "TimeLog_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "public"."User"("user_id")
ON DELETE CASCADE
ON UPDATE CASCADE;
```

**差異說明**：

- Prisma：使用 `@relation` 定義關係，`onDelete: Cascade` 設定級聯刪除
- PostgreSQL：使用 `ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY` 創建外鍵
- Prisma：自動生成雙向關係（`user` 和 `timeLogs`）
- PostgreSQL：需要手動創建外鍵約束

### 5. 索引定義

#### Prisma 語法

```prisma
model User {
  email String @unique

  @@index([email])
  @@index([name, email])  // 複合索引
}
```

#### PostgreSQL 語法

```sql
-- 唯一索引
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- 普通索引
CREATE INDEX "User_email_idx" ON "public"."User"("email");

-- 複合索引
CREATE INDEX "User_name_email_idx" ON "public"."User"("name", "email");
```

**差異說明**：

- Prisma：`@unique` 自動創建唯一索引，`@@index` 創建普通索引
- PostgreSQL：需要手動使用 `CREATE INDEX` 或 `CREATE UNIQUE INDEX`
- Prisma：複合索引使用 `@@index([field1, field2])`
- PostgreSQL：複合索引使用 `CREATE INDEX ... ON table(field1, field2)`

### 6. 預設值

#### Prisma 語法

```prisma
model User {
  level     Int      @default(0)
  valid     Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### PostgreSQL 語法

```sql
CREATE TABLE "public"."User" (
    "level" INTEGER NOT NULL DEFAULT 0,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);
```

**差異說明**：

- Prisma：`@default(now())` 自動設定當前時間
- PostgreSQL：`DEFAULT CURRENT_TIMESTAMP` 設定當前時間
- Prisma：`@updatedAt` 自動更新時間戳
- PostgreSQL：需要手動使用觸發器或應用層邏輯

### 7. 可選欄位（Nullable）

#### Prisma 語法

```prisma
model User {
  name  String?  // 可選（Nullable）
  email String   // 必填（NOT NULL）
}
```

#### PostgreSQL 語法

```sql
CREATE TABLE "public"."User" (
    "name" TEXT,           -- 可選（Nullable）
    "email" TEXT NOT NULL  -- 必填（NOT NULL）
);
```

**差異說明**：

- Prisma：`String?` 表示可選（Nullable），`String` 表示必填（NOT NULL）
- PostgreSQL：不加 `NOT NULL` 表示可選，加 `NOT NULL` 表示必填

### 8. 欄位名稱映射

#### Prisma 語法

```prisma
model User {
  userId    String @map("user_id")
  createdAt DateTime @map("created_at")
}
```

#### PostgreSQL 語法

```sql
CREATE TABLE "public"."User" (
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL
);
```

**差異說明**：

- Prisma：使用 `@map` 將 camelCase 欄位名映射到 snake_case 資料庫欄位名
- PostgreSQL：直接使用資料庫欄位名（通常是 snake_case）

### 9. 表名映射

#### Prisma 語法

```prisma
model TimeLog {
  // ...
  @@map("timelog")  // 映射到小寫表名
}
```

#### PostgreSQL 語法

```sql
CREATE TABLE "public"."timelog" (
    -- ...
);
```

**差異說明**：

- Prisma：使用 `@@map` 將 PascalCase model 名稱映射到資料庫表名
- PostgreSQL：直接使用表名（Prisma 預設使用 PascalCase，如 `"TimeLog"`）

### 10. 級聯操作

#### Prisma 語法

```prisma
model TimeLog {
  user User @relation(fields: [userId], references: [user_id], onDelete: Cascade)
}
```

#### PostgreSQL 語法

```sql
ALTER TABLE "public"."TimeLog"
ADD CONSTRAINT "TimeLog_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "public"."User"("user_id")
ON DELETE CASCADE
ON UPDATE CASCADE;
```

**差異說明**：

- Prisma：`onDelete: Cascade` 設定級聯刪除
- PostgreSQL：`ON DELETE CASCADE` 設定級聯刪除
- Prisma：`onUpdate: Cascade` 設定級聯更新（預設）
- PostgreSQL：`ON UPDATE CASCADE` 設定級聯更新

## 🔄 Prisma 生成 SQL 的過程

### 步驟 1：定義 Prisma Schema

```prisma
model User {
  user_id String @id @default(uuid()) @map("user_id") @db.Uuid
  email   String @unique
}
```

### 步驟 2：執行 Prisma Migrate

```bash
npx prisma migrate dev --name init
```

### 步驟 3：Prisma 自動生成 SQL

```sql
-- CreateTable
CREATE TABLE "public"."User" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");
```

## 📊 語法對照表

| 功能         | Prisma                      | PostgreSQL                       |
| ------------ | --------------------------- | -------------------------------- |
| **創建表**   | `model User { ... }`        | `CREATE TABLE "User" (...)`      |
| **主鍵**     | `@id`                       | `PRIMARY KEY`                    |
| **UUID**     | `@default(uuid()) @db.Uuid` | `UUID DEFAULT gen_random_uuid()` |
| **自動遞增** | `@default(autoincrement())` | `SERIAL`                         |
| **可選欄位** | `String?`                   | `TEXT`（不加 NOT NULL）          |
| **必填欄位** | `String`                    | `TEXT NOT NULL`                  |
| **唯一索引** | `@unique`                   | `CREATE UNIQUE INDEX`            |
| **普通索引** | `@@index([field])`          | `CREATE INDEX`                   |
| **外鍵**     | `@relation(...)`            | `FOREIGN KEY ... REFERENCES`     |
| **級聯刪除** | `onDelete: Cascade`         | `ON DELETE CASCADE`              |
| **欄位映射** | `@map("field_name")`        | 直接使用欄位名                   |
| **表名映射** | `@@map("table_name")`       | 直接使用表名                     |
| **預設值**   | `@default(value)`           | `DEFAULT value`                  |
| **時間戳**   | `@default(now())`           | `DEFAULT CURRENT_TIMESTAMP`      |

## 🎯 為什麼使用 Prisma？

### 優點

1. **類型安全**：TypeScript/JavaScript 類型自動生成
2. **自動遷移**：自動生成 SQL 遷移檔案
3. **簡潔語法**：聲明式語法，更容易閱讀
4. **關係管理**：自動處理雙向關係
5. **跨資料庫**：支援多種資料庫（PostgreSQL、MySQL、SQLite 等）

### 缺點

1. **學習曲線**：需要學習 Prisma 語法
2. **抽象層**：隱藏了 SQL 細節，可能影響性能調優
3. **遷移複雜**：複雜的資料庫操作可能需要手動 SQL

## 📝 總結

**Prisma vs PostgreSQL**：

- **Prisma**：聲明式語法，自動生成 SQL，適合快速開發
- **PostgreSQL**：命令式語法，手動編寫 SQL，適合精細控制

**選擇建議**：

- ✅ **使用 Prisma**：快速開發、類型安全、自動遷移
- ✅ **使用 PostgreSQL**：複雜查詢、性能調優、精細控制

**最佳實踐**：

- 使用 Prisma 定義結構和基本操作
- 複雜查詢或性能關鍵操作使用原生 SQL
- 兩者結合使用，發揮各自優勢
