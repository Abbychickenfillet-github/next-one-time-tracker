# pgAdmin Server 管理指南

## Server 概念說明

### 什麼是 Server？
在 pgAdmin 中，**Server** 代表一個 PostgreSQL 實例（instance），不是資料庫。

| 概念 | 說明 | 範例 |
|------|------|------|
| **Server** | PostgreSQL 實例 | PostgreSQL 17 服務 |
| **Database** | 資料庫 | timelog_db, ecommerce_db |
| **Schema** | 資料表群組 | public, auth, api |
| **Table** | 資料表 | users, products, orders |

## 何時需要創建新 Server？

### 需要新 Server 的情況

| 情況 | 是否需要新 Server | 說明 |
|------|------------------|------|
| **同一台電腦的不同資料庫** | ❌ 不需要 | 同一個 PostgreSQL 實例 |
| **不同電腦的 PostgreSQL** | ✅ 需要 | 不同的主機 |
| **不同版本的 PostgreSQL** | ✅ 需要 | 如 13, 14, 15, 16, 17 |
| **不同的連接埠** | ✅ 需要 | 如 5432, 5433 |
| **不同的認證方式** | ✅ 需要 | 如 SSL, 不同用戶 |
| **遠端部署 (Zeabur)** | ✅ 需要 | 雲端 PostgreSQL 服務 |

### 不需要新 Server 的情況

| 情況 | 說明 |
|------|------|
| **同一個 PostgreSQL 實例** | 所有資料庫都在同一個 Server 下 |
| **同一個連接埠** | 使用預設的 5432 埠 |
| **同一個認證方式** | 使用相同的用戶和密碼 |

## Server 配置範例

### 1. 本地開發 Server
```
Server Name: Local PostgreSQL
Host: localhost
Port: 5432
Username: postgres
Password: abc123
SSL Mode: Prefer

Databases:
├── timelog_db
├── ecommerce_db
└── blog_db
```

### 2. 遠端生產 Server (Zeabur)
```
Server Name: Zeabur Production
Host: zeabur-postgres-host.com
Port: 5432
Username: zeabur_user
Password: zeabur_password
SSL Mode: Require

Databases:
├── production_db
└── staging_db
```

### 3. 測試環境 Server
```
Server Name: Test Environment
Host: test-server.com
Port: 5433
Username: test_user
Password: test_password
SSL Mode: Prefer

Databases:
├── test_db
└── dev_db
```

## 創建新 Server 的步驟

### 1. 在 pgAdmin 中創建 Server
1. 右鍵點擊 "Servers"
2. 選擇 "Create" → "Server..."
3. 填寫連接資訊
4. 測試連接
5. 儲存設定

### 2. 連接資訊設定
```
General Tab:
- Name: Server 名稱 (如 "Zeabur Production")

Connection Tab:
- Host: 主機位址
- Port: 連接埠
- Username: 用戶名
- Password: 密碼
- SSL Mode: SSL 模式

Advanced Tab:
- DB Restriction: 限制可存取的資料庫
- Password: 儲存密碼
```

## 最佳實踐

### 1. Server 命名規範
```
Local Development: "Local PostgreSQL"
Staging Environment: "Staging Server"
Production Environment: "Production Server"
Cloud Service: "Zeabur Production"
```

### 2. 安全性考量
- 🔐 **強密碼**: 使用複雜的密碼
- 🔒 **SSL 連接**: 生產環境使用 SSL
- 🚫 **限制存取**: 設定 IP 白名單
- 📊 **定期備份**: 定期備份重要資料

### 3. 環境分離
```
開發環境: localhost:5432
測試環境: test-server:5432
生產環境: production-server:5432
```

## 常見問題

### Q: 為什麼無法連接到 Server？
A: 檢查以下項目：
- 主機位址是否正確
- 連接埠是否正確
- 用戶名和密碼是否正確
- 防火牆設定是否允許連接
- PostgreSQL 服務是否運行

### Q: 如何測試 Server 連接？
A: 在 pgAdmin 中：
1. 右鍵點擊 Server
2. 選擇 "Properties"
3. 點擊 "Test Connection"
4. 查看連接結果

### Q: 如何刪除不需要的 Server？
A: 在 pgAdmin 中：
1. 右鍵點擊 Server
2. 選擇 "Delete/Drop"
3. 確認刪除
