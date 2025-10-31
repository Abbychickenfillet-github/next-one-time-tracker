# AvatarUpload onUploadSuccess 流向說明

## 📤 資料流向圖

```
父組件 (Parent Component)
    ↓ 傳入函數
AvatarUpload 組件
    ↓ 接收 onUploadSuccess 參數
用戶選擇檔案
    ↓ 觸發 handleFileChange
上傳到 API
    ↓ 上傳成功
呼叫 onUploadSuccess(result.avatarUrl)
    ↓ 回傳結果
父組件收到結果
    ↓ 執行後續邏輯
更新 UI 或執行其他操作
```

## 🔄 詳細流程說明

### 1. **父組件定義回調函數**

```javascript
// 在父組件中
const handleAvatarSuccess = (avatarUrl) => {
  console.log('收到上傳結果:', avatarUrl)
  // 更新用戶頭貼
  // 重新載入頁面
  // 顯示成功訊息
  // 等等...
}
```

### 2. **傳入 AvatarUpload 組件**

```javascript
<AvatarUpload onUploadSuccess={handleAvatarSuccess} />
```

### 3. **AvatarUpload 接收參數**

```javascript
export default function AvatarUpload({ onUploadSuccess }) {
  // onUploadSuccess 是從外面傳進來的函數
}
```

### 4. **上傳成功時呼叫回調**

```javascript
if (response.ok) {
  // 將結果傳回給父組件
  if (onUploadSuccess) {
    onUploadSuccess(result.avatarUrl)
  }
}
```

## 💡 關鍵概念

### **onUploadSuccess 是 Props（屬性）**

- **來源**: 父組件傳入
- **類型**: 函數 (Function)
- **用途**: 回調函數 (Callback Function)
- **流向**: 父組件 → 子組件 → 父組件

### **為什麼需要這個回調？**

1. **組件解耦**: AvatarUpload 不需要知道父組件要做什麼
2. **靈活性**: 不同的父組件可以有不同的處理邏輯
3. **可重用性**: 同一個組件可以在不同地方使用

## 📋 實際使用範例

### 範例 1: Dashboard 頁面

```javascript
// app/dashboard/page.js
<AvatarUpload
  onUploadSuccess={() => {
    // 重新載入頁面以顯示新頭貼
    window.location.reload()
  }}
/>
```

### 範例 2: 測試頁面

```javascript
// app/image-upload-test/page.js
const handleAvatarUploadSuccess = (result) => {
  console.log('頭貼上傳成功:', result)
  setUploadResults((prev) => [
    ...prev,
    {
      type: 'avatar',
      url: result,
      timestamp: new Date().toLocaleString(),
    },
  ])
}

;<AvatarUpload onUploadSuccess={handleAvatarUploadSuccess} />
```

### 範例 3: 用戶設定頁面

```javascript
// app/user/settings/page.js
const handleAvatarSuccess = (avatarUrl) => {
  // 更新用戶狀態
  setUser((prev) => ({ ...prev, avatar: avatarUrl }))
  // 顯示成功訊息
  toast.success('頭貼更新成功！')
}

;<AvatarUpload onUploadSuccess={handleAvatarSuccess} />
```

## 🎯 總結

**`onUploadSuccess` 是從外面收進來的回調函數**

- ✅ **接收**: AvatarUpload 從父組件接收這個函數
- ✅ **呼叫**: 上傳成功時呼叫這個函數
- ✅ **傳遞**: 將上傳結果傳回給父組件
- ✅ **處理**: 父組件根據結果執行相應邏輯

這是一個典型的 **React 回調模式**，讓子組件能夠與父組件溝通。


















