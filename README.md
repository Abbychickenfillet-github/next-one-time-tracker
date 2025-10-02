# TimeLog & Analysis Platform

<div align="center">
  <img src="public/timelog_and_analysis-logo.png" alt="TimeLog & Analysis Logo" width="200" height="200">

  <h3>🐛 茜茜蟲工程師 - Full Stack Developer</h3>

  <p>一個現代化的時間記錄與分析平台，幫助您追蹤、分析和管理時間使用情況</p>

[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)](https://postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.7.0-2D3748?style=flat-square&logo=prisma)](https://prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://typescriptlang.org/)

</div>

## 📋 專案概述

TimeLog & Analysis Platform 是一個全端時間管理應用程式，旨在幫助用戶：

- ⏰ **時間追蹤**：記錄各種活動的時間消耗
- 📊 **數據分析**：提供詳細的時間使用分析報告
- 🎯 **目標管理**：設定和追蹤個人時間目標
- 📱 **響應式設計**：支援桌面和行動裝置
- 🔐 **安全認證**：多種登入方式，保護用戶隱私

## ✨ 主要功能

### 🕐 時間記錄

- 快速記錄活動時間
- 分類管理不同類型活動
- 自動計算時間統計
- 歷史記錄查詢

### 📈 數據分析

- 時間使用趨勢圖表
- 活動分類統計
- 效率分析報告
- 目標達成率追蹤

### 👤 用戶管理

- 個人資料管理
- 偏好設定
- 數據匯出功能

### 🛒 電商功能

- 商品瀏覽和搜尋
- 購物車管理
- 訂單處理
- 支付整合（LINE Pay、ECPay）

## 🛠️ 技術棧

### 前端技術

- **框架**: Next.js 15.3.2 (App Router)
- **UI 庫**: React 19.1.0, React Bootstrap
- **樣式**: SCSS, CSS Modules, Bootstrap 5.3.8
- **動畫**: Animate.css, Motion
- **圖表**: 自定義圖表組件

### 後端技術

- **運行環境**: Node.js
- **框架**: Next.js API Routes
- **資料庫**: PostgreSQL 16
- **ORM**: Prisma 6.7.0
- **認證**: Iron Session, JWT, Firebase Auth
- **支付**: LINE Pay, ECPay

### 開發工具

- **語言**: TypeScript, JavaScript
- **代碼品質**: ESLint, Prettier
- **測試**: Jest, Supertest
- **部署**: Vercel, Docker
- **版本控制**: Git

## 🚀 快速開始

### 環境要求

- Node.js 18+
- PostgreSQL 16+
- npm 或 yarn

### 安裝步驟

1. **克隆專案**

   ```bash
   git clone https://github.com/Abbychickenfillet-github/next-one-main.git
   cd next-one-main
   ```

2. **安裝依賴**

   ```bash
   npm install
   ```

3. **環境設定**

   ```bash
   cp .env.example .env.local
   ```

   編輯 `.env.development` `.env.production` 檔案，設定必要的環境變數：

   ```env
   # 資料庫
   DATABASE_URL="postgresql://postgres:password@localhost:5432/timelog_db"

   # 認證
   NODE_ENV=development
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
   # LINE Login
   LINE_LOGIN_CHANNEL_ID="your-channel-id"
   LINE_LOGIN_CHANNEL_SECRET="your-channel-secret"

   # PostgreSQL 資料庫的主機位址
   DB_HOST=localhost
   # PostgreSQL 資料庫的連接埠
   DB_PORT=5432
   # PostgreSQL 資料庫的名稱
   DB_NAME=timelog_db
   # PostgreSQL 資料庫的密碼
   DB_PASSWORD=abc123
   # PostgreSQL 資料庫的使用者名稱
   DB_USER=postgres
   # Prisma 使用的 PostgreSQL 資料庫連接字串 (開發環境)
   DATABASE_URL="postgresql://postgres:abc123@localhost:5432/timelog_db"
   
   # 支付
   LINE_PAY_CHANNEL_ID="your-line-pay-channel-id"
   LINE_PAY_CHANNEL_SECRET="your-line-pay-secret"

   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=779211269881149
   CLOUDINARY_API_SECRET=Or4EfMo8w_id02SUNIM08wXKxZw
   ```

4. **資料庫設定**

   詳見package.json

5. **啟動開發伺服器**

   ```bash
   npm run dev
   ```

6. **開啟瀏覽器**
   訪問 [http://localhost:3001](http://localhost:3001)

## 📁 專案結構

```
next-one-main/
├── app/                    # Next.js App Router
│   ├── (api)/             # API 路由
│   ├── (rsc)/             # React Server Components
│   ├── about/             # 關於頁面
│   ├── blog/              # 部落格功能
│   ├── cart/              # 購物車功能
│   ├── dashboard/         # 儀表板
│   ├── product/           # 商品頁面
│   ├── user/              # 用戶管理
│   └── layout.js          # 根布局
├── components/            # React 組件
│   ├── timelog/           # 時間記錄組件
│   ├── footer.tsx         # 頁尾組件
│   └── top-navbar/        # 頂部導航
├── styles/                # 樣式檔案
│   ├── globals.scss       # 全域樣式
│   ├── footer.module.scss # 頁尾樣式
│   └── about.module.scss  # 關於頁面樣式
├── lib/                   # 工具函數
├── services/              # 服務層
├── prisma/                # 資料庫 schema
├── public/                # 靜態資源
└── docs/                  # 文件
```

## 🔧 可用腳本

```bash
# 開發模式
npm run dev

# 建置專案
npm run build

# 啟動生產伺服器
npm run start

# 代碼檢查
npm run lint

# 執行測試
npm run test

# 資料庫種子
npm run seed
```

## 🌐 部署

### Github 部署

## 🤝 貢獻指南

我們歡迎任何形式的貢獻！請遵循以下步驟：

1. Fork 這個專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### 代碼規範

- 使用 ESLint 和 Prettier 保持代碼風格一致
- 撰寫清晰的 commit 訊息
- 添加適當的註解和文件
- 確保測試覆蓋率

## 📄 授權條款

此專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🔒 安全政策

如果您發現安全漏洞，請查看我們的 [安全政策](SECURITY.md) 並按照指示報告。

## 📞 聯絡資訊

- **開發者**: 茜茜蟲工程師 (Full Stack Developer)
- **Email**: aintluminate@gmail.com
- **GitHub**: [@Abbychickenfillet-github](https://github.com/Abbychickenfillet-github)
- **Instagram**: [@yunlavendarbug](https://www.instagram.com/yunlavendarbug)

## 🙏 致謝

感謝所有為這個專案做出貢獻的開發者和使用者！

---

<div align="center">
  <p>⭐ 如果這個專案對您有幫助，請給我們一個 Star！</p>
  <p>🐛 Made with ❤️ by 茜茜蟲工程師</p>
</div>
