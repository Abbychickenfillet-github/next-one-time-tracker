# UUID 遷移完整步驟指南

## 🎯 目標

將所有資料表的 ID 從 `INT` 改為 `UUID`

## 📋 前置檢查

### 1. 確認 schema.prisma 已更新

✅ 所有 ID 欄位應該是：

```prisma
id String @id @default(uuid()) @db.Uuid
```

### 2. 檢查資料庫狀態

```bash
npx prisma migrate status
```

## 🚀 遷移步驟（開發環境）

### 方案 A：重置資料庫（推薦 - 清空所有資料）

**適用情況：**

- ✅ 開發環境
- ✅ 可以接受資料清空
- ✅ 有 seed 資料可以重建

**步驟：**

```bash
# 1. 重置資料庫（會刪除所有資料並重新建立）
npx prisma migrate reset

# 這會自動：
# - 刪除所有現有資料
# - 刪除所有遷移記錄
# - 根據 schema.prisma 創建新的資料庫結構
# - 執行 seed 腳本

# 2. 驗證遷移
npx prisma migrate status
# 應該顯示：Database schema is up to date

# 3. 重新生成 Prisma Client（如果需要）
npx prisma generate

# 4. 測試
npx prisma studio
```

### 方案 B：創建新的遷移（保留現有資料）

**適用情況：**

- ✅ 有重要資料需要保留
- ✅ 生產環境或測試環境

**⚠️ 警告：這很複雜，需要手動處理資料遷移**

```bash
# 1. 先應用現有遷移（如果還沒應用）
npx prisma migrate deploy

# 2. 創建新的遷移檔案（不自動應用）
npx prisma migrate dev --name convert_ids_to_uuid --create-only

# 3. 編輯遷移 SQL 檔案
# 檔案位置：prisma/migrations/[timestamp]_convert_ids_to_uuid/migration.sql
# 需要手動編寫複雜的 SQL 來遷移資料

# 4. 應用遷移
npx prisma migrate dev
```

**手動遷移 SQL 範例（僅供參考，需要根據實際情況調整）：**

```sql
-- 啟用 UUID 擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 步驟 1: 添加臨時 UUID 欄位
ALTER TABLE "User" ADD COLUMN "user_id_new" UUID;
ALTER TABLE "TimeLog" ADD COLUMN "id_new" UUID;
ALTER TABLE "Step" ADD COLUMN "id_new" UUID;
-- ... 其他表

-- 步驟 2: 生成 UUID 給每筆記錄
UPDATE "User" SET "user_id_new" = gen_random_uuid();
UPDATE "TimeLog" SET "id_new" = gen_random_uuid();
-- ... 其他表

-- 步驟 3: 建立映射表（用於更新外鍵）
-- 這部分非常複雜，需要處理所有外鍵關係

-- 步驟 4: 刪除舊的主鍵和外鍵約束

-- 步驟 5: 更新欄位類型並重命名

-- 步驟 6: 重新建立約束

-- 步驟 7: 刪除臨時欄位
```

## 🔧 推薦步驟（最簡單）

對於開發環境，**強烈建議使用重置方式**：

```bash
# 一步完成所有操作
npx prisma migrate reset
```

### 如果重置後還有問題：

```bash
# 1. 手動刪除所有遷移（僅開發環境）
rm -rf prisma/migrations/*

# 2. 創建初始遷移
npx prisma migrate dev --name init

# 3. 執行 seed
npm run seed
```

## 📝 遷移後驗證清單

執行遷移後，請確認：

- [ ] `npx prisma migrate status` 顯示 "Database schema is up to date"
- [ ] `npx prisma studio` 可以正常開啟並顯示資料
- [ ] 所有 ID 欄位顯示為 UUID 格式（如：`550e8400-e29b-41d4-a716-446655440000`）
- [ ] `npm run seed` 執行成功
- [ ] 應用程式可以正常啟動 (`npm run dev`)
- [ ] 用戶登入功能正常
- [ ] API 端點可以正常查詢資料

## ⚠️ 常見問題

### Q1: 重置後資料都不見了？

A: 這是正常的。重置會清空所有資料。如果有 seed 腳本，它會自動執行並重新建立測試資料。

### Q2: 遷移失敗怎麼辦？

A:

```bash
# 檢查錯誤訊息
npx prisma migrate status

# 如果需要，可以標記遷移為已解決
npx prisma migrate resolve --applied [migration_name]

# 或標記為已回滾
npx prisma migrate resolve --rolled-back [migration_name]
```

### Q3: Prisma Studio 仍然顯示錯誤？

A:

```bash
# 重新生成 Prisma Client
npx prisma generate

# 重新啟動 Prisma Studio
npx prisma studio
```

## 🎯 快速參考

```bash
# 重置資料庫（開發環境推薦）
npx prisma migrate reset

# 檢查遷移狀態
npx prisma migrate status

# 重新生成 Client
npx prisma generate

# 執行 seed
npm run seed

# 開啟 Prisma Studio 驗證
npx prisma studio
```



