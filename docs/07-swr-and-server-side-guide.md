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

- **S**tale-While-Revalidate：立即顯示快取資料，背景重新驗證
- **W**hile：在背景重新驗證
- **R**evalidate：重新驗證資料
我來查看一下這個 SWR 文檔，了解你提到的 "在重新驗證時使用過期資料" 這個概念。


[1 tool called]

我看到了你提到的問題！在第20行確實有這個描述：

> **S**tale-While-Revalidate：在重新驗證時使用過期資料

這個描述確實聽起來不太對勁，讓我解釋一下 SWR 的 "Stale-While-Revalidate" 策略的真正含義：

## SWR 的 Stale-While-Revalidate 策略解釋

**Stale-While-Revalidate** 並不是"使用過期資料"，而是一個**效能優化策略**：

### 實際運作流程：

1. **首次請求**：獲取資料並快取
2. **資料變舊**：快取中的資料變成 "stale"（過期）
3. **用戶再次訪問**：
   - **立即顯示**：先顯示快取中的舊資料（stale data）
   - **背景更新**：同時在背景發送新請求獲取最新資料
   - **更新顯示**：新資料到達後，自動更新 UI

### 為什麼這樣設計？

```javascript
// 傳統方式（會讓用戶等待）
const data = await fetch('/api/users')  // 用戶要等 2 秒
return <UserList data={data} />

// SWR 方式（立即顯示，背景更新）
const { data } = useSWR('/api/users')  // 立即顯示舊資料
return <UserList data={data} />        // 新資料到達後自動更新
```

### 實際範例：

```javascript
// 時間軸範例
// 10:00 - 用戶首次訪問，獲取用戶列表
// 10:05 - 資料庫更新了用戶資料
// 10:06 - 用戶再次訪問頁面
//        ↓
// 立即顯示：10:00 的舊資料（用戶不用等待）
// 背景請求：獲取 10:05 的最新資料
// 自動更新：新資料到達後替換舊資料
```

## 建議修正文檔

我建議將第20行修改為更準確的描述：


[1 tool called]

## 總結

你的直覺是對的！原本的描述"在重新驗證時使用過期資料"確實容易造成誤解。

**正確的理解是**：
- SWR 會**立即顯示**快取中的資料（即使是舊的）
- 同時在**背景**重新獲取最新資料
- 新資料到達後**自動更新**顯示

這樣的好處是：
1. **更好的用戶體驗**：不用等待載入
2. **更快的響應速度**：立即顯示內容
3. **自動更新**：確保資料最終是最新的

這是一個非常聰明的效能優化策略，讓用戶感覺應用程式非常快速！
所以傳統方式沒有cache?
const data = await fetch('/api/users')
return <UserList data={data} />
```
傳統方式的問題：
沒有快取：每次組件重新渲染都會發送新請求
重複請求：多個組件使用相同資料時會重複請求
用戶體驗差：每次都要等待載入
### SWR 的核心優勢

1. **自動快取**：避免重複請求
2. **背景更新**：自動重新獲取最新資料
3. **錯誤重試**：失敗時自動重試
4. **載入狀態**：自動管理 loading 狀態
5. **TypeScript 支援**：完整的類型推斷

### 傳統方式 vs SWR 快取對比

#### 傳統方式（沒有快取）：
```javascript
// 組件 A
const UserProfile = () => {
  const [users, setUsers] = useState([])

  useEffect(() => {
    // 每次組件掛載都會發送新請求
    fetch('/api/users').then(res => res.json()).then(setUsers)
  }, [])

  return <div>{users.length} 個用戶</div>
}

// 組件 B
const UserList = () => {
  const [users, setUsers] = useState([])

  useEffect(() => {
    // 又發送一次相同的請求！
    fetch('/api/users').then(res => res.json()).then(setUsers)
  }, [])

  return <div>{users.map(user => <div key={user.id}>{user.name}</div>)}</div>
}

// 結果：發送了 2 次相同的請求，浪費資源
```

#### SWR 方式（自動快取）：
```javascript
// 組件 A
const UserProfile = () => {
  const { data: users } = useSWR('/api/users')  // 發送請求

  return <div>{users?.length || 0} 個用戶</div>
}

// 組件 B
const UserList = () => {
  const { data: users } = useSWR('/api/users')  // 使用快取，不發送新請求

  return <div>{users?.map(user => <div key={user.id}>{user.name}</div>)}</div>
}

