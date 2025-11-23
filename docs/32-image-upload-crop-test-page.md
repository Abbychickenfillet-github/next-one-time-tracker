# 圖片上傳測試頁面（含預覽與裁切功能）

## 📍 頁面位置

**路徑**: `/image-upload-crop-test`

## 🎯 功能特色

### 1. **圖片選擇**

- 支援 JPG、PNG、WebP、GIF 格式
- 檔案大小限制：5MB
- 即時檔案驗證

### 2. **圖片預覽**

- 選擇檔案後立即顯示預覽
- 使用 FileReader API 創建預覽
- 響應式設計，適應不同螢幕尺寸

### 3. **圖片裁切**

- 使用 `react-image-crop` 套件
- 可拖曳選擇裁切區域
- 即時顯示裁切後預覽
- 支援任意比例裁切
- 最小裁切尺寸：100x100 像素

### 4. **圖片上傳**

- 可選擇上傳原始圖片或裁切後的圖片
- 上傳到 Cloudinary 的 `test-uploads` 資料夾
- 顯示詳細的上傳結果資訊

## 🔧 技術實現

### **使用的套件**

- `react-image-crop` - 圖片裁切功能
- `react-bootstrap` - UI 組件
- `next/image` - 圖片優化顯示

### **核心功能**

#### **1. 檔案選擇與預覽**

```javascript
const handleFileSelect = (e) => {
  const file = e.target.files[0]
  const reader = new FileReader()
  reader.onload = () => {
    setPreview(reader.result) // data URL
  }
  reader.readAsDataURL(file)
}
```

#### **2. 圖片裁切**

```javascript
const onCropComplete = (crop) => {
  // 使用 Canvas API 裁切圖片
  const canvas = document.createElement('canvas')
  ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, ...)
  canvas.toBlob((blob) => {
    const croppedUrl = URL.createObjectURL(blob)
    setCroppedImage(croppedUrl)
  })
}
```

#### **3. 上傳處理**

```javascript
// 如果有裁切後的圖片，使用裁切後的；否則使用原始圖片
if (croppedImage) {
  const blob = await fetch(croppedImage).then((r) => r.blob())
  formData.append('image', blob, fileName)
} else {
  formData.append('image', selectedFile)
}
```

## 📋 使用流程

1. **選擇圖片** - 點擊「選擇圖片檔案」按鈕
2. **預覽圖片** - 左側顯示原始圖片預覽
3. **裁切圖片** - 在圖片上拖曳選擇裁切區域
4. **查看裁切結果** - 右側顯示裁切後的預覽
5. **上傳圖片** - 點擊「上傳圖片」按鈕
6. **查看結果** - 顯示上傳成功的詳細資訊

## 🎨 UI 特色

- **雙欄布局** - 左側原始圖片，右側裁切預覽
- **即時反饋** - 所有操作都有視覺反饋
- **響應式設計** - 適配手機、平板、電腦
- **錯誤處理** - 友好的錯誤提示訊息
- **載入狀態** - 上傳時顯示載入動畫

## 💡 注意事項

### **記憶體管理**

- 使用 `URL.revokeObjectURL()` 清理 blob URL
- FileReader 創建的 data URL 不需要 revoke
- 組件卸載時自動清理所有 URL

### **檔案格式**

- 裁切後的圖片統一轉換為 JPEG 格式
- 品質設定為 0.95（95%）
- 保持原始檔案的色彩資訊

### **裁切限制**

- 最小裁切尺寸：100x100 像素
- 支援任意比例裁切
- 自動計算實際裁切尺寸（考慮圖片縮放）

## 🚀 未來改進

1. **固定比例裁切** - 支援 1:1、4:3、16:9 等固定比例
2. **旋轉功能** - 支援圖片旋轉
3. **多圖上傳** - 支援一次上傳多張圖片
4. **批量裁切** - 一次裁切多張圖片
5. **進度顯示** - 顯示上傳進度條

## 📊 測試建議

1. 測試不同格式的圖片（JPG、PNG、WebP、GIF）
2. 測試不同尺寸的圖片（小圖、大圖）
3. 測試裁切功能（各種裁切區域）
4. 測試上傳功能（原始 vs 裁切後）
5. 測試錯誤處理（檔案過大、格式錯誤等）







