# 速率限制機制詳解

## 1. `new Map()` 的作用

### 為什麼使用 `Map`？

```javascript
// lib/rate-limit.js
const requestCache = new Map()
```

**`Map` 的優勢**：

- **鍵值對儲存**：`userId:type` 作為鍵，請求時間陣列作為值
- **O(1) 查詢**：快速查找用戶的請求記錄
- **自動清理**：可以輕鬆刪除過期記錄
- **記憶體效率**：比物件更適合動態鍵值

### 實際運作範例

```javascript
// 請求記錄結構
requestCache = Map {
  "123:api" => [1640995200000, 1640995260000, 1640995320000],
  "123:db" => [1640995200000, 1640995260000],
  "456:api" => [1640995400000, 1640995460000]
}

// 檢查速率限制
const key = `${userId}:${type}`  // "123:api"
const records = requestCache.get(key) || []  // [1640995200000, 1640995260000, 1640995320000]
```

## 2. RATE_LIMITS 配置

### 配置結構

```javascript
const RATE_LIMITS = {
  0: {
    // 對應 users.level = 0 (未付費用戶)
    api: 30, // 每小時30次 API 呼叫
    db: 100, // 每天100次資料庫查詢
  },
  1: {
    // 對應 users.level = 1 (已付費用戶)
    api: 100, // 每小時100次 API 呼叫
    db: 500, // 每天500次資料庫查詢
  },
}
```

### 與資料庫的對應關係

```sql
-- users 資料表
CREATE TABLE users (
  user_id INT PRIMARY KEY,
  level INT DEFAULT 0,  -- 0: 未付費, 1: 已付費
  -- 其他欄位...
);

-- RATE_LIMITS 的 KEY 對應 users.level
-- level = 0 → RATE_LIMITS[0]
-- level = 1 → RATE_LIMITS[1]
```

## 3. 速率限制檢查流程

### 檢查步驟

```javascript
export function checkRateLimit(userId, userLevel, type = 'api') {
  // 1. 取得對應等級的限制
  const limits = RATE_LIMITS[userLevel] || RATE_LIMITS[0]
  const limit = limits[type]

  // 2. 計算時間窗口
  const windowMs = type === 'api' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000

  // 3. 取得用戶請求記錄
  const key = `${userId}:${type}`
  let records = requestCache.get(key) || []

  // 4. 過濾有效記錄
  const validRecords = records.filter(timestamp => now - timestamp < windowMs)

  // 5. 檢查是否超過限制
  if (validRecords.length >= limit) {
    return { allowed: false, remaining: 0, resetTime: ..., limit }
  }

  // 6. 記錄本次請求
  validRecords.push(now)
  requestCache.set(key, validRecords)

  return { allowed: true, remaining: limit - validRecords.length, ... }
}
```

## 4. 時間窗口機制

### API 呼叫限制 (1小時)

```javascript
// 未付費用戶：每小時30次 API 呼叫
// 已付費用戶：每小時100次 API 呼叫
const windowMs = 60 * 60 * 1000 // 1小時 = 3,600,000 毫秒

// 範例時間軸 (未付費用戶)
// 12:00 - 第1次請求 ✅
// 12:05 - 第2次請求 ✅
// ...
// 12:55 - 第30次請求 ✅
// 13:00 - 第31次請求 ❌ (超過限制)
// 13:01 - 第1次請求 ✅ (新的一小時開始)

// 範例時間軸 (已付費用戶)
// 12:00 - 第1次請求 ✅
// 12:05 - 第2次請求 ✅
// ...
// 12:55 - 第100次請求 ✅
// 13:00 - 第101次請求 ❌ (超過限制)
// 13:01 - 第1次請求 ✅ (新的一小時開始)
```

### 資料庫查詢限制 (24小時)

```javascript
// 未付費用戶：每天100次資料庫查詢
// 已付費用戶：每天500次資料庫查詢
const windowMs = 24 * 60 * 60 * 1000 // 24小時 = 86,400,000 毫秒

// 範例時間軸 (未付費用戶)
// 今天 00:00 - 第1次查詢 ✅
// 今天 12:00 - 第50次查詢 ✅
// 今天 23:59 - 第100次查詢 ✅
// 明天 00:00 - 第1次查詢 ✅ (新的一天開始)

// 範例時間軸 (已付費用戶)
// 今天 00:00 - 第1次查詢 ✅
// 今天 12:00 - 第250次查詢 ✅
// 今天 23:59 - 第500次查詢 ✅
// 明天 00:00 - 第1次查詢 ✅ (新的一天開始)
```

