# Prisma 表名大小寫規則說明

## 📚 Prisma 的預設行為

### Prisma 的預設表名規則

**Prisma 預設會將 model 名稱直接映射為資料庫表名，保持大小寫一致。**

```prisma
model User {
  // ...
}
```

**Prisma 會生成：**

- 資料庫表名：`"User"`（大寫 U，使用雙引號保持大小寫）
- Prisma Client 訪問：`prisma.user`（小寫，但映射到 `"User"` 表）

### 為什麼是大寫？

1. **Prisma 的預設行為**：

   - Prisma 會將 model 名稱（PascalCase）直接映射為表名
   - 如果 model 是 `User`，表名就是 `"User"`（帶雙引號）

2. **PostgreSQL 的大小寫處理**：

   - 不使用引號：`CREATE TABLE User` → PostgreSQL 會轉為小寫 `user`
   - 使用引號：`CREATE TABLE "User"` → PostgreSQL 保持大寫 `User`

3. **Prisma 的遷移檔案**：
   - Prisma 生成的遷移檔案會自動使用雙引號：`CREATE TABLE "public"."User"`
   - 這樣可以保持表名的大小寫

## 🔍 證據來源

### 1. 查看 Prisma 生成的遷移檔案

```sql
-- prisma/migrations/0_init/migration.sql
CREATE TABLE "public"."User" (
    "user_id" SERIAL NOT NULL,
    ...
);
-- ↑ Prisma 自動生成大寫表名，並使用雙引號
```

### 2. Prisma 官方文檔規則

根據 Prisma 的預設行為：

- **Model 名稱**：PascalCase（如 `User`、`TimeLog`）
- **資料庫表名**：與 Model 名稱相同（如 `"User"`、`"TimeLog"`）
- **Prisma Client**：camelCase（如 `prisma.user`、`prisma.timeLog`）

### 3. 使用 @@map 可以改變表名

```prisma
model User {
  // ...
  @@map("user")  // 映射到小寫表名 "user"
}
```

**如果不使用 `@@map`**：

- Prisma 預設使用 model 名稱作為表名
- `model User` → 表名 `"User"`（大寫）

## 📊 對比表

| 設定                   | Model 名稱 | 資料庫表名 | Prisma Client |
| ---------------------- | ---------- | ---------- | ------------- |
| **預設（無 @@map）**   | `User`     | `"User"`   | `prisma.user` |
| **使用 @@map("user")** | `User`     | `"user"`   | `prisma.user` |

## 🎯 為什麼你的專案必須用大寫？

1. **歷史原因**：

   - 你的 `migration.sql` 中表名是大寫：`"User"`、`"TimeLog"`
   - Prisma 生成的遷移檔案預設就是大寫

2. **一致性**：

   - 如果資料庫中表名是大寫，Prisma schema 也應該匹配
   - 否則會找不到表

3. **最佳實踐**：
   - 雖然 PostgreSQL 推薦小寫表名
   - 但如果已經使用大寫，保持一致性更重要

## 📝 總結

**Prisma 的預設規則**：

- ✅ Model 名稱（PascalCase）→ 資料庫表名（PascalCase，帶雙引號）
- ✅ 這是 Prisma 的**預設行為**，不是你的設定
- ✅ 如果要改為小寫，需要使用 `@@map("小寫表名")`

**你的情況**：

- 資料庫表名是大寫（`"User"`）
- Prisma schema 沒有 `@@map`
- 所以 Prisma 預設會尋找大寫表名 `"User"`
- ✅ 這是正確的！
