# HTTP 429 速率限制錯誤解決方案

## 🚨 問題分析

### **錯誤訊息**: `載入失敗: HTTP error! status: 429`

- **含義**: 請求過於頻繁，觸發速率限制
- **原因**: 在時間窗口內超過允許的 API 呼叫次數

## 📊 速率限制設定

### **當前限制**:

```javascript
const RATE_LIMITS = {
  0: {
    // 未付費用戶
    api: 30, // 每小時30次 API 呼叫
    db: 100, // 每天100次資料庫查詢
  },
  1: {
    // 已付費用戶
    api: 100, // 每小時100次 API 呼叫
    db: 500, // 每天500次資料庫查詢
  },
}
```

## 🔧 解決方案

### **方案 1: 等待重置時間**

- **等待時間**: 1小時後自動重置
- **建議**: 暫時停止頻繁操作

### **方案 2: 調整速率限制 (開發環境)**

```javascript
// 在 lib/rate-limit.js 中調整限制
const RATE_LIMITS = {
  0: {
    // 開發環境：提高限制
    api: 1000, // 每小時1000次 API 呼叫
    db: 5000, // 每天5000次資料庫查詢
  },
  1: {
    // 已付費用戶
    api: 2000, // 每小時2000次 API 呼叫
    db: 10000, // 每天10000次資料庫查詢
  },
}
```

### **方案 3: 清除速率限制快取**

```javascript
// 在瀏覽器 Console 中執行
localStorage.clear()
sessionStorage.clear()
// 然後重新整理頁面
```

### **方案 4: 暫時禁用速率限制**

```javascript
// 在 lib/rate-limit.js 中暫時返回允許
export function checkRateLimit(userId, userLevel, type = 'api') {
  // 開發環境：暫時禁用速率限制
  if (process.env.NODE_ENV === 'development') {
    return { allowed: true, remaining: 999, limit: 999 }
  }

  // 原有的速率限制邏輯...
}
```

## 🛠️ 立即修復步驟

### **步驟 1: 檢查當前限制狀態**

訪問 `/api/timelog/check-limit` 查看您的限制狀態

### **步驟 2: 調整開發環境限制**

修改 `lib/rate-limit.js` 中的 `RATE_LIMITS` 設定

### **步驟 3: 重新啟動應用**

```bash
npm run dev
```

### **步驟 4: 清除瀏覽器快取**

- 按 F12 開啟開發者工具
- 右鍵點擊重新整理按鈕
- 選擇「清空快取並強制重新整理」

## 📋 預防措施

### **1. 優化 API 呼叫**

- 減少不必要的 API 請求
- 使用快取機制
- 合併多個請求

### **2. 監控速率限制**

- 在前端顯示剩餘請求次數
- 提供速率限制狀態提示

### **3. 用戶體驗改善**

- 顯示友好的錯誤訊息
- 提供重試機制
- 顯示重置時間

## 🎯 建議的修改

### **開發環境設定**

```javascript
// lib/rate-limit.js
const RATE_LIMITS = {
  0: {
    // 開發環境：大幅提高限制
    api: process.env.NODE_ENV === 'development' ? 10000 : 30,
    db: process.env.NODE_ENV === 'development' ? 50000 : 100,
  },
  1: {
    // 已付費用戶
    api: process.env.NODE_ENV === 'development' ? 20000 : 100,
    db: process.env.NODE_ENV === 'development' ? 100000 : 500,
  },
}
```

這樣可以避免開發時的速率限制問題！


