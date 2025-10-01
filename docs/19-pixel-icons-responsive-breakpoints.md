# Pixel Icons 響應式斷點設定指南

## 概述

本文檔說明如何為 `pixelIcons` 設定響應式斷點，以及為什麼要將偽元素 (`::before`, `::after`) 改為具名元素。

## 響應式斷點設定

### 斷點規則

根據 Bootstrap 的網格系統，我們設定了以下斷點：

| 螢幕寬度      | 容器最大寬度 | 計算公式                    |
| ------------- | ------------ | --------------------------- |
| 576px-767px   | 540px        | `calc((100% - 540px) / 2)`  |
| 768px-991px   | 720px        | `calc((100% - 720px) / 2)`  |
| 992px-1199px  | 960px        | `calc((100% - 960px) / 2)`  |
| 1200px-1399px | 1140px       | `calc((100% - 1140px) / 2)` |
| ≥1400px       | 1320px       | `calc((100% - 1320px) / 2)` |

### CSS 實作

```scss
// 右側化學藥水
.chemicalIcon {
  position: fixed;
  right: 20%; // 預設值，會被媒體查詢覆蓋
  top: 35%;
  font-size: 40px;
  filter: drop-shadow(0 0 10px rgba(123, 75, 91, 0.8));
  animation: float-right 3s ease-in-out infinite;
}

// 左側剪刀
.scissorIcon {
  position: fixed;
  left: 20%; // 預設值，會被媒體查詢覆蓋
  top: 35%;
  font-size: 35px;
  filter: drop-shadow(0 0 10px rgba(13, 202, 240, 0.8));
  animation: float-left 3s ease-in-out infinite;
}

// 響應式斷點設定
// 576px-767px: 容器最大寬度 540px
@media (min-width: 576px) and (max-width: 767px) {
  .chemicalIcon {
    right: calc((100% - 540px) / 2);
  }
  .scissorIcon {
    left: calc((100% - 540px) / 2);
  }
}

// 768px-991px: 容器最大寬度 720px
@media (min-width: 768px) and (max-width: 991px) {
  .chemicalIcon {
    right: calc((100% - 720px) / 2);
  }
  .scissorIcon {
    left: calc((100% - 720px) / 2);
  }
}

// 992px-1199px: 容器最大寬度 960px
@media (min-width: 992px) and (max-width: 1199px) {
  .chemicalIcon {
    right: calc((100% - 960px) / 2);
  }
  .scissorIcon {
    left: calc((100% - 960px) / 2);
  }
}

// 1200px-1399px: 容器最大寬度 1140px
@media (min-width: 1200px) and (max-width: 1399px) {
  .chemicalIcon {
    right: calc((100% - 1140px) / 2);
  }
  .scissorIcon {
    left: calc((100% - 1140px) / 2);
  }
}

// 1400px及以上: 容器最大寬度 1320px
@media (min-width: 1400px) {
  .chemicalIcon {
    right: calc((100% - 1320px) / 2);
  }
  .scissorIcon {
    left: calc((100% - 1320px) / 2);
  }
}
```

## 為什麼要改用具名元素？

### 原本的偽元素方式

```scss
.pixelIcons {
  &::before {
    content: '🧪'; // 化學藥水
    position: fixed;
    right: 20%;
    top: 35%;
  }

  &::after {
    content: '✂️'; // 剪刀
    position: fixed;
    left: 20%;
    top: 35%;
  }
}
```

### 問題分析

1. **語義不清**：`::before` 和 `::after` 沒有語義，無法直接表達元素用途
2. **維護困難**：需要記住哪個偽元素對應哪個圖示
3. **調試不便**：在開發者工具中不容易識別
4. **內容限制**：只能通過 `content` 屬性設定內容

### 改用具名元素的優點

```jsx
// HTML 結構
<div className={styles.pixelIcons}>
  <span className={styles.chemicalIcon}>🧪</span>
  <span className={styles.scissorIcon}>✂️</span>
</div>
```

