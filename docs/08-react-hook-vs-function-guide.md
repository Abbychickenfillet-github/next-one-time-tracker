# React Hook vs Function 完整指南

## 📚 目錄
1. [React Hook 基礎概念](#react-hook-基礎概念)
2. [Hook vs Function 的區別](#hook-vs-function-的區別)
3. [React Hook 的規則](#react-hook-的規則)
4. [實際範例對比](#實際範例對比)
5. [常見錯誤與解決方案](#常見錯誤與解決方案)
6. [最佳實踐](#最佳實踐)

---

## React Hook 基礎概念

### 什麼是 React Hook？

**React Hook** 是 React 16.8 引入的功能，讓你在**函數組件**中使用狀態和其他 React 特性。

### Hook 的核心特徵

- **以 "use" 開頭**：`useState`, `useEffect`, `useAuth` 等
- **只能在函數組件中使用**：不能在類組件中使用
- **遵循 Hook 規則**：不能在條件語句、迴圈中調用
- **返回狀態和操作函數**：通常返回物件或陣列

---

## Hook vs Function 的區別

### 對比表格

| 特性 | React Hook | 普通 Function |
|------|------------|---------------|
| **命名規則** | 必須以 `use` 開頭 | 任意命名 |
| **使用位置** | 只能在 React 組件內 | 任何地方都可以 |
| **狀態管理** | 可以使用 `useState` | 無法使用 React 狀態 |
| **副作用** | 可以使用 `useEffect` | 無法使用 React 副作用 |
| **返回值** | 通常返回狀態和操作函數 | 可以返回任何值 |
| **重新渲染** | 會觸發組件重新渲染 | 不會觸發重新渲染 |

### 詳細對比

#### ✅ React Hook 範例

```javascript
// ✅ React Hook - 以 "use" 開頭
export const useLoader = () => {
  // 使用 React Hook
  const [isLoading, setIsLoading] = useState(false)
  const [loader, setLoader] = useState(null)
  
  // 使用 useEffect Hook
  useEffect(() => {
    // 副作用邏輯
  }, [])
  
  // 返回狀態和操作函數
  return { 
    isLoading, 
    showLoader: () => setIsLoading(true),
    hideLoader: () => setIsLoading(false),
    loader 
  }
}
```

#### ❌ 普通 Function 範例

```javascript
// ❌ 普通 Function - 不以 "use" 開頭
export const getLoader = () => {
  // 無法使用 React Hook
  // const [isLoading, setIsLoading] = useState(false) // ❌ 錯誤！
  
  // 只能返回普通值
  return { 
    isLoading: false, 
    showLoader: () => console.log('loading'),
    loader: null 
  }
}
```

---

## React Hook 的規則

### 1. 命名規則

```javascript
// ✅ 正確的 Hook 命名
const useAuth = () => { /* ... */ }
const useCart = () => { /* ... */ }
const useLoader = () => { /* ... */ }
const useCustomHook = () => { /* ... */ }

// ❌ 錯誤的 Hook 命名
const auth = () => { /* ... */ }        // 缺少 "use" 前綴
const getAuth = () => { /* ... */ }      // 不是 Hook
const authHook = () => { /* ... */ }     // 不標準的命名
```

### 2. 使用規則

#### ✅ 正確使用

```javascript
// ✅ 在函數組件中使用
const MyComponent = () => {
  const { isLoading, showLoader } = useLoader()
  
  return <div>{isLoading ? '載入中...' : '完成'}</div>
}

// ✅ 在其他 Hook 中使用
const useAuth = () => {
  const { isLoading } = useLoader()  // ✅ 可以在其他 Hook 中使用
  
  return { isLoading }
}
```

#### ❌ 錯誤使用

```javascript
// ❌ 在普通函數中使用
const regularFunction = () => {
  const { isLoading } = useLoader()  // ❌ 錯誤！不能在普通函數中使用
}

// ❌ 在條件語句中使用
const MyComponent = () => {
  if (someCondition) {
    const { isLoading } = useLoader()  // ❌ 錯誤！不能在條件語句中使用
  }
}

// ❌ 在迴圈中使用
const MyComponent = () => {
  for (let i = 0; i < 5; i++) {
    const { isLoading } = useLoader()  // ❌ 錯誤！不能在迴圈中使用
  }
}
```

### 3. 返回值規則

```javascript
// ✅ 推薦：返回物件
const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  return {
    user,
    isLoading,
    login: (credentials) => { /* ... */ },
    logout: () => { /* ... */ }
  }
}

// ✅ 也可以：返回陣列
const useCounter = () => {
  const [count, setCount] = useState(0)
  
  return [count, setCount]
}

// ❌ 不推薦：返回單一值
const useAuth = () => {
  const [user, setUser] = useState(null)
  
  return user  // ❌ 無法提供操作函數
}
```

---

## 實際範例對比

### 專案中的實際例子

#### 1. useLoader Hook

```javascript
// hooks/use-loader/index.js
export const useLoader = () => {
  // 使用 React Hook
  const [isLoading, setIsLoading] = useState(false)
  const [loader, setLoader] = useState(null)
  
  // 操作函數
  const showLoader = () => setIsLoading(true)
  const hideLoader = () => setIsLoading(false)
  
  // 返回狀態和操作函數
  return { 
    isLoading, 
    showLoader, 
    hideLoader, 
    loader 
  }
}

// 使用方式
const MyComponent = () => {
  const { isLoading, showLoader, hideLoader } = useLoader()
  
  return (
    <div>
      {isLoading && <div>載入中...</div>}
      <button onClick={showLoader}>開始載入</button>
      <button onClick={hideLoader}>停止載入</button>
    </div>
  )
}
```

#### 2. useAuth Hook

```javascript
// hooks/use-auth.js
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const login = async (credentials) => {
    setIsLoading(true)
    try {
      const userData = await authService.login(credentials)
      setUser(userData)
    } finally {
      setIsLoading(false)
    }
  }
  
  return { user, isLoading, login }
}

// 使用方式
const LoginComponent = () => {
  const { user, isLoading, login } = useAuth()
  
  if (isLoading) return <div>登入中...</div>
  if (user) return <div>歡迎，{user.name}！</div>
  
  return <button onClick={() => login({ username, password })}>登入</button>
}
```

#### 3. 普通 Function 對比

```javascript
// ❌ 普通 Function - 無法使用 React 狀態
export const getAuthData = () => {
  // 無法使用 useState
  // const [user, setUser] = useState(null)  // ❌ 錯誤！
  
  // 只能返回靜態資料
  return {
    user: null,
    isLoading: false,
    login: () => console.log('login')
  }
}

// 使用方式
const MyComponent = () => {
  const authData = getAuthData()  // 每次調用都返回相同值
  
  return <div>{authData.user?.name}</div>
}
```

---

## 常見錯誤與解決方案

### 錯誤 1：在普通函數中使用 Hook

```javascript
// ❌ 錯誤
const utilityFunction = () => {
  const { isLoading } = useLoader()  // 錯誤！
  return isLoading
}

// ✅ 解決方案：將函數改為 Hook
const useUtility = () => {
  const { isLoading } = useLoader()  // 正確！
  return isLoading
}
```

### 錯誤 2：在條件語句中使用 Hook

```javascript
// ❌ 錯誤
const MyComponent = ({ showLoader }) => {
  if (showLoader) {
    const { isLoading } = useLoader()  // 錯誤！
  }
  
  return <div>Content</div>
}

// ✅ 解決方案：始終調用 Hook
const MyComponent = ({ showLoader }) => {
  const { isLoading, showLoader: startLoader } = useLoader()  // 正確！
  
  useEffect(() => {
    if (showLoader) {
      startLoader()
    }
  }, [showLoader, startLoader])
  
  return <div>Content</div>
}
```

### 錯誤 3：Hook 命名不正確

```javascript
// ❌ 錯誤
const auth = () => {  // 缺少 "use" 前綴
  const [user, setUser] = useState(null)
  return { user, setUser }
}

// ✅ 正確
const useAuth = () => {  // 正確的 Hook 命名
  const [user, setUser] = useState(null)
  return { user, setUser }
}
```

---

## 最佳實踐

### 1. Hook 設計原則

```javascript
// ✅ 單一職責：每個 Hook 只負責一個功能
const useAuth = () => { /* 只處理認證 */ }
const useCart = () => { /* 只處理購物車 */ }
const useLoader = () => { /* 只處理載入狀態 */ }

// ❌ 職責過多：一個 Hook 處理多個不相關的功能
const useEverything = () => { /* 處理認證、購物車、載入狀態... */ }
```

### 2. 返回值設計

```javascript
// ✅ 推薦：返回有意義的物件
const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  return {
    // 狀態
    user,
    isLoading,
    
    // 操作函數
    login: async (credentials) => { /* ... */ },
    logout: () => { /* ... */ },
    
    // 計算屬性
    isLoggedIn: !!user
  }
}
```

### 3. 錯誤處理

```javascript
// ✅ 包含錯誤處理
const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const login = async (credentials) => {
    try {
      setIsLoading(true)
      setError(null)
      const userData = await authService.login(credentials)
      setUser(userData)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  return { user, isLoading, error, login }
}
```

### 4. 效能優化

```javascript
// ✅ 使用 useCallback 優化函數
const useAuth = () => {
  const [user, setUser] = useState(null)
  
  const login = useCallback(async (credentials) => {
    // 登入邏輯
  }, [])
  
  const logout = useCallback(() => {
    setUser(null)
  }, [])
  
  return { user, login, logout }
}
```

---

## 🎯 總結

### React Hook 的核心特徵

1. **命名規則**：必須以 `use` 開頭
2. **使用位置**：只能在 React 組件或其他 Hook 中使用
3. **狀態管理**：可以使用 `useState`, `useEffect` 等
4. **返回值**：通常返回狀態和操作函數的物件
5. **重新渲染**：會觸發組件重新渲染

### 與普通 Function 的區別

- **Hook**：React 專用，可以管理狀態，觸發重新渲染
- **Function**：通用，無法使用 React 狀態，不會觸發重新渲染

### 最佳實踐

- 單一職責原則
- 有意義的返回值設計
- 包含錯誤處理
- 適當的效能優化

記住：**Hook 是 React 的專用工具，Function 是通用的 JavaScript 工具**！🚀


