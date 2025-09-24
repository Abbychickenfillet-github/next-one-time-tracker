# React 效能優化指南

## 問題分析

### 1. 為什麼不能使用 `useState(false)`？

**問題**：如果使用 `useState(false)` 來管理主題狀態，會導致：

```jsx
// ❌ 錯誤做法
const [isPink, setIsPink] = useState(false)

// 問題：
// 1. 無法保存用戶的主題偏好
// 2. 每次重新載入頁面都會回到預設主題
// 3. 無法與 localStorage 同步
```

**正確做法**：
```jsx
// ✅ 正確做法
const [currentTheme, setCurrentTheme] = useState('green')

// 優點：
// 1. 可以保存用戶偏好
// 2. 與 localStorage 同步
// 3. 支援多種主題擴展
```

### 2. 為什麼需要 `savedTheme`？

**原因**：
1. **避免水合錯誤（Hydration Mismatch）**：
   - 伺服器端渲染時無法訪問 `localStorage`
   - 客戶端渲染時可以訪問 `localStorage`
   - 如果沒有 `savedTheme`，會導致 SSR 和 CSR 不一致

2. **用戶體驗**：
   - 保存用戶的主題偏好
   - 重新載入頁面時保持主題設定

3. **效能考量**：
   - 避免每次渲染都讀取 `localStorage`
   - 只在組件初始化時讀取一次

### 3. 效能優化分析

#### 原始寫法的問題：
```jsx
// ❌ 效能問題
const themeConfig = useMemo(() => ({
  green: { name: 'Green', icon: '🌿' },
  pink: { name: 'Pink', icon: '🌸' }
}), [])

const toggleTheme = useMemo(() => (theme) => {
  // 函數邏輯
}, [])

// 問題：
// 1. useMemo 對於簡單物件沒有必要
// 2. 過度優化，增加複雜度
// 3. Object.entries().map() 會創建新陣列
```

#### 優化後的寫法：
```jsx
// ✅ 效能優化
const toggleTheme = useCallback((theme) => {
  setCurrentTheme(theme)
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}, [])

// 優點：
// 1. useCallback 避免函數重新創建
// 2. 直接渲染按鈕，避免陣列操作
// 3. 程式碼更簡潔易讀
```

## Referential Equality（引用相等性）

### 什麼是 Referential Equality？

**定義**：兩個變數指向同一個記憶體位置時，它們就是引用相等的。

```jsx
// 引用相等性範例
const obj1 = { name: 'test' }
const obj2 = { name: 'test' }
const obj3 = obj1

console.log(obj1 === obj2) // false - 不同物件
console.log(obj1 === obj3) // true - 相同引用
```

### 在 React 中的應用：

```jsx
// 問題：每次渲染都創建新物件
function Component() {
  const config = { theme: 'green' } // 每次渲染都是新物件
  
  return <ChildComponent config={config} />
}

// 解決：使用 useMemo 或 useCallback
function Component() {
  const config = useMemo(() => ({ theme: 'green' }), [])
  
  return <ChildComponent config={config} />
}
```

### 為什麼重要？

1. **避免不必要的重新渲染**：
   - React 使用 `Object.is()` 比較 props
   - 如果 props 引用改變，子組件會重新渲染

2. **效能優化**：
   - 減少不必要的計算
   - 避免記憶體浪費

## 效能優化最佳實踐

### 1. 使用 useCallback 優化事件處理器

```jsx
// ✅ 優化後
const handleClick = useCallback((theme) => {
  setCurrentTheme(theme)
  // 其他邏輯
}, [])

// ❌ 未優化
const handleClick = (theme) => {
  setCurrentTheme(theme)
  // 其他邏輯
}
```

### 2. 使用 useMemo 優化計算

```jsx
// ✅ 優化後
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])

// ❌ 未優化
const expensiveValue = heavyCalculation(data)
```

### 3. 避免在 render 中創建物件

```jsx
// ❌ 問題
function Component() {
  return <Child style={{ color: 'red' }} />
}

// ✅ 解決
const styles = { color: 'red' }
function Component() {
  return <Child style={styles} />
}
```

### 4. 使用 React.memo 優化組件

```jsx
// ✅ 優化後
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{data}</div>
})

// ❌ 未優化
const ExpensiveComponent = ({ data }) => {
  return <div>{data}</div>
}
```

## 主題切換效能優化

### 優化前後對比：

#### 優化前：
```jsx
// 問題：每次渲染都創建新物件和函數
const themeConfig = useMemo(() => ({...}), [])
const toggleTheme = useMemo(() => (theme) => {...}, [])
return Object.entries(themeConfig).map(...)
```

#### 優化後：
```jsx
// 解決：使用 useCallback 和直接渲染
const toggleTheme = useCallback((theme) => {...}, [])
return (
  <>
    <button onClick={() => toggleTheme('green')}>Green</button>
    <button onClick={() => toggleTheme('pink')}>Pink</button>
  </>
)
```

### 效能提升：

1. **減少記憶體使用**：避免創建不必要的物件
2. **減少渲染次數**：useCallback 避免函數重新創建
3. **提升響應速度**：直接渲染比陣列操作更快
4. **程式碼更簡潔**：減少複雜度，提高可讀性

## Header 主題設計優化

