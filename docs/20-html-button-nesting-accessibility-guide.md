# HTML 按鈕嵌套限制與無障礙性指南

## 🚫 HTML 規範限制

### 問題根源

```html
<!-- ❌ 錯誤：button 不能嵌套在 button 內 -->
<button>
  <button>內部按鈕</button>
</button>
```

### HTML 規範規定

根據 HTML 規範，**互動式元素不能嵌套**：

- `<button>` 不能包含其他 `<button>`
- `<a>` 不能包含其他 `<a>` 或 `<button>`
- `<input>` 不能包含其他互動式元素

## 🔍 為什麼會有這個限制？

### 1. 語義衝突

```html
<!-- 這會造成語義混亂 -->
<button onclick="外層動作">
  <button onclick="內層動作">點擊我</button>
</button>
```

**問題**：點擊時應該執行哪個動作？

### 2. 鍵盤導航問題

```html
<!-- 鍵盤導航會混亂 -->
<button tabindex="0">
  <button tabindex="0">內部</button>
</button>
```

**問題**：Tab 鍵應該聚焦到哪個按鈕？

### 3. 輔助技術混淆

```html
<!-- 螢幕閱讀器會混淆 -->
<button role="button">
  <button role="button">內部</button>
</button>
```

**問題**：螢幕閱讀器不知道該讀出什麼

## ✅ 正確的解決方案

### 方案 1：使用 div + 無障礙性屬性（推薦）

```javascript
;<div
  role="button" // 告訴輔助技術這是按鈕
  tabIndex={0} // 允許鍵盤聚焦
  onClick={handleClick} // 滑鼠點擊
  onKeyDown={handleKeyDown} // 鍵盤操作
  aria-label="選擇訂閱方案" // 提供描述
>
  選擇方案
</div>

// 鍵盤事件處理
const handleKeyDown = (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    handleClick()
  }
}
```

### 方案 2：混合使用（如 subscription 頁面）

```javascript
// ✅ 正確：div 包含 button
<div role="button" tabIndex={0} onClick={() => setSelectedPlan(key)}>
  {/* 方案內容 */}
  <div className={styles.planAction}>
    <button
      onClick={(e) => {
        e.stopPropagation() // 阻止事件冒泡
        setSelectedPlan(key)
      }}
    >
      選擇方案
    </button>
  </div>
</div>
```

## 🎯 無障礙性屬性說明

### `role="button"`

- **作用**：告訴螢幕閱讀器這是一個按鈕
- **語義化標識**：讓輔助技術知道這是可互動元素
- **輔助技術支援**：螢幕閱讀器會讀出「按鈕」而不是「文字」

### `tabIndex={0}`

- **作用**：讓元素可以用 Tab 鍵聚焦
- **鍵盤導航**：提供視覺焦點指示
- **鍵盤操作**：支援 Enter 和 Space 鍵觸發

### `tabIndex` 的不同值

```javascript
tabIndex={-1}  // 不可聚焦（程式化聚焦）
tabIndex={0}   // 自然聚焦順序
tabIndex={1}   // 優先聚焦（不建議使用）
tabIndex={2}   // 更高優先級（不建議使用）
```

## 📊 實際範例對比

### ❌ 無障礙性差的寫法

```javascript
<div onClick={handleClick}>點擊我</div>
```

**問題**：

- 螢幕閱讀器不知道這是按鈕
- 無法用鍵盤導航
- 無法用鍵盤操作

### ✅ 無障礙性好的寫法

```javascript
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }}
  aria-label="選擇訂閱方案"
>
  選擇方案
</div>
```

**優點**：

- 螢幕閱讀器知道這是按鈕
- 可以用 Tab 鍵聚焦
- 可以用 Enter/Space 鍵操作
- 提供清楚的描述

## 🌟 為什麼要重視無障礙性？

1. **法律合規**：許多國家要求網站符合無障礙性標準
2. **用戶體驗**：讓所有用戶都能使用您的網站
3. **SEO 優化**：搜尋引擎更喜歡無障礙性好的網站
4. **專業性**：展現對所有用戶的關懷

## 🔧 其他解決方案

### 方案 1：只有按鈕

```javascript
<div className={styles.planCard}>
  {/* 方案內容 */}
  <button onClick={() => setSelectedPlan(key)}>選擇方案</button>
</div>
```

### 方案 2：只有可點擊的 div

```javascript
<div
  className={styles.planCard}
  role="button"
  tabIndex={0}
  onClick={() => setSelectedPlan(key)}
>
  {/* 方案內容 */}
  <span>選擇方案</span>
</div>
```

## 📝 總結

- **HTML 規範**：互動式元素不能嵌套
- **解決方案**：使用 `role="button"` 和 `tabIndex={0}` 保持無障礙性
- **最佳實踐**：提供鍵盤操作支援和清楚的語義標識
- **用戶體驗**：確保所有用戶都能正常使用您的網站

---

_文檔創建日期：2024年_
_適用於：Next.js 專案中的 React 組件開發_
