# 🔧 Next.js 2025-09-25時間記錄應用 - 完整故障排除問答集

> **📚 文檔目的**：整理開發過程中遇到的所有技術問題、解決方案與最佳實踐
> **🎯 適用場景**：Next.js 15、Prisma、JWT 認證、PostgreSQL 專案故障排除

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
> ## 🗄️ 資料庫與 Prisma 問題🐛

> ### 出現 `Unknown argument 'id'` 錯誤
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
> #### 🎉 展開運算符的優點與必要性
>
> **為什麼使用 `...payload` 展開運算符？** 🤔
>
> 1. **🔄 淺拷貝 (Shallow Copy)**：
>    - 創建 `payload` 物件的副本，避免直接修改原始物件
>    - 保持 React 狀態管理的不可變性原則
>
> 2. **🏗️ 物件結構扁平化**：
>    - 將 `payload` 內的所有屬性直接展開到新物件中
>    - 避免產生 `payload.payload` 的巢狀結構
>
> 3. **⚡ React 整體結構保留**：
>    - 確保 JWT 結構與前端預期一致
>    - 維持 `session?.payload?.userId` 的簡潔存取方式
>    - 避免破壞 React 組件的狀態更新機制
>
> 4. **🛡️ 資料完整性保護**：
>    - 防止意外修改原始 `payload` 物件
>    - 確保認證資料的穩定性和可預測性
>
> **對比範例：**
> ```javascript
> // ❌ 錯誤方式：會產生巢狀結構
> const payload = { userId: 5, role: 'user' }
> const session = await encrypt({ payload, expiresAt }, exp)
> // 結果：{ payload: { payload: { userId: 5, role: 'user' }, expiresAt } }
>
> // ✅ 正確方式：扁平化結構
> const payload = { userId: 5, role: 'user' }
> const session = await encrypt({ ...payload, expiresAt }, exp)
> // 結果：{ payload: { userId: 5, role: 'user', expiresAt } }
> ```
>
> **🎯 React 開發中的重要性：**
> - 保持狀態物件的扁平結構，便於 `useState` 和 `useEffect` 處理
> - 確保 `Object.keys()` 和 `Object.values()` 能正確遍歷
> - 維持與 Redux/Context 狀態管理的一致性
> - 避免深層巢狀導致的性能問題和記憶體洩漏
>
> #### 🔧 `encrypt` 函數的由來與組成
>
> **📚 JOSE 函式庫介紹：**
> - `SignJWT` 來自 **JOSE** (JSON Object Signing and Encryption) 函式庫
> - JOSE 是 IETF 標準，用於安全地處理 JSON Web Tokens (JWT)
> - 提供現代化的 JWT 簽名和驗證功能
>
> **🏗️ `encrypt` 函數組成分析：**
> ```javascript
> export async function encrypt(payload, exp = '7d') {
>   return new SignJWT(payload)           // 1️⃣ 創建 JWT 簽名物件
>     .setProtectedHeader({ alg: 'HS256' }) // 2️⃣ 設置演算法標頭
>     .setIssuedAt()                      // 3️⃣ 設置發行時間
>     .setExpirationTime(exp)             // 4️⃣ 設置過期時間
>     .sign(encodedKey)                   // 5️⃣ 使用密鑰簽名
> }
> ```
>
> **🔍 各步驟詳細說明：**
>
> 1. **`new SignJWT(payload)`**：
>    - 創建 JWT 簽名物件實例
>    - `payload` 包含用戶資料：`{ userId: 5, role: 'user', expiresAt: '...' }`
>
> 2. **`.setProtectedHeader({ alg: 'HS256' })`**：
>    - 設置 JWT 標頭，指定使用 HMAC SHA-256 演算法
>    - 這是 JWT 標準中常用的對稱加密演算法
>
> 3. **`.setIssuedAt()`**：
>    - 自動設置 `iat` (issued at) 欄位
>    - 記錄 JWT 的發行時間戳
>
> 4. **`.setExpirationTime(exp)`**：
>    - 設置 `exp` (expiration) 欄位
>    - 支援多種時間格式：`'7d'`, `'24h'`, `'30m'`, `'60s'`
>
> 5. **`.sign(encodedKey)`**：
>    - 使用 UTF-8 編碼的密鑰進行簽名
>    - 生成最終的 JWT token 字串
>
> **⏰ `timeUnit = exp.slice(-1)` 的用途：**
> ```javascript
> const timeUnit = exp.slice(-1)    // 取得最後一個字元 (d, h, m, s)
> const timeValue = Number(exp.slice(0, -1))  // 取得數字部分
>
> // 範例：
> // '7d' → timeUnit = 'd', timeValue = 7
> // '24h' → timeUnit = 'h', timeValue = 24
> // '30m' → timeUnit = 'm', timeValue = 30
> ```
>
> **🎯 時間單位轉換邏輯：**
> ```javascript
> switch (timeUnit) {
>   case 'd': expValue = timeValue * 24 * 60 * 60 * 1000  // 天 → 毫秒
>   case 'h': expValue = timeValue * 60 * 60 * 1000      // 小時 → 毫秒
>   case 'm': expValue = timeValue * 60 * 1000           // 分鐘 → 毫秒
>   case 's': expValue = timeValue * 1000                 // 秒 → 毫秒
> }
> ```
>
> **💡 實際範例展示：**
> ```javascript
> // 範例 1: '7d' (7天)
> const exp = '7d'
> const timeUnit = exp.slice(-1)        // 'd'
> const timeValue = Number(exp.slice(0, -1))  // 7
> const expValue = 7 * 24 * 60 * 60 * 1000   // 604,800,000 毫秒
> const expiresAt = new Date(Date.now() + 604800000)  // 7天後
>
> // 範例 2: '24h' (24小時)
> const exp = '24h'
> const timeUnit = exp.slice(-1)        // 'h'
> const timeValue = Number(exp.slice(0, -1))  // 24
> const expValue = 24 * 60 * 60 * 1000       // 86,400,000 毫秒
> const expiresAt = new Date(Date.now() + 86400000)   // 24小時後
>
> // 範例 3: '30m' (30分鐘)
> const exp = '30m'
> const timeUnit = exp.slice(-1)        // 'm'
> const timeValue = Number(exp.slice(0, -1))  // 30
> const expValue = 30 * 60 * 1000             // 1,800,000 毫秒
> const expiresAt = new Date(Date.now() + 1800000)    // 30分鐘後
>
> // 範例 4: '60s' (60秒)
> const exp = '60s'
> const timeUnit = exp.slice(-1)        // 's'
> const timeValue = Number(exp.slice(0, -1))  // 60
> const expValue = 60 * 1000                   // 60,000 毫秒
> const expiresAt = new Date(Date.now() + 60000)      // 60秒後
> ```
>
> **📁 使用 `jwt-session.js` 的完整檔案清單 (共 21 個檔案)：**
>
> **🔧 中間件與測試：**
> - `middleware-sa-test.js` - 中間件測試檔案
>
> **🔐 認證相關 API：**
> - `app/(api)/api/auth/verify/route.js` - JWT 認證驗證
> - `app/(api)/api/auth/local/login/route.js` - 本地帳號登入
> - `app/(api)/api/auth/local/logout/route.js` - 本地帳號登出
> - `app/(api)/api/auth/line/callback/route.js` - LINE 登入回調處理
> - `app/(api)/api/auth/line/logout/route.js` - LINE 登出處理
> - `app/(api)/api/auth/google/login/route.js` - Google 登入處理
> - `app/(api)/api/auth/check/route.js` - 認證狀態檢查
>
> **👤 用戶管理 API：**
> - `app/(api)/api/users/me/profile/route.js` - 用戶資料管理
> - `app/(api)/api/users/me/password/route.js` - 密碼修改
> - `app/(api)/api/users/me/avatar/route.js` - 頭像上傳
> - `app/(api)/api/users/me/cloud-avatar/route.js` - 雲端頭像管理
>
> **⏰ 時間記錄 API：**
> - `app/(api)/api/timelogs/route.js` - 時間記錄列表與統計
> - `app/(api)/api/timelog/route.js` - 單一時間記錄操作
> - `app/(api)/api/step/route.js` - 步驟記錄管理
>
> **❤️ 收藏功能 API：**
> - `app/(api)/api/favorites/route.js` - 收藏清單管理
> - `app/(api)/api/favorites/[productId]/route.js` - 單一商品收藏操作
>
> **📚 文檔檔案：**
> - `docs/14-comprehensive-troubleshooting-qa.md` - 故障排除文檔
> - `docs/15-middleware-nextresponse-preload-explanation.md` - 中間件說明
> - `docs/13-nextjs-api-routes-explanation舊路由需要指定完整後端.md` - API 路由說明
> - `docs/12-authentication-scenarios-and-solutions.md` - 認證場景說明
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

