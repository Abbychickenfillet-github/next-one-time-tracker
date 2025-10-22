# 使用 Node.js 18 Alpine 作為基礎映像
FROM node:18-alpine AS base

# 安裝必要的系統依賴
RUN apk add --no-cache libc6-compat

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production && npm cache clean --force

# 複製 Prisma schema
COPY prisma ./prisma/

# 生成 Prisma client
RUN npx prisma generate

# 複製應用程式碼
COPY . .

# 建置應用程式
RUN npm run build

# 暴露端口
EXPOSE 3001

# 設定環境變數
ENV NODE_ENV=production
ENV PORT=3001

# 啟動應用程式
CMD ["npm", "start"]
