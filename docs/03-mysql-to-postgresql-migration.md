# MySQL 轉 PostgreSQL 遷移指南

## 轉換原因

### 為什麼要從 MySQL 轉 PostgreSQL？

| 原因 | MySQL | PostgreSQL |
|------|-------|------------|
| **使用者管理** | 複雜，需要為每個專案建立不同使用者 | 簡單，一個 superuser 管理所有資料庫 |
| **類型系統** | 多種文字類型 (VARCHAR, TEXT, LONGTEXT) | 統一的 TEXT 類型 |
| **Prisma 相容性** | 需要明確指定 @db 屬性 | 預設類型更合理 |
| **部署便利性** | 需要複雜的權限設定 | 更簡單的部署流程 |

## 使用者管理差異

### MySQL 的使用者管理
```sql
-- 需要為每個資料庫建立專用使用者
CREATE DATABASE timelog_db;
CREATE USER 'timelog_user'@'localhost' IDENTIFIED BY 'timelog_password';
GRANT ALL PRIVILEGES ON timelog_db.* TO 'timelog_user'@'localhost';
FLUSH PRIVILEGES;

-- 每個專案都需要不同的使用者
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'ecommerce_password';
CREATE USER 'blog_user'@'localhost' IDENTIFIED BY 'blog_password';
```

### PostgreSQL 的使用者管理
```sql
-- 通常使用同一個 superuser
CREATE DATABASE timelog_db;
-- 不需要建立新使用者，直接使用 postgres 用戶

-- 或者建立一個通用使用者（可選）
CREATE USER app_user WITH PASSWORD 'app_password';
GRANT ALL PRIVILEGES ON DATABASE timelog_db TO app_user;
```

## Prisma Schema 轉換

### MySQL 特定語法移除

| MySQL 語法 | PostgreSQL 語法 | 說明 |
|------------|-----------------|------|
| `String @db.VarChar(255)` | `String` | PostgreSQL 預設 VARCHAR(255) |
| `String @db.Text` | `String` | PostgreSQL 預設 TEXT |
| `DateTime @db.Date` | `DateTime` | PostgreSQL 預設 DATE |
| `String @db.Text` (Token) | `String` | PostgreSQL 預設 TEXT |

### 轉換範例

```prisma
// MySQL 寫法
model User {
  name     String   @db.VarChar(255)  // VARCHAR(255)
  bio      String?  @db.Text          // TEXT
  birth    DateTime @db.Date         // DATE
  content  String?  @db.Text         // TEXT
  token    String?  @db.Text         // TEXT
}

// PostgreSQL 寫法
model User {
  name     String                     // VARCHAR(255) - 預設
  bio      String?                    // TEXT - 預設
  birth    DateTime                   // DATE - 預設
  content  String?                    // TEXT - 預設
  token    String?                    // TEXT - 預設
}
```

## 環境變數更新

### 開發環境配置
```bash
# PostgreSQL 連接字串
DATABASE_URL="postgresql://postgres:abc123@localhost:5432/timelog_db"
DIRECT_URL="postgresql://postgres:abc123@localhost:5432/timelog_db"

# 移除 MySQL 相關變數
# DB_HOST=localhost
# DB_PORT=3306
# DB_DATABASE=abby
# DB_PASSWORD=abc123
# DB_USERNAME=abby
```

### 生產環境配置 (Zeabur)
```bash
# Zeabur PostgreSQL 連接
DATABASE_URL="postgresql://zeabur_user:zeabur_password@zeabur_host:5432/zeabur_db"
DIRECT_URL="postgresql://zeabur_user:zeabur_password@zeabur_host:5432/zeabur_db"
```

## 遷移步驟

### 1. 更新 Prisma Schema
```bash
# 修改 prisma/schema.prisma
# 移除所有 @db 屬性
# 更新 datasource 為 postgresql
```

### 2. 重新生成 Prisma Client
```bash
npx prisma generate
```

### 3. 推送資料庫結構
```bash
npx prisma db push
```

### 4. 執行種子資料
```bash
npx prisma db seed
```

## 優點總結

| 優點 | 說明 |
|------|------|
| **簡化配置** | 一個使用者管理所有資料庫 |
| **更好的 Prisma 支援** | 預設類型更合理 |
| **部署便利** | 更簡單的部署流程 |
| **類型統一** | 統一的資料類型系統 |
| **維護性** | 更少的配置檔案 |
