# 資料庫命名最佳實踐

## 命名方式比較

### 1. 各種命名方式

| 命名方式 | 範例 | 優點 | 缺點 |
|----------|------|------|------|
| **snake_case** | `timelog_db` | ✅ 資料庫標準<br>✅ 易讀<br>✅ 跨平台相容 | ❌ 與程式碼風格不一致 |
| **kebab-case** | `timelog-db` | ✅ 易讀<br>✅ URL 友善 | ❌ 某些資料庫不支援<br>❌ 需要引號 |
| **camelCase** | `timelogDb` | ✅ 與程式碼一致 | ❌ 資料庫不推薦<br>❌ 需要引號 |
| **PascalCase** | `TimelogDb` | ✅ 與程式碼一致 | ❌ 資料庫不推薦<br>❌ 需要引號 |

### 2. 各資料庫的支援情況

| 資料庫 | snake_case | kebab-case | camelCase | PascalCase |
|--------|------------|------------|-----------|------------|
| **PostgreSQL** | ✅ 推薦 | ⚠️ 需要引號 | ⚠️ 需要引號 | ⚠️ 需要引號 |
| **MySQL** | ✅ 推薦 | ❌ 不支援 | ⚠️ 需要引號 | ⚠️ 需要引號 |
| **SQLite** | ✅ 推薦 | ⚠️ 需要引號 | ⚠️ 需要引號 | ⚠️ 需要引號 |

## 推薦的命名方式

### 1. snake_case（推薦）
```sql
-- 推薦的命名方式
CREATE DATABASE timelog_db;
CREATE DATABASE next_one_app;
CREATE DATABASE user_management;
CREATE DATABASE ecommerce_system;
```

### 2. 不推薦的命名方式
```sql
-- 需要引號，容易出錯
CREATE DATABASE "timelog-db";  -- kebab-case
CREATE DATABASE "timelogDb";   -- camelCase
CREATE DATABASE "TimelogDb";   -- PascalCase
```

## 命名規範

### 1. 資料庫命名規範
```
格式: [專案名稱]_[用途]_[環境]

範例:
- timelog_db          # 時間記錄資料庫
- next_one_app        # Next.js 應用程式
- ecommerce_prod      # 電商生產環境
- blog_staging        # 部落格測試環境
```

### 2. 資料表命名規範
```
格式: [功能]_[實體名稱]

範例:
- user_profiles       # 用戶資料
- product_categories  # 商品分類
- order_items         # 訂單項目
- time_logs           # 時間記錄
```

### 3. 欄位命名規範
```
格式: [描述性名稱]

範例:
- user_id            # 用戶 ID
- created_at         # 建立時間
- updated_at         # 更新時間
- is_active          # 是否啟用
- email_address      # 電子郵件
```

## 實際應用範例

### 1. 專案資料庫命名
```sql
-- 主要應用程式
CREATE DATABASE next_one_main;

-- 時間記錄功能
CREATE DATABASE timelog_system;

-- 電商功能
CREATE DATABASE ecommerce_platform;

-- 部落格功能
CREATE DATABASE blog_cms;
```

### 2. 環境區分
```sql
-- 開發環境
CREATE DATABASE timelog_dev;

-- 測試環境
CREATE DATABASE timelog_staging;

-- 生產環境
CREATE DATABASE timelog_prod;
```

### 3. 連接字串範例
```bash
# 開發環境
DATABASE_URL="postgresql://postgres:abc123@localhost:5432/timelog_db"

# 測試環境
DATABASE_URL="postgresql://postgres:abc123@localhost:5432/timelog_staging"

# 生產環境
DATABASE_URL="postgresql://postgres:abc123@localhost:5432/timelog_prod"
```

## 最佳實踐

### 1. 命名原則
- ✅ **描述性**: 名稱要能清楚表達用途
- ✅ **一致性**: 整個專案使用相同的命名風格
- ✅ **簡潔性**: 避免過長的名稱
- ✅ **可讀性**: 使用下底線分隔單詞

### 2. 避免的命名
- ❌ **保留字**: 避免使用 SQL 保留字
- ❌ **特殊字元**: 避免使用特殊字元
- ❌ **數字開頭**: 避免以數字開頭
- ❌ **過長名稱**: 避免過長的名稱

### 3. 團隊協作
- 📋 **命名規範文件**: 建立團隊命名規範
- 🔄 **程式碼審查**: 在 PR 中檢查命名
- 📚 **文檔記錄**: 記錄命名決策和原因

## 總結

**推薦使用 snake_case**，因為：
1. **符合資料庫標準** - snake_case 是資料庫界的標準
2. **跨平台相容** - 所有資料庫都支援
3. **易讀性佳** - 清楚表達用途
4. **不需要引號** - 避免語法錯誤
5. **與 Prisma 相容** - Prisma 推薦使用 snake_case

你的 `timelog_db` 命名是正確的！🎉
