# UUID 遷移故障排除指南

## 🔴 當前錯誤

```
Error: insufficient data left in message (PostgreSQL code: 08P01)
```

### 問題根源

1. **資料庫結構不匹配**：資料庫中的 ID 欄位仍然是 `INT` 類型
2. **Prisma Client 已更新**：已經生成了期望 UUID 的 Client
3. **遷移未執行**：`0_init` 遷移未應用，且需要新的 UUID 遷移

## ✅ 解決方案

### 方案 A：開發環境 - 重置資料庫（推薦）

**如果你可以接受清空所有資料：**

```bash
# 1. 重置資料庫（會刪除所有資料並重新建立）
npx prisma migrate reset

# 2. 這會自動：
#    - 刪除所有資料
#    - 應用所有遷移
#    - 執行 seed
```

### 方案 B：創建新的 UUID 遷移

**如果需要保留資料（但這很複雜）：**

```bash
# 1. 先應用現有遷移
npx prisma migrate deploy

# 2. 創建新的 UUID 遷移
npx prisma migrate dev --name convert_ids_to_uuid --create-only

# 3. 手動編輯遷移 SQL（這很複雜，需要遷移所有資料）
# 編輯 prisma/migrations/[timestamp]_convert_ids_to_uuid/migration.sql

# 4. 應用遷移
npx prisma migrate deploy
```

## 📋 建議步驟（開發環境）

### 步驟 1：備份現有資料（如果需要）

```bash
# 如果有重要資料，先備份
pg_dump -U postgres timelog_db > backup.sql
```

### 步驟 2：重置資料庫

```bash
npx prisma migrate reset
```

這會：
- ✅ 刪除所有現有資料
- ✅ 應用所有遷移（包括 UUID）
- ✅ 自動執行 seed（如果設定正確）

### 步驟 3：驗證

```bash
# 檢查遷移狀態
npx prisma migrate status

# 應該顯示：Database schema is up to date
```

### 步驟 4：測試

```bash
# 啟動 Prisma Studio 驗證
npx prisma studio

# 或啟動開發伺服器
npm run dev
```

## ⚠️ 注意事項

### 如果選擇重置資料庫：

1. **所有資料會被刪除**
2. **需要重新執行 seed**
3. **用戶需要重新註冊**

### 如果選擇保留資料：

需要執行複雜的資料遷移：
1. 為每個表的每筆記錄生成 UUID
2. 更新所有外鍵關係
3. 確保資料一致性

## 🔧 詳細遷移步驟（保留資料）

如果你想保留資料，步驟如下：

### 1. 創建遷移檔案

```bash
npx prisma migrate dev --name convert_ids_to_uuid --create-only
```

### 2. 編輯遷移 SQL

你需要手動編輯 `prisma/migrations/[timestamp]_convert_ids_to_uuid/migration.sql`：

```sql
-- 啟用 UUID 擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 為每個表添加臨時 UUID 欄位
ALTER TABLE "User" ADD COLUMN "user_id_temp" UUID;
ALTER TABLE "TimeLog" ADD COLUMN "id_temp" UUID;
ALTER TABLE "Step" ADD COLUMN "id_temp" UUID;
-- ... 其他表

-- 2. 生成 UUID
UPDATE "User" SET "user_id_temp" = gen_random_uuid();
UPDATE "TimeLog" SET "id_temp" = gen_random_uuid();
-- ... 其他表

-- 3. 更新外鍵（這是最複雜的部分）
-- 需要建立映射表來追蹤舊 ID -> 新 UUID

-- 4. 刪除舊的主鍵約束和外鍵約束

-- 5. 更新主鍵欄位類型

-- 6. 更新外鍵欄位類型

-- 7. 重新建立約束

-- 8. 刪除臨時欄位
```

這是一個非常複雜的過程，建議：
- **開發環境**：使用 `migrate reset`
- **生產環境**：謹慎計劃，可能需要停機維護

## 🎯 推薦做法

對於開發環境，**最簡單且最安全的方式**是：

```bash
# 一步到位
npx prisma migrate reset
```

這會自動處理所有事情，包括：
- ✅ 重置資料庫結構
- ✅ 應用所有遷移
- ✅ 執行 seed 腳本
- ✅ 確保一切正常

## 📝 檢查清單

執行遷移後，確認：

- [ ] `npx prisma migrate status` 顯示 "up to date"
- [ ] `npx prisma studio` 可以正常開啟
- [ ] 所有 ID 欄位顯示為 UUID 格式
- [ ] 可以成功執行 seed
- [ ] 應用程式可以正常啟動
- [ ] 用戶登入功能正常

## 🆘 如果還有問題

如果重置後仍有問題，檢查：

1. **Prisma Client 是否重新生成**
   ```bash
   npx prisma generate
   ```

2. **資料庫連接是否正常**
   ```bash
   npx prisma db pull
   ```

3. **檢查 schema.prisma 是否正確**
   - 所有 ID 欄位應該是 `String @db.Uuid`
   - 所有外鍵欄位應該是 `String? @db.Uuid`



