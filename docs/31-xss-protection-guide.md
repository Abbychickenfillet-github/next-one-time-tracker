# XSS 防護指南

## 什麼是 XSS？

**Cross-Site Scripting (XSS)** 是一種常見的網路安全漏洞，攻擊者通過在網站注入惡意腳本，當其他用戶瀏覽該網站時，腳本會在用戶的瀏覽器中執行。

## 常見的 XSS 攻擊方式

### 1. 反射型 XSS (Reflected XSS)

- 攻擊者將惡意腳本放在 URL 參數中
- 伺服器未經驗證就將參數內容返回給用戶
- 例如：`https://example.com?name=<script>alert(1)</script>`

### 2. 儲存型 XSS (Stored XSS)

- 攻擊者將惡意腳本儲存在資料庫或 localStorage 中
- 當其他用戶瀏覽包含該內容的頁面時，腳本被執行
- **這是您需要特別注意的類型！** 因為您的應用使用 localStorage 儲存用戶輸入

### 3. DOM 型 XSS (DOM-based XSS)

- 攻擊發生在客戶端，通過操作 DOM 結構來執行惡意代碼

## 您的應用目前的安全狀況

### ✅ 已做的正確措施

1. **使用 React 的 JSX 渲染**

   ```jsx
   {
     /* ✅ 安全：React 會自動轉義 */
   }
   ;<div>{userInput}</div>
   ```

2. **沒有使用 `dangerouslySetInnerHTML`**

   - 檢查結果：您的代碼中沒有使用此危險 API

3. **使用受控組件 (Controlled Components)**
   ```jsx
   {
     /* ✅ 安全：value 綁定到狀態 */
   }
   ;<input value={title} onChange={(e) => setTitle(e.target.value)} />
   ```

### ⚠️ 需要注意的地方

1. **localStorage 中的數據**

   - 用戶輸入（`title`, `desc`, `memo`）被直接儲存到 localStorage
   - 當這些數據被讀取並渲染時，需要確保安全

2. **直接渲染用戶輸入**
   ```jsx
   {
     /* ⚠️ 需要確保 step.title 和 step.description 已清理 */
   }
   {
     step.title || step.name
   }
   {
     step.description && (
       <div className="text-muted small">{step.description}</div>
     )
   }
   ```

## 防護措施

### 1. 使用 React 的安全渲染（已經在使用 ✅）

React 會自動轉義所有在 JSX 中渲染的字串：

```jsx
// ✅ 安全：React 自動轉義
const title = "<script>alert('XSS')</script>"
return <div>{title}</div>
// 渲染結果：<script>alert('XSS')</script>（文字內容，不會執行）

// ❌ 危險：使用 dangerouslySetInnerHTML
return <div dangerouslySetInnerHTML={{ __html: title }} />
// 這會執行腳本！
```

### 2. 輸入驗證和清理

在儲存到 localStorage 之前進行清理：

```jsx
import { sanitizeInput, isSafeInput } from '@/lib/xss-protection'

// 在儲存前清理
const handleSave = () => {
  const safeTitle = sanitizeInput(title)
  const safeDesc = sanitizeInput(desc)

  // 驗證是否安全
  if (!isSafeInput(safeTitle)) {
    alert('輸入包含不安全的內容')
    return
  }

  // 儲存清理後的數據
  saveToStorage({ title: safeTitle, desc: safeDesc })
}
```

### 3. 渲染前再次驗證（雙重防護）

即使數據已清理，在渲染時也可以再次驗證：

```jsx
import { safeRender } from '@/lib/xss-protection'

// 在渲染時使用
{
  step.description && (
    <div className="text-muted small">{safeRender(step.description)}</div>
  )
}
```

### 4. Content Security Policy (CSP)

在 `next.config.js` 中設定 CSP 標頭：

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // 僅開發時需要
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https:",
            ].join('; '),
          },
        ],
      },
    ]
  },
}
```

### 5. 使用 DOMPurify（進階選項）

如果需要允許部分 HTML，使用 DOMPurify：

```bash
npm install dompurify
```

```jsx
import DOMPurify from 'isomorphic-dompurify'

// 清理允許 HTML 的內容
const cleanHTML = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href'],
})
```

## 實作建議

### 在您的 Store 中整合清理功能

修改 `useTrialTimeLogStore.js`：

```javascript
import { sanitizeInput } from '@/lib/xss-protection'

// 在 setTitle 和 setDesc 中清理
setTitle: (title) => {
  const safeTitle = sanitizeInput(title)
  set({ title: safeTitle })
},

setDesc: (desc) => {
  const safeDesc = sanitizeInput(desc)
  set({ desc: safeDesc })
},
```

### 在組件中使用安全渲染

修改 `app/trial/page.js`：

```jsx
import { safeRender } from '@/lib/xss-protection'

// 在渲染用戶輸入時
<strong>步驟 {index + 1}:</strong> {safeRender(step.title || step.name)}
{step.description && (
  <div className="text-muted small">
    {safeRender(step.description)}
  </div>
)}
```

## 測試 XSS 防護

### 測試腳本

在輸入框中嘗試以下內容，檢查是否會執行：

```javascript
// 基本測試
<script>alert('XSS')</script>

// 事件處理器測試
<img src=x onerror="alert('XSS')">

// JavaScript 協議測試
<a href="javascript:alert('XSS')">Click me</a>

// 資料 URI 測試
<iframe src="data:text/html,<script>alert('XSS')</script>"></iframe>

// HTML 實體編碼測試
&#60;script&#62;alert('XSS')&#60;/script&#62;
```

### 預期結果

✅ **安全**：所有內容都應該被當作文字顯示，不會執行腳本
❌ **不安全**：如果出現彈窗或執行腳本，表示有漏洞

## 最佳實踐總結

1. ✅ **永遠使用 React 的 JSX 渲染**，避免 `dangerouslySetInnerHTML`
2. ✅ **在儲存前清理輸入**（input sanitization）
3. ✅ **在渲染前再次驗證**（output encoding）
4. ✅ **使用 CSP 標頭**增加額外防護層
5. ✅ **定期審查代碼**，檢查是否有不安全的渲染方式
6. ✅ **使用工具函數**集中處理清理邏輯

## 相關資源

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [React Security Best Practices](https://reactsecurity.dev/)
- [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
