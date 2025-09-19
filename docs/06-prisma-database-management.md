# Prisma 資料庫管理教學

## 📁 相關檔案結構

```
next-one-main/
├── prisma/
│   ├── schema.prisma          # 資料庫結構定義檔
│   ├── generated/
│   │   └── client/           # Prisma 自動生成的客戶端
│   └── seed.js               # 資料庫種子檔案
├── .env                      # 環境變數配置
├── data/
│   └── create-timelog-postgresql.sql  # 手動 SQL 腳本
└── config/
    └── server.postgresql.js  # PostgreSQL 連接配置
```

## 🔧 Prisma 核心檔案說明

### 1. `prisma/schema.prisma` - 資料庫結構定義
```prisma
// 這是 Prisma 的核心檔案，定義資料庫結構
generator client {
  provider = "prisma-client-js"
  output   = "./generated/client"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
}

model TimeLog {
  id        Int      @id @default(autoincrement())
  title     String
  startTime DateTime @map("start_time")
  endTime   DateTime? @map("end_time")
  steps     Step[]
}

model Step {
  id          Int      @id @default(autoincrement())
  timeLogId   Int      @map("time_log_id")
  title       String
  description String?
  startTime   DateTime @map("start_time")
  endTime     DateTime? @map("end_time")
  timeLog     TimeLog  @relation(fields: [timeLogId], references: [id], onDelete: Cascade)
}
```

### 2. `prisma/generated/client/` - 自動生成的客戶端
- **不要手動修改** 這個目錄下的檔案
- Prisma 會根據 `schema.prisma` 自動生成
- 包含所有資料庫操作的 TypeScript 類型定義

### 3. `.env` - 環境變數配置
```env
# Prisma 使用的 PostgreSQL 資料庫連接字串
DATABASE_URL="postgresql://postgres:abc123@localhost:5432/timelog_db"
```

## 🚀 Prisma 常用指令

### 1. 生成 Prisma 客戶端
```bash
npx prisma generate
```
**作用**: 根據 `schema.prisma` 生成 TypeScript 客戶端
**何時使用**: 
- 修改 `schema.prisma` 後
- 第一次設定專案時
- 更新 Prisma 版本後

### 2. 推送資料庫結構
```bash
npx prisma db push
```
**作用**: 將 `schema.prisma` 的變更推送到資料庫
**何時使用**:
- 新增或修改資料表結構
- 新增或修改欄位
- 修改關聯關係

### 3. 強制重置資料庫
```bash
npx prisma db push --force-reset
```
**作用**: 刪除所有資料並重新建立資料表
**⚠️ 警告**: 會刪除所有現有資料！

### 4. 查看資料庫狀態
```bash
npx prisma db pull
```
**作用**: 從現有資料庫拉取結構到 `schema.prisma`

### 5. 執行種子檔案
```bash
npx prisma db seed
```
**作用**: 執行 `prisma/seed.js` 插入初始資料

## 📋 開發流程

### 1. 修改資料庫結構
```bash
# 1. 編輯 prisma/schema.prisma
# 2. 生成客戶端
npx prisma generate

# 3. 推送變更到資料庫
npx prisma db push
```

### 2. 新增資料表
```prisma
// 在 schema.prisma 中新增
model NewTable {
  id    Int    @id @default(autoincrement())
  name  String
}
```

### 3. 修改現有資料表
```prisma
// 在 schema.prisma 中修改
model TimeLog {
  id        Int      @id @default(autoincrement())
  title     String
  subtitle  String?   // 新增欄位
  startTime DateTime @map("start_time")
  endTime   DateTime? @map("end_time")
  steps     Step[]
}
```

## ⚠️ 重要提醒

### 1. 檔案同步
- **`schema.prisma`** 是唯一真實來源
- **不要手動修改** `generated/client/` 目錄
- **不要手動修改** 資料庫結構（除非必要）

### 2. 環境變數
- 確保 `.env` 中的 `DATABASE_URL` 正確
- 開發和生產環境使用不同的連接字串

