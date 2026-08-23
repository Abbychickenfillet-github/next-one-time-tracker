
FROM node:18-alpine AS base
# 使用 Node.js 18 Alpine 作為基礎映像
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY prisma ./prisma/
COPY package*.json ./

# 改動一：用 npm ci 取代 npm install
#   ci = Clean Install，它「嚴格照著 package-lock.json 安裝」，
#   不會因為 ^ 版本範圍而偷偷升級到被投毒的新版本
# 改動二：加上 --ignore-scripts，禁止任何套件執行安裝腳本
RUN npm ci --ignore-scripts && npm cache clean --force

# prisma generate 需要單獨呼叫，因為上面把 postinstall 關掉了
RUN npx prisma generate

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 8080
# 啟動應用程式
CMD ["npm", "start"]


# 告知平台 app 監聽的 port
# Zeabur 會注入 PORT=8080，next start 會綁到 8080；EXPOSE 必須與實際監聽的 port 一致，
# 否則 Zeabur 閘道把流量導到錯的 port，服務雖 RUNNING 卻整站 502。