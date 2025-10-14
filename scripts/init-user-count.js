//用node執行這腳本。可以一次更新所有用戶的 current_log_count
import prisma from '../lib/prisma.js'

async function initUserCount() {
  try {
    console.log('開始初始化用戶 current_log_count...')

    // 查詢所有用戶
    const users = await prisma.user.findMany({
      select: {
        // select: 指定要查詢的欄位，只返回需要的資料，提高效能
        user_id: true, // 用戶ID
        email: true, // 用戶信箱
        current_log_count: true, // 當前記錄數量（我們維護的計數器）
        _count: {
          // _count: Prisma 的特殊語法，用於計算關聯記錄的數量
          // 這裡會計算每個用戶有多少筆 TimeLog 記錄
          select: {
            timeLogs: true, // 計算 timeLogs 關聯的記錄數量
          },
        },
      },
    })

    console.log(`找到 ${users.length} 個用戶`)

    // 更新每個用戶的 current_log_count
    for (const user of users) {
      const actualCount = user._count.timeLogs // 實際的 TimeLog 記錄數量
      const currentCount = user.current_log_count // 我們維護的計數器

      // 比較實際數量與計數器是否一致
      if (actualCount !== currentCount) {
        console.log(
          `用戶 ${user.user_id} (${user.email}): ${currentCount} → ${actualCount}`
        )

        // 更新計數器為實際數量
        await prisma.user.update({
          where: { user_id: user.user_id }, // 指定要更新的用戶
          data: { current_log_count: actualCount }, // 更新計數器
        })
      } else {
        console.log(
          `用戶 ${user.user_id} (${user.email}): 已同步 (${actualCount})`
        )
      }
    }

    console.log('初始化完成！')
  } catch (error) {
    console.error('初始化失敗:', error)
  } finally {
    // finally: 無論成功或失敗都會執行的區塊
    // 這裡用來確保資料庫連線被正確關閉
    await prisma.$disconnect() // 關閉 Prisma 資料庫連線，釋放資源
  }
}

initUserCount()