## 5. 自動清理機制

### 清理過期記錄

```javascript
const cleanupExpiredRecords = () => {
  const now = Date.now()
  for (const [key, records] of requestCache.entries()) {
    // 保留24小時內的記錄
    const validRecords = records.filter(
      (timestamp) => now - timestamp < 24 * 60 * 60 * 1000
    )

    if (validRecords.length === 0) {
      requestCache.delete(key) // 刪除空記錄
    } else {
      requestCache.set(key, validRecords) // 更新記錄
    }
  }
}

// 每小時清理一次
setInterval(cleanupExpiredRecords, 60 * 60 * 1000)
```

## 6. 記憶體管理

### 記憶體使用估算

```javascript
// 假設有1000個用戶
// 未付費用戶：每小時30次請求
// 已付費用戶：每小時100次請求
// 每個時間戳 8 bytes (Number)
// 每小時清理一次

// 最大記憶體使用量 (假設50%未付費，50%已付費)
const maxUsers = 1000
const unpaidUsers = 500
const paidUsers = 500
const unpaidRequestsPerHour = 30
const paidRequestsPerHour = 100
const timestampSize = 8 // bytes

const maxMemory =
  (unpaidUsers * unpaidRequestsPerHour + paidUsers * paidRequestsPerHour) *
  timestampSize
// = (500 * 30 + 500 * 100) * 8 = 520,000 bytes = 520 KB

// 實際使用量會更少，因為：
// 1. 不是所有用戶都同時活躍
// 2. 每小時自動清理
// 3. 24小時後自動過期
```

## 7. 併發安全性

### 原子操作

```javascript
// 檢查和記錄是原子操作
const checkRateLimit = (userId, userLevel, type) => {
  // 1. 讀取當前記錄
  const records = requestCache.get(key) || []

  // 2. 檢查限制
  if (records.length >= limit) {
    return { allowed: false }
  }

  // 3. 記錄新請求
  records.push(Date.now())
  requestCache.set(key, records)

  return { allowed: true }
}
```

### 避免競態條件

```javascript
// 使用 Map 的原子操作避免競態條件
// Map.set() 和 Map.get() 是原子操作
// 不會出現部分更新的情況
```

## 8. 實際應用範例

### API 路由中使用

```javascript
// app/api/timelog/route.js
export async function POST(request) {
  // 1. 取得用戶資訊
  const userId = session.payload.userId
  const user = await prisma.user.findUnique({
    where: { user_id: parseInt(userId) },
    select: { level: true },
  })

  // 2. 檢查速率限制
  const rateLimitResult = checkRateLimit(userId, user.level, 'api')

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        status: 'error',
        message: `請求過於頻繁，請在 ${new Date(rateLimitResult.resetTime).toLocaleString()} 後再試`,
        resetTime: rateLimitResult.resetTime,
        limit: rateLimitResult.limit,
      },
      { status: 429 }
    )
  }

  // 3. 繼續處理請求...
}
```

## 9. 監控和除錯

### 日誌記錄

```javascript
// 成功時
console.log('✅ API 速率限制檢查通過:', {
  userId,
  level: user.level,
  remaining: rateLimitResult.remaining,
  limit: rateLimitResult.limit,
})

// 觸發限制時
console.log('🚦 API 速率限制觸發:', {
  userId,
  level: user.level,
  limit: rateLimitResult.limit,
  resetTime: resetTime.toISOString(),
})
```

### 狀態查詢

```javascript
// 取得用戶速率限制狀態
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
```

## 10. 總結

- **`Map`**：高效儲存用戶請求記錄
- **時間窗口**：API(1小時) vs DB(24小時)
- **自動清理**：每小時清理過期記錄
- **等級對應**：`RATE_LIMITS[level]` 對應 `users.level`
- **原子操作**：避免併發問題
- **記憶體效率**：自動管理，不會無限增長