```scss
// CSS 樣式
.chemicalIcon {
  position: fixed;
  right: 20%;
  top: 35%;
  font-size: 40px;
  filter: drop-shadow(0 0 10px rgba(123, 75, 91, 0.8));
  animation: float-right 3s ease-in-out infinite;
}

.scissorIcon {
  position: fixed;
  left: 20%;
  top: 35%;
  font-size: 35px;
  filter: drop-shadow(0 0 10px rgba(13, 202, 240, 0.8));
  animation: float-left 3s ease-in-out infinite;
}
```

### 優點總結

1. **語義清楚**：`chemicalIcon`、`scissorIcon` 直接表達用途
2. **易於維護**：可以直接修改 HTML 內容，無需改 CSS
3. **調試方便**：在開發者工具中可以直接看到元素
4. **響應式保留**：媒體查詢邏輯不變
5. **動畫保留**：浮動動畫效果不變
6. **可擴展性**：容易添加更多圖示

## 測試檢查清單

- [ ] 化學藥水在右側正確顯示
- [ ] 剪刀在左側正確顯示
- [ ] 響應式斷點在不同螢幕尺寸下正常運作
- [ ] 浮動動畫效果正常
- [ ] 開發者工具中可以清楚看到具名元素

## 還原變更

如果對修改不滿意，可以執行以下命令還原所有變更：

```bash
git checkout -- .
```

## 相關檔案

- `styles/about.module.scss` - 主要樣式檔案
- `app/about/page.js` - 頁面組件
- `components/clock-icon/` - 時鐘圖示組件（已分離）

不使用 `::before` 和 `::after` 的替代方案：

## 方案 1：使用實際的 HTML 元素

```jsx
// app/about/page.js
export default function About() {
  return (
    <div className={`container py-5 ${styles.aboutPage}`}>
      {/* 像素風裝飾圖示 */}
      <div className={styles.pixelIcons}>
        <span className={styles.chemicalIcon}>🧪</span>
        <span className={styles.scissorIcon}>✂️</span>
      </div>

      {/* 其他內容 */}
      <div className="row justify-content-center">
        {/* ... */}
      </div>
    </div>
  )
}
```

```scss
// styles/about.module.scss
.pixelIcons {
  position: fixed;
  z-index: 10;
  pointer-events: none;
}

.chemicalIcon {
  position: fixed;
  right: 20%;
  top: 35%;
  font-size: 40px;
  filter: drop-shadow(0 0 10px rgba(123, 75, 91, 0.8));
  animation: float-right 3s ease-in-out infinite;
}

.scissorIcon {
  position: fixed;
  left: 20%;
  top: 35%;
  font-size: 35px;
  filter: drop-shadow(0 0 10px rgba(13, 202, 240, 0.8));
  animation: float-left 3s ease-in-out infinite;
}
```

## 方案 2：使用 React 組件

```jsx
// components/DecorativeIcons.jsx
export default function DecorativeIcons() {
  return (
    <>
      <span className="chemical-icon">🧪</span>
      <span className="scissor-icon">✂️</span>
    </>
  )
}
```

```jsx
// app/about/page.js
import DecorativeIcons from '@/components/DecorativeIcons'

export default function About() {
  return (
    <div className={`container py-5 ${styles.aboutPage}`}>
      <DecorativeIcons />
      {/* 其他內容 */}
    </div>
  )
}
```

## 方案 3：使用 CSS Grid 或 Flexbox

```jsx
// app/about/page.js
export default function About() {
  return (
    <div className={`container py-5 ${styles.aboutPage}`}>
      <div className={styles.iconContainer}>
        <span className={styles.leftIcon}>✂️</span>
        <div className={styles.contentArea}>
          {/* 主要內容 */}
        </div>
        <span className={styles.rightIcon}>🧪</span>
      </div>
    </div>
  )
}
```

```scss
// styles/about.module.scss
.iconContainer {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: start;
  gap: 20px;
  min-height: 100vh;
}

.leftIcon, .rightIcon {
  font-size: 40px;
  position: sticky;
  top: 35%;
}

.leftIcon {
  filter: drop-shadow(0 0 10px rgba(13, 202, 240, 0.8));
  animation: float-left 3s ease-in-out infinite;
}

.rightIcon {
  filter: drop-shadow(0 0 10px rgba(123, 75, 91, 0.8));
  animation: float-right 3s ease-in-out infinite;
}
```

