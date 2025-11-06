# 轉義（Escape）完整解釋

## 📚 什麼是轉義？

**轉義（Escape）** 是在程式碼中使用**特殊字符**時，需要用**特殊方式**來表示它們，避免被電腦誤解為**程式語法**的一部分。

### 簡單理解

想像你在寫一封信，但信紙上有些符號有特殊意義：

- 如果寫 `"`，電腦可能認為「這裡是字符串的開始或結束」
- 如果寫 `'`，電腦可能認為「這裡是字符串的邊界」
- 如果寫 `\`，電腦可能認為「這是轉義符號」

**轉義就是告訴電腦：「這個符號是內容，不是語法！」**

## 🎯 為什麼需要轉義？

### 問題場景

```javascript
// ❌ 錯誤：JavaScript 認為字符串在這裡結束了
const text = 'It's a beautiful day';
//                  ↑ 字符串在這裡結束，後面 's a beautiful day' 會報錯
```

### 解決方案：使用轉義

```javascript
// ✅ 正確：使用轉義告訴 JavaScript 這是內容
const text = "It's a beautiful day"
//                  ↑ 轉義的單引號，被當作字符內容處理
// 結果：It's a beautiful day
```

## 📝 各種語言的轉義範例

### 1. JavaScript 中的轉義

```javascript
// 單引號轉義
const text1 = "It's a beautiful day" // It's a beautiful day
//                  ↑ 轉義符號

// 雙引號轉義
const text2 = 'He said "Hello"' // He said "Hello"
//                    ↑↑     ↑↑ 轉義的雙引號

// 反斜線轉義
const path = 'C:\\Users\\Documents' // C:\Users\Documents
//              ↑↑   ↑↑ 轉義的反斜線
// 解釋：為什麼需要兩個反斜線？
// - 如果只寫 C:\Users\Documents，JavaScript 會嘗試將 \U、\D 解釋為轉義序列
// - \U 不是有效的轉義序列，可能會報錯或產生意外行為
// - 所以需要寫成 \\，第一個 \ 告訴 JavaScript「下一個字符是字面量」
// - 第二個 \ 才是實際的反斜線字符
// - 結果：字符串中存儲的是 C:\Users\Documents（一個反斜線）

// 換行符轉義
const multiLine = 'Line 1\nLine 2' // Line 1
//                              ↑ 轉義的換行符        // Line 2
```

### 2. SQL 中的轉義

```sql
-- ❌ 錯誤：SQL 認為字符串在這裡結束了
INSERT INTO users (name) VALUES ('O'Brien');
--                              ↑ 字符串在這裡結束，後面會報錯

-- ✅ 正確：使用兩個單引號表示一個單引號字符
INSERT INTO users (name) VALUES ('O''Brien');
--                              ↑↑ 兩個單引號 = 一個單引號字符
-- 結果：O'Brien
```

### 3. CSS 中的轉義

```css
/* 引號轉義 */
.content::before {
  content: 'Hello "World"';
  /*            ↑↑     ↑↑ 轉義的引號 */
}
```

## 💡 PostgreSQL 的 $$ 標記（避免轉義）

### 問題：SQL 中單引號需要轉義

```sql
-- ❌ 複雜：需要轉義單引號
DO '
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables
               WHERE table_schema = ''public'') THEN ...
END ';
--                       ↑↑ 需要轉義成兩個單引號
```

### 解決方案：使用 $$ 標記

```sql
-- ✅ 簡單：使用 $$ 不需要轉義
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables
               WHERE table_schema = 'public') THEN ...
END $$;
--                       ↑ 不需要轉義，直接寫即可
```

### $$ 標記的用途

**`$$` 是 PostgreSQL 的「美元符號標記（Dollar-quoting）」**：

1. **標記字符串邊界**：告訴 PostgreSQL「這裡開始/結束一個字符串」
2. **不需要轉義**：字符串內的單引號不需要轉義
3. **更清晰**：比單引號更容易閱讀

```sql
-- 使用 $$ 標記
DO $$
BEGIN
    -- 這裡面的單引號不需要轉義！
    IF table_schema = 'public' THEN ...
END $$;
```

## 🔍 轉義 vs 不轉義的對比

| 情況                  | 不使用轉義          | 使用轉義                   |
| --------------------- | ------------------- | -------------------------- |
| **JavaScript 單引號** | `'It's'` ❌ 錯誤    | `'It\'s'` ✅ 正確          |
| **SQL 單引號**        | `'O'Brien'` ❌ 錯誤 | `'O''Brien'` ✅ 正確       |
| **PostgreSQL $$**     | `DO '...'` 需要轉義 | `DO $$...$$` ✅ 不需要轉義 |

## 🎯 總結

**轉義的核心概念**：

- **目的**：告訴電腦「這個符號是內容，不是語法」
- **方法**：使用特殊方式表示（如 `\'`、`''`、`\\`）
- **替代**：使用特殊標記（如 PostgreSQL 的 `$$`）可以避免轉義

**簡單記憶**：

- 轉義 = 用特殊方式寫特殊字符
- `$$` = PostgreSQL 的「免轉義標記」
