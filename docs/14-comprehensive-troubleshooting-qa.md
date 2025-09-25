# 🔧 Next.js 時間記錄應用 - 完整故障排除問答集

> **📚 文檔目的**：整理開發過程中遇到的所有技術問題、解決方案與最佳實踐  
> **🎯 適用場景**：Next.js 15、Prisma、JWT 認證、PostgreSQL 專案故障排除  
> **⚡ 更新時間**：2024-01-25

---

## 🔐 認證與中間件問題

> [!question]- **Q1: middleware-sa-test.js 檔名會被 Next.js 架構用到嗎？**
> 
> ### ❌ 答案：不會
> 
> 這個檔案名稱 **`middleware-sa-test.js`** **不會** 被 Next.js 框架自動識別或使用為其官方的中介軟體 (Middleware) 檔案。
> 
> #### 🏗️ Next.js 架構對檔案名稱的要求
> 
> Next.js 框架對於一些特殊功能（例如 Middleware、Layouts、Pages 等）有嚴格的檔案命名慣例。
> 
> **官方 Middleware 檔案名稱：**
> - ✅ **`middleware.js`**
> - ✅ **`middleware.ts`** (如果是 TypeScript)
> 
> 檔案必須放在專案的根目錄或 `src` 目錄下。
> 
> #### 🎯 `middleware-sa-test.js` 的實際用途
> 
> 由於檔案名稱不匹配官方慣例，它會被視為**普通的 JavaScript 模組**：
> 
> 1. **測試檔案**：儲存中介軟體相關的測試程式碼
> 2. **備份或草稿**：開發者暫時儲存邏輯的地方
> 3. **工具檔案**：包含邏輯並被正式的 `middleware.js` 引入使用
> 
> **⚠️ 重要提醒**：必須有 **`middleware.js`** 檔案作為入口點，否則中介軟體功能將不會啟動。

> [!question]- **Q2: 為什麼重新整理頁面會有登出的效果？**
> 
> ### 🔍 問題分析
> 
> 如果沒有正確的 `middleware.js` 檔案，Next.js 不會執行路由保護邏輯，導致：
> 
> 1. **前端狀態重置**：頁面重新載入時，React 狀態被清空
> 2. **認證檢查失敗**：沒有 middleware 驗證 cookie
> 3. **路由重定向問題**：無法正確處理受保護路由
> 
> #### ✅ 解決方案
> 
> ```javascript
> // middleware.js (正確檔名)
> import { NextResponse } from 'next/server'
> import { decrypt } from '@/lib/jwt-session'
> import { cookies } from 'next/headers'
> 
> const protectedRoutes = ['/dashboard']
> 
> export default async function middleware(req) {
>   const path = req.nextUrl.pathname
>   const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
>   const session = await decrypt(cookie)
> 
>   if (protectedRoutes.includes(path) && !session?.payload?.userId) {
>     return NextResponse.redirect(new URL('/user', req.nextUrl))
>   }
> 
>   return NextResponse.next()
> }
> 
> export const config = {
>   matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
> }
> ```

---

## 🗄️ 資料庫與 Prisma 問題

> [!question]- **Q3: 為什麼會出現 `Unknown argument 'id'` 錯誤？**
> 
> ### 🐛 錯誤原因
> 
> ```
> Unknown argument `id`. Did you mean `OR`? Available options are marked with ?.
> { message: '找不到使用者或使用者已被停用' }
> ```
> 
> 這個錯誤發生在 `getUserById` 函數中，原因是：
> 
> 1. **Schema 定義**：User 模型的主鍵是 `user_id`
> 2. **查詢錯誤**：代碼中使用了 `where: { id }`
> 3. **不匹配**：Prisma 找不到名為 `id` 的欄位
> 
> #### 🔧 修復方法
> 
> **❌ 錯誤代碼：**
> ```javascript
> const user = await prisma.user.findUnique({
>   where: { id },  // ❌ 錯誤：User 模型沒有 id 欄位 等同於 { id: id }
> })
> ```
> 
> **✅ 正確代碼：**
> ```javascript
> const user = await prisma.user.findUnique({
>   where: { user_id: id },  // ✅ 正確：使用 user_id 欄位名: 變數值
> })
> ```
> 
> #### 📋 需要修復的檔案位置
> 
> - `services/user.service.js` 中的 `getUserById` 函數
> - `services/user.service.js` 中的 `updateUserById` 函數
> - 所有使用 `where: { id }` 查詢 User 模型的地方
> - 當時遇到重新整理，會自動登出的問題
> ```js
> if (user) {
>   for (const key in user) {
>     if (user[key] === null) {  // 這裡檢查的是 value，不是 key
>       user[key] = ''
>     }
>   }
> }
> ```