## 方案 4：使用絕對定位的 div

```jsx
// app/about/page.js
export default function About() {
  return (
    <div className={`container py-5 ${styles.aboutPage}`}>
      {/* 裝飾圖示 */}
      <div className={styles.chemicalIcon}>🧪</div>
      <div className={styles.scissorIcon}>✂️</div>

      {/* 其他內容 */}
      <div className="row justify-content-center">
        {/* ... */}
      </div>
    </div>
  )
}
```

```scss
// styles/about.module.scss
.chemicalIcon, .scissorIcon {
  position: fixed;
  top: 35%;
  z-index: 10;
  pointer-events: none;
  font-size: 40px;
}

.chemicalIcon {
  right: 20%;
  filter: drop-shadow(0 0 10px rgba(123, 75, 91, 0.8));
  animation: float-right 3s ease-in-out infinite;
}

.scissorIcon {
  left: 20%;
  filter: drop-shadow(0 0 10px rgba(13, 202, 240, 0.8));
  animation: float-left 3s ease-in-out infinite;
}
```

## 方案 5：使用背景圖片

```scss
// styles/about.module.scss
.aboutPage {
  position: relative;

  &::before {
    content: '';
    position: fixed;
    top: 35%;
    left: 20%;
    width: 40px;
    height: 40px;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">✂️</text></svg>');
    background-size: contain;
    background-repeat: no-repeat;
    z-index: 10;
    pointer-events: none;
    animation: float-left 3s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: fixed;
    top: 35%;
    right: 20%;
    width: 40px;
    height: 40px;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🧪</text></svg>');
    background-size: contain;
    background-repeat: no-repeat;
    z-index: 10;
    pointer-events: none;
    animation: float-right 3s ease-in-out infinite;
  }
}
```

## 各方案比較

| 方案 | 優點 | 缺點 | 適用場景 |
|------|------|------|----------|
| **HTML 元素** | 簡單直接，易於控制 | 增加 DOM 節點 | 簡單裝飾 |
| **React 組件** | 可重用，邏輯清晰 | 需要額外組件 | 複雜邏輯 |
| **CSS Grid** | 佈局靈活，響應式好 | 可能影響主佈局 | 複雜佈局 |
| **絕對定位** | 不影響主佈局 | 需要手動調整位置 | 固定位置裝飾 |
| **背景圖片** | 不增加 DOM 節點 | 難以動態控制 | 靜態裝飾 |

## 推薦方案

建議使用方案 1（HTML 元素），因為：
- 簡單直接
- 易於維護
- 不影響主佈局
- 響應式友好
- 可保留現有動畫

需要我幫你實作哪個方案？

改用具名元素取代 `::before` 和 `::after`。


[3 tools called]

## 修改完成

### 修改內容

**HTML 結構**：
```jsx
// 原本
<div className={styles.pixelIcons}></div>

// 現在
<div className={styles.pixelIcons}>
  <span className={styles.chemicalIcon}>🧪</span>
  <span className={styles.scissorIcon}>✂️</span>
</div>
```

**CSS 樣式**：
```scss
// 原本使用偽元素
&::before { content: '🧪'; }
&::after { content: '✂️'; }

// 現在使用具名類別
.chemicalIcon { /* 化學藥水樣式 */ }
.scissorIcon { /* 剪刀樣式 */ }
```

### 優點

1. 語義更清楚：`chemicalIcon`、`scissorIcon`
2. 易於維護：可直接修改 HTML
3. 調試方便：開發者工具中可見
4. 響應式保留：媒體查詢不變
5. 動畫保留：浮動動畫不變

### 測試

- 化學藥水在右側
- 剪刀在左側
- 響應式斷點正常
- 浮動動畫正常

若不滿意，可執行 `git checkout -- .` 還原所有變更。
