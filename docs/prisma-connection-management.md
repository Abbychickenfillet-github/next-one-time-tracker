# Prisma 連線管理機制詳解

## 1. Prisma 套件說明

### 套件結構

```json
// package.json
"dependencies": {
  "@prisma/client": "^6.7.0"  // ← 執行時使用的 ORM 客戶端
},
"devDependencies": {
  "prisma": "^6.7.0"  // ← 開發工具 (CLI)，用於生成客戶端和管理資料庫
}
```

**說明**：

- `@prisma/client`：執行時使用的 ORM 客戶端
- `prisma`：開發工具（CLI），用於生成客戶端和管理資料庫

## 2. 專案中的 Prisma 設定

### 當前專案寫法

```javascript
// lib/prisma.js
import { PrismaClient } from '../prisma/generated/client/index.js'

// 🔗 Prisma 連線管理 - Next.js 最佳實踐
// 使用全域變數避免在開發模式下重複創建 PrismaClient 實例
// 這確保了連線池的共享和自動管理
const prisma = global.prisma || new PrismaClient()

// 在開發模式下，將 PrismaClient 實例儲存到全域變數
// 這樣可以避免熱重載時重複創建連線池
if (process.env.NODE_ENV === 'development') global.prisma = prisma

export default prisma
```

### 標準寫法對比

```javascript
// 標準寫法
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

**差異**：

- 你的專案：使用 `global.prisma`
- 標準寫法：使用 `globalThis.prisma`
- 你的專案：只在 `development` 模式設定
- 標準寫法：在非 `production` 模式設定

## 3. 全域變數機制詳解

### `global` 物件說明

```javascript
// global 是 Node.js 的全域物件
console.log(global === globalThis) // true

// 可以在 global 上添加任何屬性
global.myVariable = 'Hello World'
console.log(global.myVariable) // 'Hello World'

// 在其他檔案中也可以存取
console.log(global.myVariable) // 'Hello World'
```

### 第一次 import 的流程

```javascript
// 第一次 import lib/prisma.js
import prisma from '@/lib/prisma.js'

// 執行流程：
// 1. global.prisma 不存在 (undefined)
// 2. 執行 new PrismaClient() 創建新實例
// 3. 儲存到 global.prisma
// 4. 返回 prisma 實例

console.log(global.prisma) // PrismaClient 實例
```

### 第二次 import 的流程

```javascript
// 第二次 import (熱重載時)
import prisma from '@/lib/prisma.js'

// 執行流程：
// 1. global.prisma 已存在
// 2. 直接使用現有實例
// 3. 不會重複創建 PrismaClient
// 4. 返回同一個 prisma 實例

console.log(global.prisma) // 同一個 PrismaClient 實例
```

## 4. 連線關閉機制

### 為什麼不需要手動關閉？

#### Next.js API 路由 - 自動管理

```javascript
// app/api/timelog/route.js
import prisma from '@/lib/prisma.js'

