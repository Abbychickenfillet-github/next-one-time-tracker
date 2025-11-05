# UUID 遷移指南

## 📋 概述

將所有資料表的 ID 從 `Int` (自動遞增整數) 改為 `UUID` (通用唯一識別碼) 需要進行以下步驟。

## ⚠️ 重要注意事項

### 1. **資料庫遷移策略**

#### 方案 A：全新專案（無需保留現有資料）

如果這是開發階段或可以接受資料清空：

```bash
# 重置資料庫
npx prisma migrate reset
npx prisma migrate dev --name convert_ids_to_uuid
npx prisma generate
```

#### 方案 B：保留現有資料（生產環境）

需要手動遷移現有資料：

1. 備份資料庫
2. 為每個表的每筆記錄生成新的 UUID
3. 更新所有外鍵關係
4. 這是一個複雜的遷移過程，建議使用自訂 SQL 遷移腳本

### 2. **程式碼變更需要修改的地方**

#### ✅ 已修改的檔案：

- `prisma/schema.prisma` - 所有 id 欄位改為 String @db.Uuid
- `services/definitions/common.js` - idSchema 改為 UUID 驗證
- `lib/utils.js` - validatedParamId 改為 UUID 驗證

#### 🔄 需要檢查的檔案類型：

**API 路由檔案** (需要移除 parseInt/Number 轉換)：

- `app/(api)/api/blogs/[blogId]/route.js`
- `app/(api)/api/timelog/[id]/route.js`
- `app/api/featured-shares/route.js`
- 其他動態路由檔案

**服務層檔案**：

- `services/blog.service.js` - 函數參數類型註解
- `services/user.service.js` - 函數參數類型註解
- 其他 service 檔案

**驗證與工具函數**：

- `services/definitions/user.js` - userId 驗證
- `lib/server.utils.js` - paramIdSchema

### 3. **前端/客戶端變更**

#### URL 參數處理：

```javascript
// ❌ 舊的方式
const blogId = Number((await params).blogId)

// ✅ 新的方式
const blogId = (await params).blogId // UUID 已經是字串，不需要轉換
```

#### 狀態管理：

- 檢查所有使用 `Number()` 或 `parseInt()` 處理 id 的地方
- `stores/useTimeLogStore.js`
- `stores/useLapTimerStore.js`
- `app/dashboard/page.js`

### 4. **資料庫遷移步驟（保留資料）**

如果需要保留現有資料，建議使用以下 SQL 遷移腳本：

```sql
-- 1. 啟用 UUID 擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 為每個表添加臨時 UUID 欄位
ALTER TABLE "Blog" ADD COLUMN "id_new" UUID;
ALTER TABLE "TimeLog" ADD COLUMN "id_new" UUID;
ALTER TABLE "Step" ADD COLUMN "id_new" UUID;
ALTER TABLE "User" ADD COLUMN "user_id_new" UUID;
ALTER TABLE "PaymentOrder" ADD COLUMN "id_new" UUID;
ALTER TABLE "FeaturedShare" ADD COLUMN "id_new" UUID;
ALTER TABLE "Otp" ADD COLUMN "id_new" UUID;

-- 3. 生成 UUID 給每筆記錄
UPDATE "Blog" SET "id_new" = uuid_generate_v4();
UPDATE "TimeLog" SET "id_new" = uuid_generate_v4();
UPDATE "Step" SET "id_new" = uuid_generate_v4();
UPDATE "User" SET "user_id_new" = uuid_generate_v4();
UPDATE "PaymentOrder" SET "id_new" = uuid_generate_v4();
UPDATE "FeaturedShare" SET "id_new" = uuid_generate_v4();
UPDATE "Otp" SET "id_new" = uuid_generate_v4();

-- 4. 更新外鍵欄位（需要根據實際外鍵關係調整）
-- 這是一個複雜的過程，需要：
-- - 建立映射表 (old_id -> new_uuid)
-- - 更新所有外鍵欄位
-- - 確保關聯關係正確

-- 5. 移除舊欄位，重命名新欄位
-- (這需要在 Prisma 遷移中完成)
```

### 5. **Prisma 遷移指令**

```bash
# 1. 修改 schema.prisma（已完成）

# 2. 建立遷移（如果是全新專案）
npx prisma migrate dev --name convert_ids_to_uuid

# 3. 或者使用自訂 SQL（如果保留資料）
# 編輯 prisma/migrations/[timestamp]_convert_ids_to_uuid/migration.sql

# 4. 重新生成 Prisma Client
npx prisma generate

# 5. 驗證變更
npx prisma studio
```

### 6. **測試清單**

完成遷移後，請測試以下功能：

- [ ] 用戶註冊與登入
- [ ] 建立、讀取、更新、刪除 TimeLog
- [ ] 建立、讀取、更新、刪除 Step
- [ ] 建立、讀取、更新、刪除 Blog
- [ ] 建立、讀取、更新、刪除 FeaturedShare
- [ ] 付款訂單建立與查詢
- [ ] 所有 API 端點的 ID 參數處理
- [ ] 前端顯示與操作

### 7. **常見問題**

#### Q: UUID 會影響查詢效能嗎？

A: 是的，UUID 的索引效能通常不如整數，但對於大多數應用程式來說影響不大。如果需要更好的效能，可以考慮使用有序 UUID (UUIDv7)。

#### Q: 現有資料如何處理？

A: 如果必須保留資料，需要：

1. 備份資料庫
2. 建立映射表
3. 手動遷移所有外鍵關係
4. 測試完整遷移流程

#### Q: UUID 格式是什麼？

A: 標準 UUID 格式：`550e8400-e29b-41d4-a716-446655440000` (36 字元)

### 8. **回滾方案**

如果需要回滾：

```bash
# 1. 還原 schema.prisma
git checkout prisma/schema.prisma

# 2. 還原資料庫遷移
npx prisma migrate resolve --rolled-back [migration_name]

# 3. 重新生成 Client
npx prisma generate
```

## 📝 檢查清單

在部署到生產環境前，確認：

- [ ] 所有 schema.prisma 的 id 欄位已改為 UUID
- [ ] 所有驗證 schema 已更新為 UUID 驗證
- [ ] 所有 parseInt/Number 轉換已移除
- [ ] 所有 API 路由已更新
- [ ] 所有服務層函數參數類型已更新
- [ ] 資料庫遷移腳本已建立（如需要）
- [ ] 已執行完整測試
- [ ] 已備份資料庫（如需要保留資料）
- [ ] 文檔已更新

## 🔗 相關資源

- [Prisma UUID 文檔](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#defining-an-id-field)
- [PostgreSQL UUID 類型](https://www.postgresql.org/docs/current/datatype-uuid.html)


