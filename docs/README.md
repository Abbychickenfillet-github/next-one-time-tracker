# 專案文檔索引

## 文檔結構

本專案包含以下技術文檔，涵蓋從 MySQL 轉換到 PostgreSQL 的完整流程：

### 📁 docs/ 資料夾內容

| 文檔 | 內容 | 適用對象 |
|------|------|----------|
| [01-postgresql-setup.md](./01-postgresql-setup.md) | PostgreSQL 設定指南 | 開發者 |
| [02-prisma-generated-client.md](./02-prisma-generated-client.md) | Prisma Generated Client 詳細解析 | 開發者 |
| [03-mysql-to-postgresql-migration.md](./03-mysql-to-postgresql-migration.md) | MySQL 轉 PostgreSQL 遷移指南 | 開發者 |
| [04-pgadmin-server-management.md](./04-pgadmin-server-management.md) | pgAdmin Server 管理指南 | 開發者 |
| [05-database-naming-conventions.md](./05-database-naming-conventions.md) | 資料庫命名最佳實踐 | 開發者 |
| [06-prisma-database-management.md](./06-prisma-database-management.md) | Prisma 資料庫管理教學 | 開發者 |

## 快速導航

### 🔧 設定相關
- [PostgreSQL 設定](./01-postgresql-setup.md) - 包含 pgAdmin Template 問題解決
- [pgAdmin Server 管理](./04-pgadmin-server-management.md) - Server 創建和管理

### 🚀 遷移相關
- [MySQL 轉 PostgreSQL](./03-mysql-to-postgresql-migration.md) - 完整遷移流程
- [資料庫命名規範](./05-database-naming-conventions.md) - 命名最佳實踐

### 📚 技術深入
- [Prisma Generated Client](./02-prisma-generated-client.md) - Prisma 客戶端詳解
- [Prisma 資料庫管理](./06-prisma-database-management.md) - 開發流程和指令教學

## 常見問題快速查找

### Q: pgAdmin Template 選擇問題？
A: 查看 [PostgreSQL 設定指南](./01-postgresql-setup.md#pgadmin-template-選擇問題)

### Q: 何時需要創建新的 pgAdmin Server？
A: 查看 [pgAdmin Server 管理](./04-pgadmin-server-management.md#何時需要創建新-server)

### Q: 為什麼要從 MySQL 轉 PostgreSQL？
A: 查看 [遷移指南](./03-mysql-to-postgresql-migration.md#轉換原因)

### Q: 資料庫命名用 snake_case 還是 kebab-case？
A: 查看 [命名規範](./05-database-naming-conventions.md#推薦的命名方式)

### Q: Prisma Generated Client 的檔案用途？
A: 查看 [Prisma 詳解](./02-prisma-generated-client.md#generated-client-檔案結構詳解)

### Q: Prisma 開發流程和常用指令？
A: 查看 [Prisma 資料庫管理](./06-prisma-database-management.md#prisma-常用指令)

## 技術棧概覽

### 當前技術棧
- **前端**: Next.js 15.3.2 + React 19.1.0
- **後端**: Next.js API Routes
- **資料庫**: PostgreSQL (從 MySQL 遷移)
- **ORM**: Prisma 6.7.0
- **部署**: Zeabur (遠端) + 本地開發

### 主要功能
- ⏰ **時間記錄系統** - TimeLog 和 Step 模型
- 👤 **用戶管理** - User 和 Profile 模型
- 🛒 **電商功能** - Product, Brand, Category 模型
- 📝 **部落格系統** - Blog 模型
- 🔐 **認證系統** - OTP, JWT, Session 管理

## 更新記錄

| 日期 | 更新內容 | 文檔 |
|------|----------|------|
| 2025-01-18 | 建立文檔結構 | 全部 |
| 2025-01-18 | MySQL 轉 PostgreSQL 遷移 | [03-mysql-to-postgresql-migration.md](./03-mysql-to-postgresql-migration.md) |
| 2025-01-18 | Prisma Generated Client 詳解 | [02-prisma-generated-client.md](./02-prisma-generated-client.md) |
| 2025-01-18 | Prisma 資料庫管理教學 | [06-prisma-database-management.md](./06-prisma-database-management.md) |

## 貢獻指南

### 文檔更新
1. 修改對應的 `.md` 檔案
2. 更新本索引檔案
3. 提交 Pull Request

### 新增文檔
1. 在 `docs/` 資料夾新增 `.md` 檔案
2. 更新本索引檔案
3. 確保文檔格式一致

---

**注意**: 本文檔適用於 Obsidian 或其他 Markdown 編輯器，支援內部連結和表格顯示。
