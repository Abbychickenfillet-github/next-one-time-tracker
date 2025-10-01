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

## 更新日期

2024年12月 - 初始版本