> [!question]- **Q4: 為什麼種子資料會出現外鍵約束錯誤？**
> 
> ### ⚠️ 錯誤信息
> 
> ```
> Foreign key constraint violated on the constraint: `TimeLog_user_id_fkey`
> Foreign key constraint violated on the constraint: `Step_user_id_fkey`
> ```
> 
> #### 🔍 問題根源
> 
> 1. **資料不匹配**：TimeLog 和 Step 種子資料引用的 `userId` 不存在
> 2. **種子順序**：外鍵表在主鍵表之前創建
> 3. **ID 不一致**：種子資料中的 ID 與實際資料庫不符
> 
> #### ✅ 解決步驟
> 
> **步驟 1：檢查用戶種子資料**
> ```json
> // seeds/User.json
> [
>   {
>     "name": "yoki",
>     "password": "1234abcA@",
>     "email": "yoki@gmail.com",
>     "phone": "0912345682",
>     "birthdate": "1995-03-15",
>     "gender": "male"
>   }
> ]
> ```
> 
> **步驟 2：確保 TimeLog 種子資料使用正確的 userId**
> ```json
> // seeds/TimeLog.json
> [
>   {
>     "title": "學習 Next.js",
>     "startTime": "2024-01-01T09:00:00.000Z",
>     "endTime": "2024-01-01T11:00:00.000Z",
>     "userId": 5  // 確保這個 ID 存在於 User 表中
>   }
> ]
> ```
> 
> **步驟 3：配置正確的種子順序**
> ```javascript
> // prisma/seed.js
> const oneToMany = [
>   'User:TimeLog',    // User 必須在 TimeLog 之前
>   'User:Step',       // User 必須在 Step 之前
>   'TimeLog:Step',    // TimeLog 必須在 Step 之前
> ]
> ```

---

## 🔑 JWT 與 Cookie 認證問題

> [!question]- **Q5: 為什麼 `ACCESS_TOKEN` 無法被正確識別？**
> 
> ### 🔍 常見原因
> 
> 1. **Cookie 名稱不一致**：前端檢查 `accessToken`，後端設置 `ACCESS_TOKEN`
> 2. **HttpOnly 設置錯誤**：無法從客戶端 JavaScript 讀取
> 3. **Domain/Path 設置問題**：Cookie 範圍限制
> 
> #### ✅ 解決方案
> 
> **確保 Cookie 名稱一致：**
> ```javascript
> // ❌ 錯誤：名稱不一致
> document.cookie.includes('accessToken')  // 前端
> cookies().get('ACCESS_TOKEN')            // 後端
> 
> // ✅ 正確：統一使用 ACCESS_TOKEN
> document.cookie.includes('ACCESS_TOKEN') // 前端
> cookies().get('ACCESS_TOKEN')            // 後端
> ```
> 
> **正確的 Cookie 設置：**
> ```javascript
> // lib/jwt-session.js
> export async function createSession(payload) {
>   const session = await encrypt({ ...payload, expiresAt }, exp)
>   
>   cookies().set('ACCESS_TOKEN', session, {
>     expires: expiresAt,
>     httpOnly: false,  // 允許客戶端讀取
>     secure: process.env.NODE_ENV === 'production',
>     sameSite: 'lax',
>     path: '/'
>   })
> }
> ```

