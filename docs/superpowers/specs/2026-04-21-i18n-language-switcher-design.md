# 多語系下拉選單設計（Language Switcher in User Menu）

**日期**：2026-04-21
**狀態**：已核准設計，等待實作計畫
**範圍**：在 `UnifiedNavbar` 的用戶下拉選單中新增 6 個語言切換項目

---

## 背景

專案已有完整的 i18n 基礎建設：

- `i18next` + `react-i18next` 已安裝並在 `lib/i18n.js` 初始化
- 支援 6 種語言：zh-TW / zh-CN / en-US / ja-JP / ko-KR / fr-FR
- 翻譯檔案在 `locales/*.json`
- 已自動偵測瀏覽器語言並存於 `localStorage` key `i18nextLng`
- 已透過 `app/providers.js` 載入

**目前唯一缺的是 UI** —— 使用者無法手動切換語言。

## 目標

在不動現有 i18n 基礎設施的前提下，新增一個 UI 讓已登入使用者能在用戶下拉選單中切換語言。

## 非目標（YAGNI）

- 不改 `lib/i18n.js` 或 `locales/*.json`
- 不改 URL 路徑加入語系前綴（例如 `/en/about`），維持純 client-side 切換
- 不做 SEO `hreflang` 標籤
- 不為未登入使用者提供切換入口（後續若有需求再加）
- 不翻譯任何現有頁面文字（這是獨立工作）

## 設計

### 擺放位置

放在 `UnifiedNavbar.js` 既有的用戶下拉選單（`Dropdown.Menu`）內，位於「訂閱服務」之後、「登出」之前。只有在使用者登入後才顯示（維持既有行為）。

### 選單樣貌

```
👤 用戶資訊 header
─────────
⚙️ 訂閱服務
─────────
🇹🇼 繁體中文  ✓
🇨🇳 简体中文
🇺🇸 English
🇯🇵 日本語
🇰🇷 한국어
🇫🇷 Français
─────────
🚪 登出
```

每個語言以**該語言本身的寫法**顯示（日本人看到「日本語」而非「Japanese」），符合國際慣例。目前啟用的語言以 `FaCheck` 勾勾標示。

### 元件結構

新增獨立元件，保持 `UnifiedNavbar.js` 不過度膨脹：

```
components/
  language-switcher/
    index.js
```

元件職責：

- 用 `useTranslation()` 讀取當前語言 `i18n.language`
- 將一份 `LANGUAGES` 常數陣列渲染為一串 `<Dropdown.Item>`
- 點擊時呼叫 `i18n.changeLanguage(code)`

### 語言清單常數

```js
const LANGUAGES = [
  { code: 'zh-TW', flag: '🇹🇼', label: '繁體中文' },
  { code: 'zh-CN', flag: '🇨🇳', label: '简体中文' },
  { code: 'en-US', flag: '🇺🇸', label: 'English' },
  { code: 'ja-JP', flag: '🇯🇵', label: '日本語' },
  { code: 'ko-KR', flag: '🇰🇷', label: '한국어' },
  { code: 'fr-FR', flag: '🇫🇷', label: 'Français' },
]
```

### 運作流程

1. 使用者點選某語言
2. 元件呼叫 `i18n.changeLanguage(code)`
3. `lib/i18n.js` 裡既有的 `languageChanged` listener 自動把語言寫入 `localStorage`
4. `react-i18next` 自動重渲染所有使用 `t()` 的元件 → **即時切換，無需 reload**
5. 下拉選單關閉（`react-bootstrap` 預設行為）

## 與既有系統互動

| 檔案 | 動作 |
|---|---|
| `components/language-switcher/index.js` | **新增** |
| `components/UnifiedNavbar.js` | **修改**：在 `Dropdown.Menu` 中引入 `LanguageSwitcher` |
| `lib/i18n.js` | 不動 |
| `app/providers.js` | 不動 |
| `locales/*.json` | 不動 |

## 樣式

沿用既有 `react-bootstrap` `Dropdown.Item` 外觀，透過 inline style / className 保持與「訂閱服務」「登出」一致的 hover 行為，不引入新的 SCSS 模組。

勾勾使用 `react-icons/fa` 的 `FaCheck`（專案已安裝 `react-icons`）。旗幟以 Unicode emoji 顯示，不引入圖檔。

## 測試計畫

手動驗證：

1. 登入後開啟用戶下拉 → 看到 6 個語言，目前語言有勾勾
2. 點 `English` → UI 即時變英文（以 `app/trial/page.js` 這類有使用 `t()` 的頁面驗證）
3. 重新整理瀏覽器 → 語言維持 `en-US`（驗證 `localStorage` 生效）
4. 登出再登入 → 語言記憶保留
5. 點已啟用的語言 → 行為不變（無錯誤、不 reload）

## 風險與假設

- **假設**：`locales/*.json` 已含有實際會被讀取的翻譯 key。若翻譯檔實際內容不完整，切換後仍會看到 fallback（`zh-TW`）文字；這屬於翻譯內容的獨立問題，不在本次實作範圍。
- **假設**：Windows 版 `react-bootstrap` + `react-i18next` 搭配沒有已知相容性問題（專案既有程式碼已在用，可視為低風險）。
- **旗幟 emoji 在部分 Windows 版本可能顯示為文字代碼（如 "TW"）而非圖形**。若驗收時發現此問題，可改為使用 `react-icons/gi` 的地球圖示或縮寫碼（TW / CN / US…）作為替代方案。

## 後續可能延伸（不在此範圍）

- 為未登入使用者提供 Navbar 上獨立的語言切換按鈕
- URL 路徑語系（`/en/xxx`）與 SEO `hreflang`
- 自動補齊 `locales/*.json` 中的缺漏 key
