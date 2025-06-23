# next-one

## 介紹

這是一個使用最新版本的 Next.js 和 Prisma 的範例應用程式，包含了用戶端和伺服器端的全端專案。它使用 MySQL 作為本地端資料庫，並且可以在 Vercel 上進行部署。

## github repo

- [next-one](https://github.com/mfee-react/next-one)

## 版本

v1.0.0(2025-05-09)

- react 19.1.0
- next.js 15.3.2
- prisma 6.7.0

## 安裝

執行以下命令來安裝依賴項目：

```sh
npm i
```

在專案的根目錄中建立並配置 `.env` 檔案。你可以使用 `.env.example` 檔案作為樣版，改為`.env`檔案：

```text
NODE_ENV=development
# openssl rand -base64 32
SESSION_SECRET=3Xtu+BRpWLoNvMtyEQKQKeO2qBXSvUZZtTVUscoN2Rs=
# mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_PASSWORD=your_database_password
DB_USERNAME=your_database_username
# mysql(local)
DATABASE_URL="mysql://your_database_username:your_database_password@localhost:3306/your_database_name"
# 以下僅適用於生產環境（邊緣雲端託管）
# Redis
REDIS_URL="redis://default:password@localhost:6379"
# Postgres
POSTGRES_DATABASE="verceldb"
POSTGRES_HOST=""
POSTGRES_PASSWORD=""
POSTGRES_PRISMA_URL=""
POSTGRES_URL=""
POSTGRES_URL_NON_POOLING=""
POSTGRES_URL_NO_SSL=""
POSTGRES_USER="default"
```

執行以下命令來建立資料庫（包含範例表格和種子資料）：

```sh
npm run seed
```

## 配置文件

配置文件位於專案的根目錄，用於配置應用程式的各種參數。以下是主要的配置文件：

- `config/client.config.js` - 用戶端配置文件
- `config/server.config.js` - 伺服器配置文件

以下為其它的配置文件：

- `next.config.js` - Next.js 配置文件
- `prisma/schema.prisma` - Prisma 架構文件
- `prisma/seed.js` - 用於填充資料庫範例資料的種子文件

## 開發

執行以下命令來啟動開發伺服器：

```sh
npm run dev
```

## 部署

- https://neon.tech/docs/guides/vercel-overview