## 📚 Legacy Code 記錄

> [!note]- **jwt-session.js 完整原始碼**
>
> ### 🔐 JWT Session 管理模組
>
> **檔案位置：** `lib/jwt-session.js`
> **用途：** JWT 加密、解密、Cookie 管理
> **依賴：** `jose` 函式庫、Next.js cookies API
>
> ```javascript
> import 'server-only' // 只在伺服器端執行 Server-only
>
> import { SignJWT, jwtVerify } from 'jose'
> import { cookies } from 'next/headers'
> import { serverConfig } from '@/config/server.config'
>
> const secretKey = serverConfig.jwt.secret
> const encodedKey = new TextEncoder().encode(secretKey)
>
> /**
>  * 加密JWT Session
>  * @param {Object} payload 有效負載資料
>  * @param {String} exp 有效期限(預設7天，可接受的時間單位有d(天), h(時), m(分), s(秒))
>  */
> export async function encrypt(payload, exp = '7d') {
>   return new SignJWT(payload)
>     .setProtectedHeader({ alg: 'HS256' })
>     .setIssuedAt()
>     .setExpirationTime(exp)
>     .sign(encodedKey)
> }
>
> /**
>  * 解密JWT Session
>  * @param {String} session JWT Session
>  */
> export async function decrypt(session) {
>   try {
>     // jwtVerify 返回完整的 JWT 對象，包含 payload、header、signature 等信息
>     // 之前只返回 payload，但現在需要完整的 result 對象
>     // 因為前端需要訪問 result.payload.userId，而不是直接訪問 payload.userId
>     const result = await jwtVerify(session, encodedKey, {
>       algorithms: ['HS256'],
>     })
>     return result
>     // eslint-disable-next-line
>   } catch (error) {
>     console.log('Failed to verify session')
>   }
> }
>
> /**
>  * 建立JWT Session
>  * @param {Object} payload 有效負載資料
>  * @param {String} exp 有效期限(預設7天，可接受的時間單位有d(天), h(時), m(分), s(秒))
>  * @param {String} cookieName Cookie名稱(預設ACCESS_TOKEN)
>  */
> export async function createSession(
>   payload,
>   exp = '7d',
>   cookieName = 'ACCESS_TOKEN'
> ) {
>   const timeUnit = exp.slice(-1)
>   const timeValue = Number(exp.slice(0, -1))
>
>   let expValue = 0
>   switch (timeUnit) {
>     case 'd':
>       expValue = timeValue * 24 * 60 * 60 * 1000
>       break
>     case 'h':
>       expValue = timeValue * 60 * 60 * 1000
>       break
>     case 'm':
>       expValue = timeValue * 60 * 1000
>       break
>     case 's':
>       expValue = timeValue * 1000
>       break
>     default:
>       expValue = 7 * 24 * 60 * 60 * 1000
>       break
>   }
>   const expiresAt = new Date(Date.now() + expValue)
>   const session = await encrypt({ ...payload, expiresAt }, exp)
>   const cookieStore = await cookies()
>
>   cookieStore.set(cookieName, session, {
>     httpOnly: false, // 讓前端 JavaScript 可以讀取
>     secure: process.env.NODE_ENV === 'production', // 只在生產環境使用 HTTPS
>     expires: expiresAt,
>     sameSite: 'lax',
>     path: '/',
>   })
> }
>
> /**
>  * 更新JWT Session 時間
>  * @param {String} cookieName Cookie名稱(預設ACCESS_TOKEN)
>  */
> export async function updateSession(cookieName = 'ACCESS_TOKEN') {
>   const session = (await cookies()).get(cookieName)?.value
>   const payload = await decrypt(session)
>
>   if (!session || !payload) {
>     return null
>   }
>
>   const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
>
>   const cookieStore = await cookies()
>
>   cookieStore.set(cookieName, session, {
>     httpOnly: false, // 讓前端 JavaScript 可以讀取
>     secure: process.env.NODE_ENV === 'production', // 只在生產環境使用 HTTPS
>     expires: expires,
>     sameSite: 'lax',
>     path: '/',
>   })
> }
>
> /**
>  * 刪除JWT Session
>  * @param {String} cookieName Cookie名稱(預設ACCESS_TOKEN)
>  */
> export async function deleteSession(cookieName = 'ACCESS_TOKEN') {
>   const cookieStore = await cookies()
>   cookieStore.delete(cookieName)
> }
> ```
>
> ### 🎯 函數功能說明
>
> | 函數名稱 | 功能 | 參數 | 返回值 |
> |----------|------|------|--------|
> | `encrypt()` | JWT 加密簽名 | `payload`, `exp` | JWT token 字串 |
> | `decrypt()` | JWT 解密驗證 | `session` | JWT 完整物件 |
> | `createSession()` | 創建並設置 Cookie | `payload`, `exp`, `cookieName` | 無 |
> | `updateSession()` | 更新 Cookie 過期時間 | `cookieName` | 無 |
> | `deleteSession()` | 刪除 Cookie | `cookieName` | 無 |
>
> ### 🔧 技術特點
>
> - **🛡️ 安全性**：使用 HMAC SHA-256 演算法
> - **⏰ 時間管理**：支援多種時間單位 (d/h/m/s)
> - **🍪 Cookie 整合**：與 Next.js cookies API 完美整合
> - **🔄 狀態管理**：支援 Session 創建、更新、刪除
> - **📱 跨平台**：Server-only 執行，確保安全性

---
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