> [!question]- **Q6: JWT payload 為什麼會有 `payload.payload` 雙重包裝？**
> 
> ### 🐛 問題原因
> 
> **錯誤的 JWT 創建方式：**
> ```javascript
> // ❌ 錯誤：會產生 payload.payload 結構
> const session = await encrypt({ payload, expiresAt }, exp)
> ```
> 
> 這會導致 JWT 結構變成：
> ```json
> {
>   "payload": {
>     "payload": {
>       "userId": 5
>     },
>     "expiresAt": "2025-09-27T17:00:45.892Z"
>   }
> }
> ```
> 
> #### ✅ 正確的修復方法
> 
> ```javascript
> // ✅ 正確：使用展開運算符
> const session = await encrypt({ ...payload, expiresAt }, exp)
> ```
> 
> 修復後的 JWT 結構：
> ```json
> {
>   "payload": {
>     "userId": 5,
>     "expiresAt": "2025-09-27T17:00:45.892Z"
>   }
> }
> ```
> 
> **相應的代碼調整：**
> ```javascript
> // 所有 API 路由中將
> session?.payload?.payload?.userId
> // 改回
> session?.payload?.userId
> ```

---

## 🔄 API 路由與資料流問題

> [!question]- **Q7: `/dashboard` 路由會觸發 `getUserById` 嗎？是在什麼時候？**
> 
> ### 🔄 完整調用鏈
> 
> 1. **用戶訪問** `/dashboard`
> 2. **Middleware 檢查**：驗證 `ACCESS_TOKEN` cookie
> 3. **Dashboard 頁面載入**：調用 `useAuth` hook
> 4. **`useAuth` 執行**：`handleCheckAuth` 函數
> 5. **API 調用**：`handleCheckAuth` 調用 `/api/auth/verify`
> 6. **`getUserById` 執行**：在 `/api/auth/verify` 第 20 行
> 
> #### 📍 具體調用位置
> 
> ```javascript
> // app/(api)/api/auth/verify/route.js
> export async function GET() {
>   const userId = session?.payload?.userId
>   const data1 = await getUserById(userId)  // 👈 這裡調用
>   
>   if (!data1?.payload?.user) {
>     return errorResponse(res, { message: '找不到使用者或使用者已被停用' })
>   }
> }
> ```
> 
> #### 🎯 調用目的
> 
> `/api/auth/verify` 路由的作用：
> - ✅ 驗證 JWT token 有效性
> - ✅ 獲取用戶完整資料
> - ✅ 獲取用戶收藏清單
> - ✅ 返回前端更新認證狀態

> [!question]- **Q8: `/api/timelog` 和 `/api/timelogs` 有什麼區別？**
> 
> ### 📋 API 路由區別
> 
> | 路由 | 功能 | HTTP 方法 | 用途 |
> |------|------|-----------|------|
> | `/api/timelog` | 單一時間記錄操作 | POST, GET | 創建時間記錄 |
> | `/api/timelogs` | 多個時間記錄操作 | GET | 獲取用戶所有時間記錄 + 統計 |
> 
> #### 🔍 具體功能差異
> 
> **`/api/timelog` (單數)**
> ```javascript
> // 創建單一時間記錄
> POST /api/timelog
> {
>   "title": "學習 React",
>   "startTime": "2024-01-01T09:00:00.000Z"
> }
> ```
> 
> **`/api/timelogs` (複數)**
> ```javascript
> // 獲取用戶所有時間記錄 + 統計資料
> GET /api/timelogs
> // 返回：
> {
>   "timeLogs": [...],
>   "statistics": {
>     "totalLogs": 5,
>     "totalHours": 11.5,
>     "todayLogs": 0,
>     "weekLogs": 0
>   }
> }
> ```

---

## 🎨 前端與 UI 問題

> [!question]- **Q9: 為什麼輸入框的 placeholder 文字會消失？**
> 
> ### 🐛 常見原因
> 
> 1. **重複的 className 屬性**
> 2. **CSS 覆蓋 placeholder 樣式**
> 3. **背景色遮蓋文字**
> 
> #### ✅ 解決方法
> 
> **移除重複的 className：**
> ```jsx
> // ❌ 錯誤：重複的 className
> <input
>   className="form-control"
>   className="custom-style"  // 會覆蓋上面的
>   placeholder="請輸入文字"
> />
> 
> // ✅ 正確：合併 className
> <input
>   className="form-control custom-style"
>   placeholder="請輸入文字"
> />
> ```
> 
> **確保 placeholder 樣式：**
> ```css
> .form-control::placeholder {
>   color: #666;
>   opacity: 1;
> }
> ```