### 3. 資料備份
- 執行 `--force-reset` 前先備份重要資料
- 使用版本控制管理 `schema.prisma`

### 4. 錯誤處理
```bash
# 如果遇到權限錯誤
taskkill /f /im node.exe  # Windows
# 然後重新執行
npx prisma generate
```

## 🎯 最佳實踐

### 1. 開發流程
1. 修改 `schema.prisma`
2. 執行 `npx prisma generate`
3. 執行 `npx prisma db push`
4. 測試應用程式

### 2. 團隊協作
- 將 `schema.prisma` 加入版本控制
- 不要將 `generated/` 目錄加入版本控制
- 使用 `prisma/seed.js` 提供初始資料

### 3. 生產部署
- 使用 `prisma migrate` 進行生產環境的資料庫遷移
- 確保生產環境的 `DATABASE_URL` 正確設定

## 🔍 故障排除

### 1. 權限錯誤
```bash
# Windows: 終止所有 Node.js 程序
taskkill /f /im node.exe

# 刪除生成的檔案
Remove-Item -Recurse -Force prisma\generated

# 重新生成
npx prisma generate
```

### 2. 資料庫連接錯誤
- 檢查 `.env` 中的 `DATABASE_URL`
- 確認 PostgreSQL 服務正在運行
- 檢查資料庫名稱和權限

### 3. 結構不同步
```bash
# 強制同步
npx prisma db push --force-reset
npx prisma generate
```

## 🤔 常見疑問解答

### Q1: 為什麼 API 中使用 `prisma.timeLog` 是小寫？
**A:** Prisma 會自動將模型名稱轉換為 camelCase
```prisma
model TimeLog {  // ← 定義時用 PascalCase
  // ...
}
```
```typescript
// 使用時自動轉為 camelCase
await prisma.timeLog.create()  // ← 自動轉換
```

### Q2: Prisma 怎麼知道 `timeLog` 是兩個字？
**A:** Prisma 使用智能命名轉換規則：
- **模型名稱**: `TimeLog` → `timeLog` (PascalCase → camelCase)
- **欄位名稱**: `startTime` → `start_time` (camelCase → snake_case)
- **關聯名稱**: `timeLogId` → `time_log_id`

### Q3: `DateTime` 等於 `timestamp without timezone` 嗎？
**A:** 是的！Prisma 的 `DateTime` 對應 PostgreSQL 的 `timestamp without time zone`
```prisma
startTime DateTime @map("start_time")
// 對應到資料庫: start_time TIMESTAMP WITHOUT TIME ZONE
```

### Q4: `@map` 是什麼意思？
**A:** `@map` 是 Prisma 的映射指令，用來指定資料庫中的實際欄位名稱
```prisma
model TimeLog {
  startTime DateTime @map("start_time")  // startTime → start_time
  endTime   DateTime? @map("end_time")   // endTime → end_time
}
```

### Q5: 命名規則總結
| Prisma 定義 | 資料庫實際 | 說明 |
|-------------|-----------|------|
| `TimeLog` | `TimeLog` | 模型名稱保持不變 |
| `timeLog` | `TimeLog` | 使用時轉為 camelCase |
| `startTime` | `start_time` | 欄位名稱轉為 snake_case |
| `timeLogId` | `time_log_id` | 外鍵名稱轉為 snake_case |

### Q6: 如果寫錯會怎樣？
**A:** Prisma 會報錯，常見錯誤：
- `Unknown field 'starttime'` - 欄位名稱錯誤
- `Unknown model 'timelog'` - 模型名稱錯誤
- `Column 'start_time' does not exist` - 資料庫欄位不存在

### Q7: 如何避免命名錯誤？
**A:** 
1. **使用 IDE 自動完成** - VS Code 會提供 Prisma 的智能提示
2. **檢查 Prisma 生成的類型** - 在 `prisma/generated/client` 中查看
3. **使用 `npx prisma validate`** - 驗證 schema 語法

---

**記住**: Prisma 讓你可以用程式碼管理資料庫結構，非常強大！🎉
