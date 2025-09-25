# 🔧 Middleware、NextResponse 與 Resource Preload 詳細解釋

## 📋 目錄
- [負向先行斷言 `(?!...)`](#負向先行斷言)
- [module_evaluation 錯誤](#module_evaluation-錯誤)
- [Middleware 運行機制](#middleware-運行機制)
- [NextResponse 響應物件](#nextresponse-響應物件)
- [Resource Preload 問題解決](#resource-preload-問題解決)
- [完整修復步驟](#完整修復步驟)

---

## 🔍 負向先行斷言 `(?!...)`

### 正則表達式語法
```javascript
(?!api|_next/static|_next/image|.*\\.png$)
```

### 含義解釋
- `(?!...)` = **負向先行斷言**，表示"不匹配後面的模式"
- `api` = 不匹配以 "api" 開頭的路由
- `_next/static` = 不匹配 Next.js 靜態資源
- `_next/image` = 不匹配 Next.js 圖片優化
- `.*\\.png$` = 不匹配以 .png 結尾的檔案

### 實際效果
```javascript
// ✅ 會執行 middleware
/dashboard
/user/login
/

// ❌ 不會執行 middleware
/api/auth/login
/_next/static/chunk.js
/_next/image/logo.png
/image.png
```

### 為什麼需要排除這些路由？
1. **API 路由**：不需要認證檢查，會造成無限循環
2. **靜態資源**：不需要認證，提升性能
3. **圖片檔案**：避免不必要的處理

---

## ⚠️ module_evaluation 錯誤

### 錯誤訊息
```
Cannot read properties of undefined (reading 'reduce')
```

### 常見原因
1. **環境變數載入失敗**
2. **dotenv 導入問題**
3. **模組初始化順序錯誤**
4. **資料庫連接失敗**

### 解決方法
```javascript
// ❌ 錯誤：在 Edge Runtime 中使用 dotenv
import 'dotenv/config.js'

// ✅ 正確：使用 Next.js 內建環境變數
process.env.DATABASE_URL
```

---

## 🚀 Middleware 運行機制

### Middleware 運行位置
- **服務器端**：在請求到達頁面或 API 路由之前
- **Edge Runtime**：使用 V8 JavaScript 引擎
- **攔截所有請求**：包括前端頁面和 API 路由

### 執行順序
```
1. 用戶請求 → 2. Middleware → 3. 頁面/API → 4. 響應
```

### 為什麼會讓程式碼壞掉？

#### 問題 1：錯誤的 matcher 配置
```javascript
// ❌ 錯誤：多個 matcher 規則衝突
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\.png$).*)',
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ],
}

// ✅ 正確：單一 matcher 規則
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
```

#### 問題 2：檔案命名錯誤
```bash
# ❌ 錯誤：Next.js 不會識別
middleware-sa-test.js

# ✅ 正確：Next.js 會自動載入
middleware.js
```

#### 問題 3：無限重定向循環
```javascript
// ❌ 錯誤：可能造成無限循環
if (isProtectedRoute && !session?.payload?.userId) {
  return NextResponse.redirect(new URL('/user', req.nextUrl))
}

// ✅ 正確：檢查重定向目標
if (isProtectedRoute && !session?.payload?.userId) {
  // 確保不會重定向到自己
  if (path !== '/user') {
    return NextResponse.redirect(new URL('/user', req.nextUrl))
  }
}
```

---

## 📡 NextResponse 響應物件

### NextResponse 是什麼？
Next.js 提供的**服務器端響應物件**，用於處理 HTTP 響應。

### 主要功能

#### 1. 重定向 (Redirect)
```javascript
import { NextResponse } from 'next/server'

// 重定向到其他頁面
return NextResponse.redirect(new URL('/dashboard', req.nextUrl))

// 重定向到外部網站
return NextResponse.redirect(new URL('https://example.com'))
```

#### 2. 繼續執行 (Next)
```javascript
// 允許請求繼續到下一層
return NextResponse.next()
```

#### 3. 返回 JSON 響應
```javascript
// 成功響應
return NextResponse.json({ 
  status: 'success', 
  data: userData 
}, { status: 200 })

// 錯誤響應
return NextResponse.json({ 
  error: 'Not found' 
}, { status: 404 })
```

#### 4. 設置 Cookie
```javascript
const response = NextResponse.json({ message: 'success' })

// 設置 cookie
response.cookies.set('ACCESS_TOKEN', token, {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/'
})

return response
```

#### 5. 修改響應標頭
```javascript
const response = NextResponse.json({ data: 'test' })

// 添加自定義標頭
response.headers.set('X-Custom-Header', 'value')
response.headers.set('Cache-Control', 'no-cache')

return response
```

### 使用場景
1. **認證檢查**：重定向未登入用戶
2. **權限控制**：阻止無權限訪問
3. **A/B 測試**：根據條件重定向
4. **國際化**：根據語言重定向
5. **維護模式**：重定向到維護頁面

---

## 🖼️ Resource Preload 問題解決

### 錯誤訊息
```
The resource http://localhost:3001/7-Reasons-To-Keep-Jade-Plant-At-Your-Entrance.jpg was preloaded using link preload but not used within a few seconds from the window's load event.
```

### 問題原因
1. **圖片被預載入但沒有及時使用**
2. **重複的 preload 標籤**
3. **錯誤的 `as` 屬性**
4. **不必要的 preload**

### 解決方法

#### 方法 1：移除不必要的 preload
```jsx
// ❌ 移除這行
<link rel="preload" href="/7-Reasons-To-Keep-Jade-Plant-At-Your-Entrance.jpg" as="image" />
```

#### 方法 2：添加正確的屬性
```jsx
// ✅ 正確的 preload
<link 
  rel="preload" 
  href="/7-Reasons-To-Keep-Jade-Plant-At-Your-Entrance.jpg" 
  as="image"
  type="image/jpeg"
/>
```

#### 方法 3：使用 Next.js Image 組件
```jsx
import Image from 'next/image'

// ✅ 推薦做法
<Image
  src="/7-Reasons-To-Keep-Jade-Plant-At-Your-Entrance.jpg"
  alt="背景圖片"
  fill
  priority={true}  // 如果圖片在首屏
  style={{ 
    objectFit: 'cover',
    opacity: 0.3,
    zIndex: -1,
    borderRadius: '15px',
  }}
/>
```

#### 方法 4：檢查重複 preload
```jsx
// 確保只有一個 preload
<Head>
  <link rel="preload" href="/7-Reasons-To-Keep-Jade-Plant-At-Your-Entrance.jpg" as="image" />
</Head>
```

---

## 🔧 完整修復步驟

### 步驟 1：修復 middleware 配置
```javascript
// middleware.js
import { NextResponse } from 'next/server'
import { decrypt } from '@/lib/jwt-session'
import { cookies } from 'next/headers'

const protectedRoutes = ['/dashboard']
const publicRoutes = ['/user', '/user/login', '/user/register', '/']

export default async function middleware(req) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)

  const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
  const session = await decrypt(cookie)

  // 保護路由檢查
  if (isProtectedRoute && !session?.payload?.userId) {
    return NextResponse.redirect(new URL('/user', req.nextUrl))
  }

  // 已登入用戶重定向
  if (
    isPublicRoute &&
    session?.payload?.userId &&
    (path === '/user' || path === '/user/login')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
}

// ✅ 正確的 matcher 配置
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
```

### 步驟 2：重命名檔案
```bash
# 重命名 middleware 檔案
mv middleware-sa-test.js middleware.js
```

### 步驟 3：檢查 preload 設定
```jsx
// layout.js 或 page.js
<Head>
  {/* 移除不必要的 preload */}
  {/* <link rel="preload" href="/7-Reasons-To-Keep-Jade-Plant-At-Your-Entrance.jpg" as="image" /> */}
</Head>
```

### 步驟 4：移除 dotenv 導入
```javascript
// ❌ 移除這行
import 'dotenv/config.js'

// ✅ 使用 Next.js 內建環境變數
process.env.DATABASE_URL
```

---

## 🎯 總結

### Middleware 重要概念
- **服務器端運行**：不是前端，是服務器端
- **攔截所有請求**：包括 API 路由
- **Edge Runtime**：使用 V8 引擎
- **執行順序**：請求 → Middleware → 頁面/API → 響應

### NextResponse 功能
- **重定向**：`NextResponse.redirect()`
- **繼續執行**：`NextResponse.next()`
- **JSON 響應**：`NextResponse.json()`
- **Cookie 設置**：`response.cookies.set()`
- **標頭修改**：`response.headers.set()`

### 常見問題
1. **matcher 配置錯誤**：多個規則衝突
2. **檔案命名錯誤**：必須是 `middleware.js`
3. **無限重定向**：邏輯錯誤
4. **dotenv 導入**：Edge Runtime 不支援
5. **Resource preload**：不必要的預載入

### 最佳實踐
1. **單一 matcher 規則**：避免衝突
2. **正確的檔案命名**：`middleware.js`
3. **避免無限循環**：檢查重定向目標
4. **移除不必要的 preload**：提升性能
5. **使用 Next.js 內建功能**：避免第三方依賴

---

## 📚 參考資料
- [Next.js Middleware 官方文檔](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [NextResponse API 參考](https://nextjs.org/docs/app/api-reference/functions/next-response)
- [Resource Preload 最佳實踐](https://web.dev/preload-critical-assets/)
- [正則表達式負向先行斷言](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Assertions)