> [!question]- **Q10: 如何解決 Hydration 錯誤？**
> 
> ### ⚠️ 錯誤原因
> 
> 服務器渲染的 HTML 與客戶端渲染的內容不一致，常見於：
> 
> 1. **時間顯示**：`new Date().toLocaleTimeString()`
> 2. **隨機數據**：`Math.random()`
> 3. **瀏覽器專用 API**：`window`, `localStorage`
> 
> #### ✅ 解決方案
> 
> **時間顯示問題：**
> ```jsx
> // ❌ 錯誤：服務器和客戶端時間不同
> const time = currentTime.toLocaleTimeString()
> 
> // ✅ 正確：檢查客戶端環境
> const time = typeof window !== 'undefined' 
>   ? currentTime.toLocaleTimeString() 
>   : '載入中...'
> ```
> 
> **使用 useEffect 進行客戶端更新：**
> ```jsx
> const [isClient, setIsClient] = useState(false)
> 
> useEffect(() => {
>   setIsClient(true)
> }, [])
> 
> return (
>   <div>
>     {isClient ? currentTime.toLocaleTimeString() : '載入中...'}
>   </div>
> )
> ```

---

## ⚙️ 開發環境與工具問題

> [!question]- **Q11: 為什麼 `npx prisma studio` 顯示 "Unable to run script" 錯誤？**
> 
> ### 🔍 可能原因
> 
> 1. **錯誤的執行目錄**：不在專案根目錄
> 2. **Schema 檔案路徑問題**：找不到 `prisma/schema.prisma`
> 3. **資料庫連接問題**：`DATABASE_URL` 設置錯誤
> 4. **檔案權限問題**：無法讀取 `.env` 檔案
> 
> #### ✅ 解決步驟
> 
> **步驟 1：確認執行目錄**
> ```bash
> # 確保在正確的專案根目錄
> cd C:\coding\next-one-main\next-one-main
> pwd  # 應該顯示正確路徑
> ```
> 
> **步驟 2：檢查檔案結構**
> ```
> next-one-main/
> ├── prisma/
> │   ├── schema.prisma  ✅ 必須存在
> │   └── seed.js
> ├── .env.development   ✅ 必須有 DATABASE_URL
> └── package.json
> ```
> 
> **步驟 3：驗證資料庫連接**
> ```bash
> npx prisma generate  # 先生成客戶端
> npx prisma db push   # 推送 Schema 到資料庫
> npx prisma studio    # 再嘗試啟動 Studio
> ```

> [!question]- **Q12: `EPERM: operation not permitted` 錯誤如何解決？**
> 
> ### 🚫 錯誤原因
> 
> Windows 系統中檔案被鎖定，通常由以下原因造成：
> 
> 1. **Node.js 進程未完全關閉**
> 2. **Prisma Studio 仍在運行**
> 3. **IDE 鎖定檔案**
> 4. **防毒軟體掃描**
> 
> #### ✅ 解決方法
> 
> **步驟 1：終止所有 Node.js 進程**
> ```bash
> # Windows
> taskkill /f /im node.exe
> 
> # 確認進程已終止
> tasklist | findstr node.exe
> ```
> 
> **步驟 2：清理並重新生成**
> ```bash
> # 清理生成的檔案
> rm -rf prisma/generated
> rm -rf .next
> 
> # 重新生成
> npx prisma generate
> ```
> 
> **步驟 3：檢查檔案權限**
> ```bash
> # 確保有讀寫權限
> ls -la prisma/
> chmod 755 prisma/
> ```

---

## 🐛 常見錯誤代碼對照表

