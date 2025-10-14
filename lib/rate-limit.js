// ========================================
// 🚦 速率限制中間件
// ========================================
// 功能：根據用戶等級限制 API 呼叫頻率

// 記憶體快取，儲存用戶的請求記錄
const requestCache = new Map()

// 清理過期記錄的函數
const cleanupExpiredRecords = () => {
  const now = Date.now()
  for (const [key, records] of requestCache.entries()) {
    const validRecords = records.filter(
      (timestamp) => now - timestamp < 24 * 60 * 60 * 1000
    ) // 保留24小時內的記錄
    if (validRecords.length === 0) {
      requestCache.delete(key)
    } else {
      requestCache.set(key, validRecords)
    }
  }
}

// 每小時清理一次過期記錄
setInterval(cleanupExpiredRecords, 60 * 60 * 1000)

// ========================================
// 📊 速率限制配置
// ========================================
const RATE_LIMITS = {
  0: {
    // 未付費用戶
    api: 30, // 每小時30次 API 呼叫
    db: 100, // 每天100次資料庫查詢
  },
  1: {
    // 已付費用戶
    api: 100, // 每小時100次 API 呼叫
    db: 500, // 每天500次資料庫查詢
  },
}

// ========================================
// 🔍 檢查速率限制
// ========================================
export function checkRateLimit(userId, userLevel, type = 'api') {
  const limits = RATE_LIMITS[userLevel] || RATE_LIMITS[0]
  const limit = limits[type]

  if (!limit) {
    return { allowed: true, remaining: 0 }
  }

  const now = Date.now()
  const key = `${userId}:${type}`
  const windowMs = type === 'api' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // API: 1小時, DB: 24小時

  // 取得用戶的請求記錄
  let records = requestCache.get(key) || []

  // 過濾出時間窗口內的記錄
  const validRecords = records.filter((timestamp) => now - timestamp < windowMs)

  // 檢查是否超過限制
  if (validRecords.length >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: Math.min(...validRecords) + windowMs,
      limit: limit,
    }
  }

  // 記錄本次請求
  validRecords.push(now)
  requestCache.set(key, validRecords)

  return {
    allowed: true,
    remaining: limit - validRecords.length,
    resetTime: now + windowMs,
    limit: limit,
  }
}

// ========================================
// 🚦 速率限制中間件函數
// ========================================
export function rateLimitMiddleware(type = 'api') {
  return async (req, res, next) => {
    try {
      // 從請求中取得用戶資訊（這裡需要根據你的認證方式調整）
      const userId = req.user?.user_id || req.userId
      const userLevel = req.user?.level || 0

      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: '需要登入才能使用此功能',
        })
      }

      // 檢查速率限制
      const rateLimitResult = checkRateLimit(userId, userLevel, type)

      if (!rateLimitResult.allowed) {
        const resetTime = new Date(rateLimitResult.resetTime)
        return res.status(429).json({
          status: 'error',
          message: `請求過於頻繁，請在 ${resetTime.toLocaleString()} 後再試`,
          resetTime: resetTime.toISOString(),
          limit: rateLimitResult.limit,
        })
      }

      // 在回應標頭中加入速率限制資訊
      res.setHeader('X-RateLimit-Limit', rateLimitResult.limit)
      res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining)
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(rateLimitResult.resetTime).toISOString()
      )

      next()
    } catch (error) {
      console.error('速率限制中間件錯誤:', error)
      next()
    }
  }
}

// ========================================
// 📊 取得用戶速率限制狀態
// ========================================
export function getRateLimitStatus(userId, userLevel) {
  const apiStatus = checkRateLimit(userId, userLevel, 'api')
  const dbStatus = checkRateLimit(userId, userLevel, 'db')

  return {
    api: {
      limit: apiStatus.limit,
      remaining: apiStatus.remaining,
      resetTime: apiStatus.resetTime,
    },
    db: {
      limit: dbStatus.limit,
      remaining: dbStatus.remaining,
      resetTime: dbStatus.resetTime,
    },
  }
}
