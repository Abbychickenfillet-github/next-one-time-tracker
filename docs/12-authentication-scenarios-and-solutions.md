# 認證系統情境題與處置方法

## 📋 概述

本文檔記錄了在開發認證系統過程中遇到的情境題和對應的處置方法，包括前端表單驗證、後端 API 設計、JWT Token 處理、Cookie 管理等方面的實際案例。

## 🔐 認證相關情境題

### **情境 1：密碼驗證邏輯錯誤**

**問題描述**：
- 用戶在註冊表單中輸入密碼後無法進入下一步
- 前端顯示密碼驗證錯誤

**根本原因**：
```javascript
// ❌ 錯誤的處理方式
const passwordError = validatePassword(user.password)
if (passwordError) {
  newErrors.password = passwordError // 將陣列當作字串處理
}

// ✅ 正確的處理方式
const passwordErrors = validatePassword(user.password)
if (passwordErrors.length > 0) {
  newErrors.password = passwordErrors[0] // 取陣列第一個元素
}
```

**處置方法**：
1. 修正 `validatePassword` 函數回傳陣列而非字串
2. 在 `validateCurrentStep` 中正確處理陣列格式
3. 添加特殊字元驗證規則

**相關檔案**：
- `app/user/register/page.js` - 前端驗證邏輯
- `services/definitions/user.js` - 後端驗證規則

### **情境 2：重複註冊錯誤訊息**

**問題描述**：
- 用戶嘗試使用已存在的 email 註冊
- 系統顯示"重複註冊"訊息

**根本原因**：
```javascript
// 在 services/user.service.js 中
const dbUser = await prisma.user.findFirst({
  where: { email: email }
})

if (dbUser) {
  return {
    status: 'error',
    message: '會員資料重覆' // 這個訊息來源
  }
}
```

**處置方法**：
1. 確認錯誤訊息來源於後端服務層
2. 在前端添加適當的錯誤處理
3. 提供用戶友好的錯誤提示

**相關檔案**：
- `services/user.service.js` - 後端業務邏輯
- `app/user/register/page.js` - 前端錯誤處理

### **情境 3：Next.js 15 Router 問題**

**問題描述**：
- 使用 `useRouter` 進行頁面跳轉時出現錯誤
- `router.push` 和 `router.replace` 無法正常工作

**根本原因**：
- Next.js 15 的 App Router 架構變更
- `useRouter` Hook 的使用方式改變

**處置方法**：
```javascript
// ❌ 舊版方式
import { useRouter } from 'next/router'
const router = useRouter()
router.push('/user')

// ✅ 新版方式
window.location.href = '/user'
```

**相關檔案**：
- `app/user/register/page.js` - 頁面跳轉邏輯
- `app/layout.js` - 路由配置

## 🍪 Cookie 與 Session 管理情境題

### **情境 4：Cookie 清除問題**

**問題描述**：
- 用戶登出後 Cookie 無法完全清除
- 重新登入時出現認證衝突

**根本原因**：
- Cookie 設置參數不一致
- 多種 Cookie 清除方式衝突

**處置方法**：
```javascript
// 多重清除策略
document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;'
document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
document.cookie = 'accessToken=; max-age=0; path=/; domain=localhost;'
document.cookie = 'accessToken=; max-age=0; path=/;'
```

**相關檔案**：
- `hooks/use-auth.js` - 前端認證邏輯
- `app/(api)/api/auth/logout/route.js` - 後端登出處理

### **情境 5：JWT Token 解密失敗**

**問題描述**：
- API 路由中無法正確解密 JWT Token
- 用戶身份驗證失敗

**根本原因**：
- JWT Secret 不一致
- Token 格式錯誤
- 解密函數參數錯誤

**處置方法**：
```javascript
// 檢查 Token 存在性
const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
if (!cookie) {
  return errorResponse(res, { message: '沒有存取令牌' })
}

// 安全解密
const session = await decrypt(cookie)
if (!session?.payload?.userId) {
  return errorResponse(res, { message: '授權失敗' })
}
```

**相關檔案**：
- `lib/jwt-session.js` - JWT 處理邏輯
- `app/(api)/api/users/me/password/route.js` - 認證範例

## 🎨 前端 UI 情境題

### **情境 6：主題切換定位問題**

**問題描述**：
- ThemeToggle 組件在 TopNavbar 中"掉到畫面上"
- 按鈕位置不正確

**根本原因**：
- CSS `transform` 屬性衝突
- 定位方式不當

**處置方法**：
```css
/* ❌ 衝突的定位方式 */
.themeToggleContainer {
  position: fixed;
  transform: translateY(-50%);
}

.themeButton.active {
  transform: scale(1.1); /* 與上方衝突 */
}

/* ✅ 簡化的定位方式 */
.themeToggleContainer {
  position: absolute;
  top: 8px; /* 直接使用 top 值 */
}

.themeButton.active {
  /* 移除 transform 避免衝突 */
}
```

**相關檔案**：
- `components/top-navbar/top-navbar.module.css`
- `components/theme-toggle/theme-toggle.module.css`

### **情境 7：響應式設計問題**

**問題描述**：
- 在小螢幕上 Breadcrumb 顯示異常
- 主題效果在行動裝置上性能問題

**處置方法**：
```css
/* 小螢幕隱藏 Breadcrumb */
@media screen and (max-width: 768px) {
  .header-theme .breadcrumb {
    display: none;
  }
  
  /* 停用動畫提升性能 */
  :root[data-theme="pink"] .header-theme {
    animation: none;
  }
}
```

**相關檔案**：
- `components/timelog/Header.module.css`
- `app/globals.scss`

## 🔧 表單處理情境題

### **情境 8：多步驟表單狀態管理**

