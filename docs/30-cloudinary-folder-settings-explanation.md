# Cloudinary 資料夾和設定說明

## 1. 📁 兩組上傳的圖片會到同一個資料夾嗎？

### **答案：不會，它們會到不同的資料夾**

#### **頭貼上傳** (`/api/upload/avatar`)

- **資料夾名稱**: `avatars`
- **設定位置**: `app/(api)/api/upload/avatar/route.js` 第 76 行
- **程式碼**: `folder: 'avatars'`

#### **一般圖片上傳** (`/api/upload/image`)

- **資料夾名稱**: `general` (預設)
- **設定位置**: `app/(api)/api/upload/image/route.js` 第 31 行
- **程式碼**: `const folder = formData.get('folder') || 'general'`
- **可自訂**: 可以透過 formData 傳入自訂資料夾名稱

### **換密鑰後資料夾會不同嗎？**

**答案：不會**

- 資料夾名稱是在**程式碼中設定**的，不是由密鑰決定
- 換密鑰只會影響**認證**，不會影響資料夾結構
- 只要使用相同的 `cloud_name`，資料夾就會保持相同

### **為什麼後台看到的沒有分資料夾？**

Cloudinary 後台的顯示方式：

- **Media Library** 預設顯示所有圖片（不分資料夾）
- 需要點擊左側的資料夾選單才能看到資料夾結構
- 或者使用搜尋功能：`folder:avatars` 或 `folder:general`

## 2. 🔧 My Default Preset 是什麼意思？

### **定義**

**My Default Preset** 是 Cloudinary 的**預設轉換設定**（Transformation Preset）

### **功能**

- 預先定義一組圖片轉換設定
- 可以在上傳時自動套用
- 避免重複設定相同的轉換參數

### **在您的專案中**

您使用的是**程式碼中的轉換設定**，而不是 Cloudinary 後台的 Preset：

- `AVATAR_TRANSFORMATIONS` - 頭貼轉換設定
- `GENERAL_IMAGE_TRANSFORMATIONS` - 一般圖片轉換設定

### **使用 Preset 的方式（可選）**

```javascript
// 如果要在 Cloudinary 後台設定 Preset
cloudinary.uploader.upload_stream({
  folder: 'avatars',
  upload_preset: 'my_default_preset', // 使用後台的 Preset
})
```

## 3. 📂 Dynamic Folder 在 Cloudinary 是什麼意思？

### **定義**

**Dynamic Folder** 是根據**動態條件**來決定資料夾名稱的功能

### **使用場景**

```javascript
// 範例：根據日期動態建立資料夾
const folder = `uploads/${new Date().getFullYear()}/${new Date().getMonth() + 1}`
// 結果：uploads/2024/1

// 範例：根據用戶ID動態建立資料夾
const folder = `users/${userId}/avatars`
// 結果：users/123/avatars
```

### **在您的專案中**

您目前使用的是**固定資料夾名稱**：

- 頭貼：`avatars` (固定)
- 一般圖片：`general` (固定，但可透過 formData 自訂)

### **如果要使用 Dynamic Folder**

```javascript
// 在 app/(api)/api/upload/image/route.js 中
const folder =
  formData.get('folder') ||
  `general/${new Date().getFullYear()}/${new Date().getMonth() + 1}`
```

## 4. 📍 資料夾名稱在哪裡設定？

### **頭貼資料夾 (`avatars`)**

**位置**: `app/(api)/api/upload/avatar/route.js` 第 76 行

```javascript
const uploadResult = await uploadImage(buffer, {
  folder: 'avatars', // ← 這裡設定
  publicId: `user_${payload.payload.userId}`,
  overwrite: true,
  transformations: AVATAR_TRANSFORMATIONS,
})
```

### **一般圖片資料夾 (`general`)**

**位置**: `app/(api)/api/upload/image/route.js` 第 31 行

```javascript
const folder = formData.get('folder') || 'general' // ← 這裡設定
```

**使用位置**: 第 80 行

```javascript
const uploadResult = await uploadImage(buffer, {
  folder: folder, // ← 使用上面設定的 folder
  publicId: `${folder}_${payload.payload.userId}_${Date.now()}`,
  overwrite: false,
  transformations: transformations,
})
```

## 5. 📦 uploadImage 和 GENERAL_IMAGE_TRANSFORMATIONS 介紹

### **uploadImage 函數**

#### **位置**: `lib/cloudinary.js` 第 43 行

#### **功能**

- Cloudinary 圖片上傳的核心函數
- 將 Buffer 轉換為 Stream 並上傳
- 支援自訂資料夾、公開ID、轉換設定等

#### **參數**

```javascript
uploadImage(buffer, {
  folder: 'avatars',        // 資料夾名稱
  publicId: 'user_123',     // 圖片唯一識別符
  overwrite: true,           // 是否覆蓋現有檔案
  transformations: [...]    // 圖片轉換設定陣列
})
```

#### **回傳值**

```javascript
{
  secure_url: 'https://res.cloudinary.com/...',
  public_id: 'avatars/user_123',
  width: 200,
  height: 200,
  format: 'webp',
  bytes: 12345,
  // ... 其他 metadata
}
```

### **GENERAL_IMAGE_TRANSFORMATIONS**

#### **位置**: `lib/cloudinary.js` 第 162 行

#### **定義**

```javascript
export const GENERAL_IMAGE_TRANSFORMATIONS = [
  { width: 800, height: 600, crop: 'limit' },
  { format: 'webp', quality: 'auto' },
]
```

#### **參數說明**

- **width: 800** - 最大寬度 800 像素
- **height: 600** - 最大高度 600 像素
- **crop: 'limit'** - 保持原始比例，不裁切（只縮小不放大）
- **format: 'webp'** - 轉換為 WebP 格式（更小的檔案大小）
- **quality: 'auto'** - 自動調整品質以平衡檔案大小和畫質

#### **與 AVATAR_TRANSFORMATIONS 的差異**

| 特性        | AVATAR_TRANSFORMATIONS | GENERAL_IMAGE_TRANSFORMATIONS |
| ----------- | ---------------------- | ----------------------------- |
| **尺寸**    | 200x200 (固定)         | 800x600 (最大限制)            |
| **crop**    | 'fill' (填滿，會裁切)  | 'limit' (保持比例，不裁切)    |
| **gravity** | 'face' (人臉偵測)      | 無                            |
| **用途**    | 頭貼圖片               | 一般圖片                      |

## 📊 總結

### **資料夾結構**

```
Cloudinary
├── avatars/          (頭貼上傳)
│   └── user_123
└── general/          (一般圖片上傳)
    └── general_user_123_1234567890
```

### **關鍵要點**

1. ✅ 兩組上傳到**不同資料夾**（`avatars` vs `general`）
2. ✅ 換密鑰**不會影響**資料夾結構
3. ✅ 資料夾名稱在**程式碼中設定**，不是由密鑰決定
4. ✅ 後台需要點擊資料夾選單才能看到資料夾結構
5. ✅ `uploadImage` 是上傳函數，`GENERAL_IMAGE_TRANSFORMATIONS` 是轉換設定

### **修改資料夾名稱**

如果要修改資料夾名稱，只需要修改對應的程式碼：

- 頭貼：修改 `app/(api)/api/upload/avatar/route.js` 第 76 行
- 一般圖片：修改 `app/(api)/api/upload/image/route.js` 第 31 行