> [!question]- **Q13: 各種錯誤代碼的含義和解決方案**
> 
> ### 📋 錯誤代碼快速查詢
> 
> | 錯誤代碼 | 含義 | 解決方案 |
> |----------|------|----------|
> | `P2002` | 唯一性約束違反 | 檢查重複的 email 或其他唯一欄位 |
> | `P2003` | 外鍵約束違反 | 確保引用的 ID 存在於主表中 |
> | `P2025` | 記錄不存在 | 檢查查詢條件和資料是否存在 |
> | `401` | 未授權 | 檢查 JWT token 和認證邏輯 |
> | `404` | 路由不存在 | 確認 API 路由檔案位置和命名 |
> | `500` | 伺服器內部錯誤 | 檢查後端邏輯和資料庫連接 |
> 
> #### 🔍 詳細故障排除
> 
> **P2003 外鍵約束錯誤：**
> ```sql
> -- 檢查外鍵引用
> SELECT * FROM "User" WHERE user_id = 5;  -- 確保用戶存在
> SELECT * FROM "TimeLog" WHERE userId = 5; -- 檢查引用
> ```
> 
> **401 認證錯誤：**
> ```javascript
> // 檢查 JWT 解密
> console.log('Cookie:', cookie)
> console.log('Session:', session)
> console.log('UserId:', session?.payload?.userId)
> ```
> 
> **500 伺服器錯誤：**
> ```javascript
> // 添加詳細錯誤處理
> try {
>   // 業務邏輯
> } catch (error) {
>   console.error('詳細錯誤:', error.message)
>   console.error('錯誤堆棧:', error.stack)
>   return errorResponse(res, { message: error.message })
> }
> ```

---

## 🚀 最佳實踐與建議

> [!tip]- **開發環境設置最佳實踐**
> 
> ### 📁 檔案組織
> 
> ```
> project/
> ├── middleware.js          ✅ 正確的中間件檔名
> ├── middleware-test.js     ❌ 避免容易混淆的檔名
> ├── .env.development       ✅ 開發環境變數
> ├── .env.local            ✅ 本地覆蓋設置
> └── docs/                 ✅ 詳細文檔記錄
> ```
> 
> ### 🔐 認證流程最佳實踐
> 
> 1. **統一命名**：Cookie 名稱、JWT payload 結構
> 2. **錯誤處理**：詳細的 debug 日誌
> 3. **安全性**：適當的 httpOnly 和 secure 設置
> 4. **用戶體驗**：明確的錯誤訊息和重定向邏輯
> 
> ### 🗄️ 資料庫最佳實踐
> 
> 1. **命名慣例**：一致的欄位命名 (`user_id` vs `id`)
> 2. **外鍵約束**：確保資料完整性
> 3. **種子資料**：正確的依賴順序
> 4. **備份策略**：定期備份重要資料

> [!warning]- **常見陷阱與避免方法**
> 
> ### ⚠️ 檔案命名陷阱
> 
> - ❌ `middleware-sa-test.js` - 不會被 Next.js 識別
> - ✅ `middleware.js` - 正確的檔名
> - ❌ `page.tsx` 在 JS 專案中 - 副檔名不一致
> - ✅ `page.js` - 與專案語言一致
> 
> ### ⚠️ 認證流程陷阱
> 
> - ❌ 前後端 Cookie 名稱不一致
> - ❌ JWT payload 雙重包裝
> - ❌ HttpOnly 設置不當
> - ❌ 忘記處理認證狀態更新
> 
> ### ⚠️ 資料庫設計陷阱
> 
> - ❌ 主鍵欄位名稱不一致 (`id` vs `user_id`)
> - ❌ 種子資料外鍵引用錯誤
> - ❌ 忘記設置適當的級聯刪除
> - ❌ 缺少必要的索引

---

## 🔗 相關文檔連結

- [Next.js Middleware 官方文檔](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Prisma 錯誤代碼參考](https://www.prisma.io/docs/reference/api-reference/error-reference)
- [JWT 最佳實踐](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Next.js 認證模式](https://nextjs.org/docs/app/building-your-application/authentication)

---

> **📝 維護說明**：本文檔會隨著專案開發持續更新，記錄新發現的問題和解決方案。建議定期檢視以確保資訊的準確性和完整性。
