# toLocaleString() 選項參數說明

## 概述

`toLocaleString()` 是 JavaScript Date 物件的標準方法，用於將日期時間格式化為本地化的字串。它接受兩個參數：

1. `locales` (可選)：語言代碼，如 `'zh-TW'`、`'en-US'`
2. `options` (可選)：格式選項物件

## 當前 formatTimeDisplay 使用的選項

```javascript
dateObj.toLocaleString('zh-TW', {
  hour12: false, // 使用 24 小時制（不使用 AM/PM）
  year: 'numeric', // 年份顯示為完整數字（如：2024）
  month: '2-digit', // 月份顯示為兩位數（如：01, 02, ..., 12）
  day: '2-digit', // 日期顯示為兩位數（如：01, 02, ..., 31）
  hour: '2-digit', // 小時顯示為兩位數（如：00, 01, ..., 23）
  minute: '2-digit', // 分鐘顯示為兩位數（如：00, 01, ..., 59）
  second: '2-digit', // 秒數顯示為兩位數（如：00, 01, ..., 59）
})
```

### 輸出範例

```
2024/01/15 14:30:25
```

## 選項參數詳解

### 1. hour12 (布林值)

- **`false`**：使用 24 小時制
  - 範例：`14:30:25`
- **`true`**：使用 12 小時制（AM/PM）
  - 範例：`下午 2:30:25` 或 `2:30:25 PM`
- **不設置**：根據 locale 的預設值

### 2. year (字串)

- **`'numeric'`**：完整年份（4 位數）
  - 範例：`2024`
- **`'2-digit'`**：兩位數年份
  - 範例：`24`

### 3. month (字串)

- **`'numeric'`**：數字月份（1-12）
  - 範例：`1`, `12`
- **`'2-digit'`**：兩位數月份（01-12）
  - 範例：`01`, `12`
- **`'long'`**：完整月份名稱
  - 範例：`一月`, `十二月`
- **`'short'`**：簡短月份名稱
  - 範例：`1月`, `12月`
- **`'narrow'`**：最簡月份名稱
  - 範例：`1`, `12`

### 4. day (字串)

- **`'numeric'`**：數字日期（1-31）
  - 範例：`1`, `31`
- **`'2-digit'`**：兩位數日期（01-31）
  - 範例：`01`, `31`

### 5. hour (字串)

- **`'numeric'`**：數字小時（0-23 或 1-12）
  - 範例：`0`, `14`, `23`
- **`'2-digit'`**：兩位數小時（00-23）
  - 範例：`00`, `14`, `23`

### 6. minute (字串)

- **`'numeric'`**：數字分鐘（0-59）
  - 範例：`0`, `30`, `59`
- **`'2-digit'`**：兩位數分鐘（00-59）
  - 範例：`00`, `30`, `59`

### 7. second (字串)

- **`'numeric'`**：數字秒數（0-59）
  - 範例：`0`, `30`, `59`
- **`'2-digit'`**：兩位數秒數（00-59）
  - 範例：`00`, `30`, `59`

## 不同配置的輸出範例

### 範例 1：當前配置（24 小時制，完整日期時間）

```javascript
new Date().toLocaleString('zh-TW', {
  hour12: false,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})
// 輸出：2024/01/15 14:30:25
```

### 範例 2：12 小時制

```javascript
new Date().toLocaleString('zh-TW', {
  hour12: true, // 改為 true
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})
// 輸出：2024/01/15 下午 02:30:25
```

### 範例 3：只顯示時間（不顯示日期）

```javascript
new Date().toLocaleString('zh-TW', {
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})
// 輸出：14:30:25
```

### 範例 4：只顯示日期（不顯示時間）

```javascript
new Date().toLocaleString('zh-TW', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
// 輸出：2024/01/15
```

### 範例 5：使用英文格式

```javascript
new Date().toLocaleString('en-US', {
  hour12: false,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})
// 輸出：01/15/2024, 14:30:25
```

## 為什麼使用這些選項？

### 1. `hour12: false`

- **原因**：24 小時制更適合時間記錄工具
- **優點**：避免 AM/PM 混淆，格式統一
- **適用場景**：專業時間追蹤、數據記錄

### 2. `year: 'numeric'`

- **原因**：顯示完整年份，避免混淆
- **優點**：明確顯示是哪一年
- **適用場景**：歷史記錄、跨年數據

### 3. `month/day/hour/minute/second: '2-digit'`

- **原因**：統一格式，方便排序和比較
- **優點**：固定寬度，視覺整齊
- **適用場景**：表格顯示、數據對齊

## 注意事項

1. **所有選項都是可選的**：如果不設置，會使用 locale 的預設值
2. **選項可以組合使用**：只設置需要的部分
3. **不同瀏覽器可能有細微差異**：但基本格式一致
4. **locale 影響格式**：`'zh-TW'` 和 `'en-US'` 的輸出格式不同

## 參考資料

- [MDN: Intl.DateTimeFormat](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [MDN: Date.prototype.toLocaleString()](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString)
2025/11/10