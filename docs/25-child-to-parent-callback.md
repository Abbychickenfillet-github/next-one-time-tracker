# 子組件回傳資料給父組件的方式

## 🔄 子組件回傳機制

### **React 中，子組件無法直接回傳資料給父組件**

- ❌ 不能使用 `return` 語句回傳資料
- ❌ 不能直接修改父組件的狀態
- ✅ 只能透過 **回調函數 (Callback)** 來通知父組件

## 📤 回傳方式：回調函數 (Callback Function)

### 1. **父組件定義回調函數**

```javascript
// 父組件
function ParentComponent() {
  const handleUploadSuccess = (avatarUrl) => {
    console.log('子組件回傳的資料:', avatarUrl)
    // 處理回傳的資料
    setUserAvatar(avatarUrl)
  }

  return <AvatarUpload onUploadSuccess={handleUploadSuccess} />
}
```

### 2. **子組件接收並呼叫回調**

```javascript
// 子組件 (AvatarUpload)
export default function AvatarUpload({ onUploadSuccess }) {
  const handleFileChange = async (e) => {
    // ... 上傳邏輯 ...

    if (response.ok) {
      // 透過回調函數將資料傳回父組件
      if (onUploadSuccess) {
        onUploadSuccess(result.avatarUrl) // ← 這裡回傳資料
      }
    }
  }
}
```

## 🔍 Fetch Response 和 Result 詳細說明

### **Response 物件結構**

```javascript
Response {
  status: 200,           // HTTP 狀態碼
  statusText: "OK",      // 狀態文字
  ok: true,              // 是否成功 (200-299)
  headers: Headers,      // 回應標頭
  url: "...",           // 請求 URL
  type: "basic",        // 回應類型
  redirected: false     // 是否重導向
}
```

### **Result 資料結構 (成功時)**

```javascript
{
  success: true,
  message: "頭貼上傳成功",
  avatarUrl: "https://res.cloudinary.com/...",
  publicId: "avatars/user_123"
}
```

### **Result 資料結構 (失敗時)**

```javascript
{
  error: '請先登入'
}
```

## 📊 實際 Console.log 輸出範例

### 成功上傳時的輸出：

```
📡 Response 物件: Response {status: 200, statusText: "OK", ...}
📊 Response 狀態: {
  status: 200,
  statusText: "OK",
  ok: true,
  headers: {
    "content-type": "application/json",
    "content-length": "156"
  },
  url: "http://localhost:3000/api/upload/avatar",
  type: "basic",
  redirected: false
}
📦 Result 資料: {
  success: true,
  message: "頭貼上傳成功",
  avatarUrl: "https://res.cloudinary.com/djrvbjjrt/image/upload/v1234567890/avatars/user_123.webp",
  publicId: "avatars/user_123"
}
🔗 Result 類型: object
📋 Result 鍵值: ["success", "message", "avatarUrl", "publicId"]
```

### 失敗時的輸出：

```
📡 Response 物件: Response {status: 401, statusText: "Unauthorized", ...}
📊 Response 狀態: {
  status: 401,
  statusText: "Unauthorized",
  ok: false,
  headers: {...},
  url: "http://localhost:3000/api/upload/avatar",
  type: "basic",
  redirected: false
}
📦 Result 資料: {
  error: "請先登入"
}
🔗 Result 類型: object
📋 Result 鍵值: ["error"]
```

## 🔄 完整的資料流向

```
1. 父組件定義回調函數
   ↓
2. 傳入子組件作為 props
   ↓
3. 子組件接收 props
   ↓
4. 用戶操作觸發事件
   ↓
5. 子組件發送 fetch 請求
   ↓
6. 伺服器回應 Response
   ↓
7. 子組件解析 Result
   ↓
8. 子組件呼叫回調函數 ← 這裡回傳資料
   ↓
9. 父組件接收並處理資料
```

## 💡 關鍵概念

### **為什麼需要回調函數？**

1. **單向資料流**: React 遵循單向資料流原則
2. **組件解耦**: 子組件不需要知道父組件的具體實現
3. **可重用性**: 同一個子組件可以在不同父組件中使用
4. **事件驅動**: 透過事件通知父組件狀態變化

### **回調函數的優點**

- ✅ 靈活性高
- ✅ 組件解耦
- ✅ 可重用性強
- ✅ 符合 React 設計原則

## 🎯 總結

**子組件透過回調函數回傳資料給父組件**

1. **父組件**: 定義回調函數，傳入子組件
2. **子組件**: 接收回調函數，在適當時機呼叫
3. **資料傳遞**: 透過函數參數傳遞資料
4. **父組件**: 在回調函數中處理接收到的資料

這是一個典型的 **React 回調模式**，讓子組件能夠與父組件溝通！



