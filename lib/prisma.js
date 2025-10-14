import { PrismaClient } from '../prisma/generated/client/index.js'

// ========================================
// 🔗 Prisma 連線管理 - Next.js 最佳實踐
// ========================================
// 使用全域變數避免在開發模式下重複創建 PrismaClient 實例
// 這確保了連線池的共享和自動管理

// 第一次 import：global.prisma 不存在，創建新實例
// 第二次 import：global.prisma 已存在，使用現有實例
const prisma = global.prisma || new PrismaClient()

// 在開發模式下，將 PrismaClient 實例儲存到全域變數
// 這樣可以避免熱重載時重複創建連線池
if (process.env.NODE_ENV === 'development') global.prisma = prisma

export default prisma