**問題描述**：
- 多步驟註冊表單狀態不一致
- 步驟間數據傳遞問題

**處置方法**：
```javascript
// 統一的狀態管理
const [currentStep, setCurrentStep] = useState(1)
const [user, setUser] = useState({
  name: '',
  email: '',
  password: '',
  phone: '',
  birthdate: '',
  gender: ''
})

// 步驟驗證
const validateCurrentStep = () => {
  const newErrors = {}
  let isValid = true
  
  if (currentStep === 1) {
    if (!user.email) {
      newErrors.email = '請輸入電子郵件'
      isValid = false
    }
  }
  
  return { isValid, errors: newErrors }
}
```

**相關檔案**：
- `app/user/register/page.js`
- `app/user/combination/page.js`

### **情境 9：表單互斥功能**

**問題描述**：
- 在 combination 頁面中，註冊和登入表單同時可用
- 用戶可能產生混淆

**處置方法**：
```javascript
// 表單焦點管理
const [activeForm, setActiveForm] = useState(null)

const handleFormFocus = (formType) => {
  setActiveForm(formType)
}

// 條件式樣式
<div className={`form-container ${activeForm && activeForm !== 'register' ? 'opacity-50 pointer-events-none' : ''}`}>
```

**相關檔案**：
- `app/user/combination/page.js`

## 🗄️ 資料庫設計情境題

### **情境 10：Profile 表移除**

**問題描述**：
- 原本的 Profile 表與 User 表分離
- 需要整合到單一 User 表

**處置方法**：
```prisma
// ❌ 舊版設計
model User {
  id       Int      @id @default(autoincrement())
  email    String   @unique
  password String
  profile  Profile? // 1:1 關聯
}

model Profile {
  id       Int    @id @default(autoincrement())
  name     String?
  phone    String?
  gender   String?
  user     User   @relation(fields: [userId], references: [id])
  userId   Int    @unique
}

// ✅ 新版設計
model User {
  id        Int       @id @default(autoincrement())
  name      String?   // 直接整合到 User 表
  email     String    @unique
  password  String
  phone     String?   // 選填欄位
  gender    String?   // 選填欄位
  birthdate DateTime? // 選填欄位
  avatar    String?   // 選填欄位
}
```

**相關檔案**：
- `prisma/schema.prisma`
- `services/user.service.js`
- `seeds/User.json`

## 🚀 性能優化情境題

### **情境 11：useState vs useMemo 選擇**

**問題描述**：
- 用戶質疑 `useState(false)` 的性能影響
- 不確定何時使用 `useMemo` 和 `useCallback`

**處置方法**：
```javascript
// ✅ 正確的狀態管理
const [theme, setTheme] = useState('green') // 直接使用字串
const [hasChecked, setHasChecked] = useState(false) // 布林值

// ✅ 適當的優化
const themeConfig = useMemo(() => ({
  green: { bg: '#0dcaf0', text: 'white' },
  pink: { bg: '#ff6b9d', text: 'white' }
}), [])

const toggleTheme = useCallback((newTheme) => {
  setTheme(newTheme)
  localStorage.setItem('theme', newTheme)
}, [])
```

**相關檔案**：
- `components/theme-toggle/index.js`
- `docs/10-performance-optimization-guide.md`

## 📱 整合測試情境題

### **情境 12：Header 與 Breadcrumb 整合**

**問題描述**：
- Header 和 Breadcrumb 分開顯示佔用太多空間
- 需要整合到同一行

**處置方法**：
```jsx
// ✅ 整合後的結構
<header className="d-flex justify-content-between align-items-center">
  <div className="d-flex align-items-center gap-3 flex-grow-1">
    {/* Logo + 標題 */}
    <Link href="/">...</Link>
    <div>TimeLog Analysis</div>
    
    {/* 整合的 Breadcrumb */}
    <div className="ms-4 flex-grow-1">
      <NextBreadCrumb />
    </div>
  </div>
  
  {/* 側邊欄按鈕 */}
  <button>...</button>
</header>
```

**相關檔案**：
- `components/timelog/Header.tsx`
- `app/layout.js`

## 🎯 最佳實踐總結

### **認證系統設計原則**

1. **安全性優先**：使用 JWT + Cookie 雙重保護
2. **用戶體驗**：提供清晰的錯誤訊息和狀態反饋
3. **性能考量**：適當使用 `useMemo` 和 `useCallback`
4. **響應式設計**：確保在不同裝置上正常運作
5. **錯誤處理**：完善的錯誤捕獲和用戶提示

### **常見問題預防**

1. **狀態管理**：使用適當的 React Hook
2. **表單驗證**：前後端雙重驗證
3. **路由處理**：適應 Next.js 版本變更
4. **CSS 衝突**：避免 transform 屬性衝突
5. **資料庫設計**：簡化表結構，減少關聯複雜度

### **調試技巧**

1. **Console 日誌**：添加詳細的調試資訊
2. **錯誤邊界**：使用 React Error Boundary
3. **網路請求**：檢查 API 請求和回應
4. **狀態追蹤**：使用 React DevTools
5. **性能分析**：使用瀏覽器開發者工具

## 📚 相關文檔

- `docs/07-swr-and-server-side-guide.md` - SWR 和服務端指南
- `docs/08-theme-toggle-positioning-fix.md` - 主題切換定位修復
- `docs/09-react-suspense-guide.md` - React Suspense 指南
- `docs/10-performance-optimization-guide.md` - 性能優化指南
- `docs/11-session-vs-cookie-authentication.md` - 認證機制對比

## 🔄 持續改進

本文檔會持續更新，記錄新的情境題和處置方法。建議在遇到問題時：

1. 先查閱本文檔是否有類似情境
2. 記錄新的問題和解決方案
3. 更新相關的最佳實踐
4. 分享給團隊成員參考



