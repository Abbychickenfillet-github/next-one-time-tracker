# SWR 與服務端開發完整指南

## 📚 目錄
1. [SWR 基礎概念](#swr-基礎概念)
2. [useMutation 詳細解釋](#usemutation-詳細解釋)
3. [useQuery vs useMutation](#usequery-vs-usemutation)
4. [服務端 vs 客戶端](#服務端-vs-客戶端)
5. [API 路由與 HTTP 請求](#api-路由與-http-請求)
6. [實際使用範例](#實際使用範例)
7. [常見問題解答](#常見問題解答)

---

## SWR 基礎概念

### 什麼是 SWR？

**SWR** 是 Vercel 開發的一個 React Hooks 庫，用於**資料獲取**和**狀態管理**。

- **S**tale-While-Revalidate：在重新驗證時使用過期資料
- **W**hile：在背景重新驗證
- **R**evalidate：重新驗證資料

### SWR 的核心優勢

1. **自動快取**：避免重複請求
2. **背景更新**：自動重新獲取最新資料
3. **錯誤重試**：失敗時自動重試
4. **載入狀態**：自動管理 loading 狀態
5. **TypeScript 支援**：完整的類型推斷

---

## useMutation 詳細解釋

### 什麼是 useMutation？

`useMutation` 是 SWR 提供的 Hook，專門用於處理**會改變伺服器狀態**的操作：

- **POST**：新增資料
- **PUT**：更新資料
- **DELETE**：刪除資料
- **PATCH**：部分更新

### useMutation 的基本語法

```javascript
const { trigger, isMutating, isError } = useMutation(url, method)
```

### 解構賦值解析

```javascript
// useMutation 實際返回的是一個對象：
const mutationResult = useMutation('/api/auth/login', 'POST')
// mutationResult = {
//   trigger: function,      // 觸發 API 請求的函數
//   isMutating: boolean,     // 請求進行中的狀態
//   isError: boolean         // 請求是否發生錯誤
// }

// 使用解構賦值提取這三個屬性
const { trigger, isMutating, isError } = useMutation('/api/auth/login', 'POST')

// 等價於：
const mutationResult = useMutation('/api/auth/login', 'POST')
const trigger = mutationResult.trigger
const isMutating = mutationResult.isMutating  
const isError = mutationResult.isError
```

### 三個方法的詳細意義

#### 1. trigger - 觸發 API 請求的函數

```javascript
const { trigger, isMutating, isError } = useMutation('/api/auth/login', 'POST')

// trigger 是一個函數，用來發送 HTTP 請求
const handleLogin = async () => {
  try {
    // trigger 會發送 POST 請求到 /api/auth/login
    // 並返回 Promise，可以用 await 等待結果
    const data = await trigger({ 
      data: { username: 'user', password: 'pass' } 
    })
    console.log('登入成功:', data)  // ← 這裡可以得到 API 返回的資料
  } catch (error) {
    console.error('登入失敗:', error)
  }
}
```

#### 2. isMutating - 請求進行中的狀態

```javascript
// isMutating 是布林值，表示請求是否正在進行中
console.log(isMutating)  // true 或 false

// 在 React 組件中使用：
const LoginButton = () => {
  const { trigger, isMutating, isError } = useMutation('/api/auth/login', 'POST')
  
  return (
    <button disabled={isMutating}>
      {isMutating ? '登入中...' : '登入'}
    </button>
  )
}
```

#### 3. isError - 請求是否發生錯誤

```javascript
// isError 是布林值，表示請求是否發生錯誤
console.log(isError)  // true 或 false

// 在 React 組件中使用：
const LoginForm = () => {
  const { trigger, isMutating, isError } = useMutation('/api/auth/login', 'POST')
  
  return (
    <div>
      <button onClick={handleLogin} disabled={isMutating}>
        {isMutating ? '登入中...' : '登入'}
      </button>
      {isError && <div className="error">登入失敗，請重試</div>}
    </div>
  )
}
```

### 狀態變化時間軸

```javascript
// 初始狀態
isMutating: false
isError: false

// 點擊登入按鈕
await trigger(data)
// ↓
// 請求開始
isMutating: true
isError: false

// 請求成功
isMutating: false  
isError: false
// 返回: responseData

// 請求失敗
isMutating: false
isError: true
// 拋出: error
```

---

## useQuery vs useMutation

### 對比表格

| Hook | 用途 | 何時觸發 | 返回值 | 使用場景 |
|------|------|----------|--------|----------|
| `useQuery` | **讀取資料** (GET) | 組件載入時自動觸發 | `{ data, error, isLoading, mutate }` | 獲取用戶資料、商品列表等 |
| `useMutation` | **修改資料** (POST/PUT/DELETE) | 手動觸發 | `{ trigger, isMutating, isError }` | 登入、註冊、更新資料等 |

### useQuery 範例

```javascript
// 自動獲取用戶資料
export const useAuthGet = () => {
  const { data, error, isLoading, mutate, isError } = useQuery(
    `${apiURL}/auth/check`  // GET 請求，自動觸發
  )

  let user = defaultUser
  if (data && data?.status === 'success') {
    user = data?.data?.user
  }

  return { user, favorites, isLoading, mutate, isError }
}
```

### useMutation 範例

```javascript
// 手動觸發登入
export const useAuthLogin = () => {
  const { trigger, isMutating, isError } = useMutation(
    `${apiURL}/auth/local/login`,  // POST 請求
    'POST'
  )
  
  const login = async (data = {}) => {
    return await trigger({ data: data })  // 手動觸發
  }

  return { login, isMutating, isError }
}
```

---

## 服務端 vs 客戶端

### 什麼是服務端？

**服務端**（Server-side）是指運行在**伺服器**上的代碼：

- 運行環境：Node.js 伺服器
- 直接操作：資料庫、檔案系統
- 安全性：可以處理敏感資料
- 效能：不受瀏覽器限制

### 什麼是客戶端？

**客戶端**（Client-side）是指運行在**瀏覽器**上的代碼：

- 運行環境：用戶的瀏覽器
- 限制：無法直接操作資料庫
- 互動性：處理用戶介面
- 網路：需要發送 HTTP 請求

### 詳細對比

| 特性 | 服務端 | 客戶端 |
|------|--------|--------|
| **運行位置** | 伺服器 | 瀏覽器 |
| **資料庫操作** | ✅ 直接操作 | ❌ 需要 API |
| **檔案系統** | ✅ 直接存取 | ❌ 無法存取 |
| **環境變數** | ✅ 安全存取 | ❌ 會暴露 |
| **用戶互動** | ❌ 無 UI | ✅ 處理 UI |
| **網路請求** | ❌ 不需要 | ✅ 需要發送 |

---

## API 路由與 HTTP 請求

### 服務端 API 路由 (不需要 apiURL)

```javascript
// app/(api)/api/timelog/route.ts - 服務端 API 路由
export async function POST(req: Request) {
  // 這裡不需要 apiURL，因為：
  // 1. 這是服務端代碼，直接運行在伺服器上
  // 2. 直接操作資料庫，不需要發送 HTTP 請求
  // 3. 路徑是相對的，Next.js 自動處理
  
  const newLog = await prisma.timeLog.create({
    data: { title, startTime, endTime }
  })
  
  return NextResponse.json(newLog)
}
```

### 客戶端 API 調用 (需要 apiURL)

```javascript
// services/rest-client/use-user.js - 客戶端代碼
export const useAuthLogin = () => {
  const { trigger, isMutating, isError } = useMutation(
    `${apiURL}/auth/local/login`,  // ← 需要完整 URL
    'POST'
  )
}
```

### 為什麼需要 apiURL？

```javascript
// config/client.config.js
export const apiURL = isDev 
  ? 'http://localhost:3001/api'  // 開發環境
  : 'https://next-app-one-eta.vercel.app/api'  // 生產環境
```

### 使用場景對比

```javascript
// ❌ 服務端 API 路由 - 不需要 apiURL
// app/(api)/api/timelog/route.ts
export async function POST(req: Request) {
  // 直接操作資料庫，不需要 HTTP 請求
  const result = await prisma.timeLog.create(data)
}

// ✅ 客戶端 Hook - 需要 apiURL  
// services/rest-client/use-user.js
const { trigger } = useMutation(
  `${apiURL}/auth/local/login`  // 瀏覽器需要完整 URL
)

// ✅ 客戶端組件 - 使用相對路徑
// components/timelog/TimeLogClient.tsx  
const response = await fetch('/api/timelog')  // Next.js 自動處理
```

---

## 實際使用範例

### 完整的登入組件

```javascript
const LoginComponent = () => {
  // 1. 解構賦值，取得三個方法
  const { trigger, isMutating, isError } = useMutation('/api/auth/login', 'POST')
  
  // 2. 定義登入處理函數
  const handleLogin = async () => {
    try {
      // 3. 使用 trigger 發送請求
      // trigger 會自動設置 isMutating = true
      const responseData = await trigger({
        data: { username: 'user', password: 'pass' }
      })
      
      // 4. 請求成功後，isMutating = false, isError = false
      console.log('登入成功:', responseData)
      
    } catch (error) {
      // 5. 請求失敗後，isMutating = false, isError = true
      console.error('登入失敗:', error)
    }
  }
  
  return (
    <div>
      {/* 6. 使用狀態來控制 UI */}
      <button 
        onClick={handleLogin} 
        disabled={isMutating}  // 請求進行中時禁用按鈕
      >
        {isMutating ? '登入中...' : '登入'}
      </button>
      
      {isError && (  // 有錯誤時顯示錯誤訊息
        <div className="alert alert-danger">
          登入失敗，請檢查帳號密碼
        </div>
      )}
    </div>
  )
}
```

### 時間記錄功能範例

```javascript
// 客戶端組件 - 發送請求
const TimeLogClient = () => {
  const handleSaveToDB = async () => {
    try {
      // 使用相對路徑，Next.js 自動處理
      const response = await fetch('/api/timelog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          startTime,
          endTime,
          userId: user?.id || null
        }),
      })
      
      const newLog = await response.json()
      console.log('儲存成功:', newLog)
    } catch (error) {
      console.error('儲存失敗:', error)
    }
  }
  
  return (
    <button onClick={handleSaveToDB}>
      儲存到資料庫
    </button>
  )
}
```

---

## 常見問題解答

### Q1: 為什麼有些地方需要 apiURL，有些地方不需要？

**A:** 關鍵在於**運行環境**：
- **服務端**：直接運行在伺服器，直接操作資料庫
- **客戶端**：運行在瀏覽器，需要發送 HTTP 請求到伺服器

### Q2: trigger 函數會返回什麼？

**A:** `trigger` 返回 Promise，可以用 `await` 等待：
```javascript
const data = await trigger({ data: loginData })
// data 就是 API 返回的資料
```

### Q3: isMutating 和 isLoading 有什麼區別？

**A:** 
- `isMutating`：useMutation 的載入狀態
- `isLoading`：useQuery 的載入狀態

### Q4: 什麼時候用 useQuery，什麼時候用 useMutation？

**A:**
- **useQuery**：讀取資料（GET 請求）
- **useMutation**：修改資料（POST/PUT/DELETE 請求）

### Q5: 服務端和客戶端的資料流程是什麼？

**A:**
```
1. 客戶端發送請求 → 2. 服務端接收請求 → 3. 服務端操作資料庫 → 4. 服務端返回結果 → 5. 客戶端接收結果
```

---

## 🎯 總結

1. **SWR** 提供 `useQuery` 和 `useMutation` 來處理資料獲取和修改
2. **useMutation** 返回 `trigger`、`isMutating`、`isError` 三個屬性
3. **服務端** 直接操作資料庫，**客戶端** 需要發送 HTTP 請求
4. **apiURL** 只在客戶端需要，服務端不需要
5. **trigger** 函數可以用 `await` 等待並獲取 API 返回的資料

這個架構讓前端和後端各司其職，提供良好的開發體驗和效能！🚀