### Pink 主題的雲海粉紅色大理石效果

#### 設計理念：
- **雲海效果**：多層漸層營造雲霧繚繞的感覺
- **大理石紋理**：光澤效果模擬大理石材質
- **動態動畫**：15秒循環的浮動動畫
- **色彩層次**：從深粉到淺粉的多層次漸變

#### CSS 實現：

```css
/* Pink 主題 - 雲海粉紅色大理石效果 */
:root[data-theme="pink"] .header-theme {
  background: 
    linear-gradient(135deg, 
      rgba(255, 107, 157, 0.8) 0%,
      rgba(255, 139, 171, 0.9) 25%,
      rgba(255, 182, 193, 0.7) 50%,
      rgba(255, 192, 203, 0.8) 75%,
      rgba(255, 105, 180, 0.9) 100%
    ),
    radial-gradient(circle at 20% 20%, rgba(255, 107, 157, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 139, 171, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(255, 182, 193, 0.2) 0%, transparent 50%);
  color: #ffffff;
  animation: headerCloudFloat 15s ease-in-out infinite;
}

/* 大理石紋理效果 */
:root[data-theme="pink"] .header-theme::before {
  background: 
    linear-gradient(45deg, 
      rgba(255, 255, 255, 0.1) 0%,
      transparent 25%,
      rgba(255, 255, 255, 0.05) 50%,
      transparent 75%,
      rgba(255, 255, 255, 0.1) 100%
    );
  background-size: 20px 20px;
  animation: marbleShimmer 3s ease-in-out infinite;
}
```

#### 動畫效果：

```css
/* 雲海浮動動畫 */
@keyframes headerCloudFloat {
  0%, 100% { 
    background-position: 0% 0%, 20% 20%, 80% 80%, 40% 60%;
  }
  25% { 
    background-position: 10% 5%, 30% 25%, 70% 85%, 50% 65%;
  }
  50% { 
    background-position: 5% 10%, 25% 30%, 85% 70%, 35% 55%;
  }
  75% { 
    background-position: 15% 8%, 35% 15%, 75% 75%, 45% 70%;
  }
}

/* 大理石光澤動畫 */
@keyframes marbleShimmer {
  0%, 100% { 
    opacity: 0.1;
    transform: translateX(0);
  }
  50% { 
    opacity: 0.2;
    transform: translateX(10px);
  }
}
```

### 視覺效果特色

#### Pink 主題 Header 包含：
- ✅ **雲海粉紅色漸層背景**：多層次色彩過渡
- ✅ **大理石紋理光澤效果**：模擬真實材質
- ✅ **動態雲海浮動動畫**：15秒循環動畫
- ✅ **按鈕懸停效果**：互動式視覺反饋
- ✅ **Logo 發光效果**：主題色彩光暈
- ✅ **文字陰影效果**：增強可讀性

#### Green 主題 Header 保持：
- ✅ **Bootstrap bg-info 藍綠色漸層**：保持一致性
- ✅ **簡潔的設計風格**：專業外觀
- ✅ **白色文字**：高對比度

### 技術實現

#### 1. CSS 模組化設計：
```jsx
// Header.tsx
import styles from './Header.module.css'

<header className={`py-3 px-4 fs-3 fw-bold d-flex justify-content-between align-items-center ${styles.headerTheme}`}>
```

#### 2. 主題條件渲染：
```css
/* 預設 Green 主題 */
.header-theme {
  background: linear-gradient(135deg, #0dcaf0, #0aa2c0);
  color: white;
}

/* Pink 主題覆蓋 */
:root[data-theme="pink"] .header-theme {
  background: /* 雲海效果 */;
  animation: headerCloudFloat 15s ease-in-out infinite;
}
```

#### 3. 響應式優化：
```css
@media screen and (max-width: 768px) {
  :root[data-theme="pink"] .header-theme {
    animation: none; /* 行動裝置停用動畫以提升性能 */
  }
}
```

### 效能考量

#### 動畫優化：
1. **使用 transform 而非 position**：GPU 加速
2. **避免重排重繪**：只改變 opacity 和 transform
3. **響應式停用**：行動裝置停用動畫
4. **適度動畫時長**：15秒循環，不會過於頻繁

#### 記憶體優化：
1. **CSS 變數**：避免重複定義樣式
2. **條件渲染**：只在需要時應用複雜樣式
3. **模組化 CSS**：避免全域樣式污染

## 總結

### 關鍵要點：

1. **useState(false) 不適合主題管理**：無法保存用戶偏好
2. **savedTheme 是必要的**：避免水合錯誤，提升用戶體驗
3. **Referential Equality 很重要**：影響 React 的重新渲染邏輯
4. **適度優化**：不要過度使用 useMemo/useCallback
5. **測量效能**：使用 React DevTools 分析實際效能
6. **視覺設計**：Pink 主題的雲海大理石效果提升用戶體驗
7. **效能平衡**：在視覺效果和效能之間找到平衡

### 最佳實踐：

- 只在必要時使用 useMemo/useCallback
- 避免在 render 中創建新物件
- 使用 React.memo 優化純組件
- 定期測量和分析效能
- 保持程式碼簡潔易讀
- 使用 CSS 變數實現主題切換
- 響應式設計考慮效能影響
- 適度使用動畫效果