export async function POST() {
  try {
    const result = await prisma.timeLog.create({...})
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  // 不需要 prisma.$disconnect()
  // Next.js 自動管理連線池
}
```

#### 獨立腳本 - 需要手動關閉

```javascript
// scripts/init-user-count.js
import prisma from '@/lib/prisma.js'

try {
  const users = await prisma.user.findMany()
  // 處理資料...
} catch (error) {
  console.error('錯誤:', error)
} finally {
  // finally確保無論成功或失敗，資料庫連線都會被正確關閉，避免記憶體洩漏與連線池耗盡
  await prisma.$disconnect() // 必須手動關閉
}
```

### 連線關閉的層次

#### Level 1: Node.js 進程層級

```javascript
// Node.js 進程結束時自動清理
process.on('exit', () => {
  // 自動關閉所有資料庫連線
  // 釋放連線池記憶體
})
```

#### Level 2: Next.js 框架層級

```javascript
// Next.js 在應用程式關閉時自動清理
// 不需要手動呼叫 prisma.$disconnect()
```

#### Level 3: Prisma Client 層級

```javascript
// PrismaClient 內部管理連線池
// 自動處理連線的建立和關閉
```

## 5. 記憶體管理

### 沒有全域變數模式 (危險)

```javascript
// 每次 API 呼叫都創建新實例
const prisma1 = new PrismaClient() // 10MB 記憶體
const prisma2 = new PrismaClient() // 10MB 記憶體
const prisma3 = new PrismaClient() // 10MB 記憶體
// 總計：30MB 記憶體
```

### 使用全域變數模式 (安全)

```javascript
// 所有 API 呼叫共享同一個實例
const prisma = global.prisma || new PrismaClient() // 10MB 記憶體
// 總計：10MB 記憶體
```

## 6. 實際運作範例

### 開發模式下的行為

```javascript
// 第一次啟動應用程式
npm run dev

// 第一次 API 呼叫
// → 創建 PrismaClient 實例
// → 儲存到 global.prisma
// → 使用實例處理請求

// 熱重載時
// → global.prisma 已存在
// → 使用現有實例
// → 不會重複創建連線池

// 第二次 API 呼叫
// → 使用 global.prisma
// → 共享連線池
```

### 生產模式下的行為

```javascript
// 生產環境啟動
npm start

// 每次 API 呼叫
// → 使用 global.prisma (如果存在)
// → 或創建新實例
// → 進程結束時自動清理
```

## 7. 最佳實踐

### ✅ 推薦做法

```javascript
// lib/prisma.js
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

### ❌ 避免的做法

```javascript
// 每次創建新實例
export const prisma = new PrismaClient()

// 在 API 路由中手動關閉
export async function POST() {
  const prisma = new PrismaClient()
  try {
    // 處理請求
  } finally {
    await prisma.$disconnect() // 不必要
  }
}
```

## 8. 常見問題

### Q: 為什麼使用 `globalThis` 而不是 `global`？

A: `globalThis` 是標準的全域物件，在瀏覽器和 Node.js 中都能使用。

### Q: 為什麼只在開發模式設定全域變數？

A: 開發模式有熱重載，需要避免重複創建實例。生產模式通常不需要。

### Q: 什麼時候需要手動 `$disconnect()`？

A: 只有在獨立腳本中才需要，Next.js API 路由不需要。

### Q: 連線池會自動清理嗎？

A: 是的，Node.js 進程結束時會自動清理所有連線。

## 9. React Compiler vs Next.js 的資料庫連線管理

### React Compiler 沒有共同管理機制

React Compiler 是編譯時優化工具，不負責執行時連線管理。

#### React Compiler 的作用

```javascript
// React Compiler 主要功能：
// 1. 自動 memoization
// 2. 減少不必要的重新渲染
// 3. 優化組件性能
// 4. 編譯時優化

// 例如：自動優化這個組件
function MyComponent({ data }) {
  // React Compiler 會自動 memoize 這個計算
  const expensiveValue = useMemo(() => {
    return data.map((item) => item.value * 2)
  }, [data])

  return <div>{expensiveValue}</div>
}
```

### React 應用程式的資料庫連線管理

#### 純 React 應用程式

```javascript
// 純 React 應用程式需要自己管理
// server.js (Express 後端)
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// 手動管理連線
process.on('SIGINT', async () => {
  await prisma.$disconnect() // 必須手動關閉
  process.exit(0)
})

// API 路由
app.get('/api/data', async (req, res) => {
  try {
    const data = await prisma.user.findMany()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
  // 每次請求都可能需要考慮連線管理
})
```

#### React + Express 架構

```javascript
// 需要手動管理 Prisma 連線
// lib/prisma.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 手動關閉連線
export const disconnect = async () => {
  await prisma.$disconnect()
}

export default prisma

// 在應用程式關閉時
process.on('beforeExit', async () => {
  await disconnect()
})
```

### Next.js 的優勢

#### Next.js 提供完整的後端管理

```javascript
// lib/prisma.js - Next.js 自動管理
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis
export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Next.js 自動處理：
// 1. 連線池管理
// 2. 進程層級清理
// 3. 熱重載時的連線重用
```

#### API 路由自動管理

```javascript
// app/api/timelog/route.js
import prisma from '@/lib/prisma.js'

export async function POST() {
  try {
    const result = await prisma.timeLog.create({...})
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  // 不需要 prisma.$disconnect()
  // Next.js 自動管理連線池
}
```

### 比較表

| 特性         | React Compiler | Next.js | 純 React + Express |
| ------------ | -------------- | ------- | ------------------ |
| 編譯時優化   | ✅ 有          | ✅ 有   | ❌ 無              |
| 連線池管理   | ❌ 無          | ✅ 自動 | ❌ 需手動          |
| 進程層級清理 | ❌ 無          | ✅ 自動 | ❌ 需手動          |
| 熱重載支援   | ❌ 無          | ✅ 有   | ❌ 無              |
| 全域變數管理 | ❌ 無          | ✅ 有   | ❌ 需手動          |

### 實際應用建議

#### 使用 Next.js (推薦)

```javascript
// 完整的全端解決方案
// 自動管理資料庫連線
// 內建 API 路由
// 自動優化
```

#### 使用 React + Express

```javascript
// 需要手動管理
// 更多配置工作
// 需要自己處理連線池
// 需要自己處理熱重載
```

## 10. 總結

- `lib/prisma.js` 使用全域變數模式共享 PrismaClient 實例
- Next.js 在進程層級管理連線池
- Node.js 進程結束時自動清理連線
- 只有獨立腳本需要手動 `prisma.$disconnect()`
- 全域變數機制避免重複創建實例，節省記憶體
- React Compiler 只負責編譯時優化，不處理執行時連線管理
- Next.js 提供完整的後端管理，包括自動連線池管理
- 純 React 應用程式需要手動管理資料庫連線