// 結果：只發送 1 次請求，兩個組件共享同一份資料
```

### 快取生命週期

```javascript
// SWR 快取的生命週期
const { data, error, isLoading } = useSWR('/api/users', fetcher, {
  revalidateOnFocus: true,    // 視窗聚焦時重新驗證
  revalidateOnReconnect: true, // 網路重連時重新驗證
  refreshInterval: 30000,      // 每 30 秒自動重新驗證
  dedupingInterval: 2000,     // 2 秒內相同請求會被去重
})
```

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
useQuery = 自動讀取資料 (GET)
useMutation = 手動修改資料(POST/PUT/DELETE)

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
  : 'https://insightful-timelog.zeabur.app/api/payment/line-pay/confirm/api'  // 生產環境
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

### Q6: useMutation 和 useState 有什麼區別？

**A:** 這是兩種不同的狀態管理方式：

#### 使用 useState（傳統方式）：
```javascript
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

const handleSubmit = async (data) => {
  setLoading(true)
  setError(null)
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    const result = await response.json()
    // 處理結果
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

#### 使用 useMutation（SWR 方式）：
```javascript
const { trigger, isMutating, isError } = useMutation('/api/users', 'POST')

const handleSubmit = async (data) => {
  try {
    const result = await trigger({ data })
    // 處理結果
  } catch (err) {
    // 錯誤處理
  }
}
```

**差異比較：**
- ✅ **useMutation**：自動管理 loading/error 狀態，代碼更簡潔
- ❌ **useState**：需要手動管理狀態，代碼較冗長
- ✅ **useMutation**：內建錯誤處理和重試機制
- ❌ **useState**：需要自己實現錯誤處理

**建議：**
- 新專案建議使用 `useMutation`
- 舊專案可以逐步遷移到 `useMutation`
- 簡單的狀態管理仍可使用 `useState`

---

## 🎯 總結

1. **SWR** 提供 `useQuery` 和 `useMutation` 來處理資料獲取和修改
2. **useMutation** 返回 `trigger`、`isMutating`、`isError` 三個屬性
3. **服務端** 直接操作資料庫，**客戶端** 需要發送 HTTP 請求
4. **apiURL** 只在客戶端需要，服務端不需要
5. **trigger** 函數可以用 `await` 等待並獲取 API 返回的資料

這個架構讓前端和後端各司其職，提供良好的開發體驗和效能！🚀


**TanStack Query**（原名 React Query）是一個非常流行的 React 資料獲取和狀態管理庫！

## �� **TanStack Query 的背景**：

### **公司歷史**：
- **原名**：React Query（2021年之前）
- **現名**：TanStack Query（2021年後）
- **開發者**：Tanner Linsley
- **公司**：TanStack（前身為 React Query 團隊）

### **為什麼改名**？
1. **擴展性**：不只是 React，還支援 Vue、Solid 等框架
2. **品牌統一**：TanStack 旗下有多個工具（Query、Table、Form 等）
3. **避免混淆**：避免與 React 官方工具混淆

## 🔍 **TanStack Query vs SWR**：

你的專案使用的是 **SWR**，但 TanStack Query 是另一個選擇：

### **SWR（你目前使用的）**：
```javascript
// SWR 語法
const { data, error, isLoading } = useSWR('/api/users')
const { trigger, isMutating } = useSWRMutation('/api/users', 'POST')
```

### **TanStack Query 語法**：
```javascript
// TanStack Query 語法
const { data, error, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: () => fetch('/api/users').then(res => res.json())
})

const { mutate, isPending } = useMutation({
  mutationFn: (newUser) => fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(newUser)
  })
})
```

## 📊 **兩個庫的比較**：

| 特性 | SWR | TanStack Query |
|------|-----|----------------|
| **語法簡潔度** | ✅ 更簡潔 | ❌ 較複雜 |
| **功能豐富度** | ❌ 基本功能 | ✅ 功能更豐富 |
| **快取策略** | ✅ 簡單有效 | ✅ 更靈活 |
| **學習曲線** | ✅ 容易上手 | ❌ 較陡峭 |
| **社群大小** | ✅ 大 | ✅ 更大 |
| **TypeScript 支援** | ✅ 好 | ✅ 更好 |

## 🎯 **為什麼你的專案選擇 SWR**？

1. **簡潔性**：SWR 的 API 更簡潔，容易理解
2. **輕量級**：檔案大小較小
3. **Vercel 開發**：SWR 是 Vercel 開發的，與 Next.js 整合好
4. **足夠用**：對於大多數應用，SWR 的功能已經足夠
  jijijijinnkjhiyi8yity
## �� **TanStack Query 的優勢**：

1. **更強大的快取**：支援更複雜的快取策略
2. **更好的錯誤處理**：內建重試、錯誤邊界等
3. **更豐富的功能**：支援樂觀更新、無限滾動等
4. **更好的 TypeScript**：類型推斷更準確

## 🤔 **是否需要遷移？**

**建議**：除非遇到 SWR 無法解決的問題，否則不需要遷移。SWR 對於你的專案來說已經足夠好了！

**什麼時候考慮遷移**：
- 需要複雜的快取策略
- 需要樂觀更新
- 需要無限滾動
- 團隊更熟悉 TanStack Query

你對 TanStack Query 有什麼特別想了解的嗎？