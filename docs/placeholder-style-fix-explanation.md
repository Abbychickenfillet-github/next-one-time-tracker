# Placeholder 樣式問題解答

## 1. 轉義是什麼意思？

**轉義（Escape）** 是指在程式碼中使用特殊字符時，需要用特殊方式來表示它們，避免被誤解為程式語法的一部分。

### 常見的轉義例子

#### 在 SQL 中：

```sql
-- 單引號需要轉義成兩個單引號
INSERT INTO users (name) VALUES ('O''Brien');  -- O'Brien
--                      ↑↑ 兩個單引號 = 一個單引號字符
```

#### 在 JavaScript 中：

```javascript
// 反斜線需要轉義
const path = 'C:\\Users\\Documents' // C:\Users\Documents
//              ↑↑  轉義的反斜線

// 單引號需要轉義
const text = "It's a beautiful day" // It's a beautiful day
//                   ↑  轉義的單引號
```

#### 在 CSS 中：

```css
/* 引號需要轉義 */
.content::before {
  content: 'Hello "World"';
  /*            ↑↑    轉義的引號 */
}
```

### 為什麼要轉義？

```javascript
// ❌ 錯誤：JavaScript 認為字符串在這裡結束了
const text = 'It's a beautiful day';
//                  ↑ 字符串在這裡結束，後面會報錯

// ✅ 正確：使用轉義
const text = 'It\'s a beautiful day';
//                  ↑ 轉義的單引號，被當作字符處理
```

### PostgreSQL 的 $$ 標記（不需要轉義）

```sql
-- ❌ 使用單引號：需要轉義
DO '
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables
               WHERE table_schema = ''public'') THEN ...
END ';
--                       ↑↑ 需要轉義成兩個單引號

-- ✅ 使用 $$：不需要轉義
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables
               WHERE table_schema = 'public') THEN ...
END $$;
--                       ↑ 不需要轉義，直接寫即可
```

**簡單來說**：轉義就是告訴電腦「這個符號是內容，不是程式語法」。

## 2. .form-control::placeholder 為什麼沒有用？

### 問題原因

1. **CSS 選擇器優先級不夠**：Bootstrap 或其他全局樣式可能有更高優先級
2. **瀏覽器特定樣式**：某些瀏覽器需要特定前綴
3. **全局樣式覆蓋**：`globals.scss` 中的樣式可能被覆蓋

### 解決方案

使用**更具體**的選擇器並加上 `!important`：

```css
/* ❌ 不夠具體 */
.form-control::placeholder {
  color: white;
}

/* ✅ 更具體，優先級更高 */
input.form-control::placeholder,
input[type='text'].form-control::placeholder,
input[type='email'].form-control::placeholder {
  color: rgba(255, 255, 255, 0.9) !important;
  opacity: 1 !important;
}
```

### 為什麼要加 `input` 前綴？

```css
/* 選擇器優先級計算 */
.form-control::placeholder          /* 優先級 = 10 */
input.form-control::placeholder     /* 優先級 = 21 (更高) */
input[type="email"].form-control::placeholder  /* 優先級 = 31 (最高) */
```

優先級越高，越容易覆蓋其他樣式。

## 3. 為什麼只有註冊的姓名 input 是白色的？

### 發現的問題

```jsx
// 姓名 input（placeholder 是白色）
className = 'form-control form-control-lg bg-white border-white...'
//                            ↑ bg-white（沒有 bg-opacity-10）

// 郵箱 input（placeholder 是黑色）
className =
  'form-control form-control-lg bg-white bg-opacity-10 border-white...'
//                            ↑ bg-white bg-opacity-10（半透明）
```

### 原因分析

1. **背景顏色不同**：

   - `bg-white` = 純白色背景（不透明）
   - `bg-white bg-opacity-10` = 半透明白色背景

2. **對比度問題**：

   - 純白背景：placeholder 文字可能因為某些樣式或瀏覽器行為顯示為白色
   - 半透明背景：placeholder 文字可能被全局樣式覆蓋成黑色

3. **樣式覆蓋順序**：
   - 可能 Bootstrap 的預設樣式在不同背景下被應用的優先級不同

### 解決方案

統一所有 input 的背景和 placeholder 樣式：

```jsx
// ✅ 統一背景樣式
className =
  'form-control form-control-lg bg-white bg-opacity-10 border-white border-opacity-25 text-white'
```

並使用更強制的 CSS 選擇器：

```css
/* ✅ 所有 input 類型的 placeholder 都設為白色 */
input.form-control::placeholder,
input[type='text'].form-control::placeholder,
input[type='email'].form-control::placeholder,
input[type='password'].form-control::placeholder {
  color: rgba(255, 255, 255, 0.9) !important;
  opacity: 1 !important;
}
```

## 📊 總結

| 問題                        | 原因                                     | 解決方案                                     |
| --------------------------- | ---------------------------------------- | -------------------------------------------- |
| **轉義是什麼？**            | 在程式碼中使用特殊字符需要用特殊方式表示 | 使用轉義字符（如 `\'`）或特殊標記（如 `$$`） |
| **placeholder 沒用？**      | CSS 選擇器優先級不夠                     | 使用更具體的選擇器 + `!important`            |
| **只有姓名 input 是白色？** | 背景樣式不同 + 優先級問題                | 統一背景樣式 + 強制 placeholder 顏色         |

## 🎯 最終修復

已經修復：

1. ✅ 統一所有 input 的背景樣式（都使用 `bg-opacity-10`）
2. ✅ 使用更具體的 CSS 選擇器
3. ✅ 添加所有瀏覽器前綴
4. ✅ 設置 `opacity: 1 !important` 確保不透明度生效

現在所有 placeholder 應該都是白色的了！
