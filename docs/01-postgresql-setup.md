# PostgreSQL 設定指南

## pgAdmin Template 選擇問題

### 問題描述
在 pgAdmin 創建資料庫時，Template 下拉選單顯示 `project_db`，但選擇後無法儲存，需要改用預設的 `postgres` 作為 template。

### 原因分析
1. **Template 被占用**: `project_db` 正在被其他用戶使用
2. **權限問題**: 當前用戶沒有使用該 template 的權限
3. **Template 損壞**: Template 資料庫可能已損壞

### 解決方案
- ✅ **使用預設 template**: 選擇 `postgres` 作為 template
- ✅ **檢查連接**: 確保沒有其他程序占用 template
- ✅ **重新啟動**: 必要時重啟 PostgreSQL 服務

## 遠端部署 (Zeabur) 設定

### Server 配置策略

| 部署方式 | Server 配置 | 說明 |
|----------|-------------|------|
| **本地開發** | 本地 Server | `localhost:5432` |
| **Zeabur 部署** | 新增遠端 Server | Zeabur 提供的連接資訊 |

### Zeabur 設定步驟
1. **在 pgAdmin 新增 Server**
   - Name: `Zeabur Production`
   - Host: Zeabur 提供的 host
   - Port: Zeabur 提供的 port
   - Username: Zeabur 提供的 username
   - Password: Zeabur 提供的 password

2. **環境變數設定**
   ```bash
   # 開發環境
   DATABASE_URL="postgresql://postgres:abc123@localhost:5432/timelog_db"
   
   # 生產環境 (Zeabur)
   DATABASE_URL="postgresql://zeabur_user:zeabur_password@zeabur_host:5432/zeabur_db"
   ```

### 最佳實踐
- 🔄 **環境分離**: 開發和生產使用不同的 Server
- 🔐 **安全性**: 生產環境使用強密碼
- 📊 **監控**: 定期檢查連接狀態
