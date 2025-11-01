# 日誌等級系統使用指南

## 📋 概述

`server.config.js` 現在支援日誌等級系統，可以根據環境變數控制輸出哪些等級的日誌。

## 🎯 日誌等級定義

```javascript
const LOG_LEVELS = {
  DEBUG: 0, // 最詳細的調試資訊
  INFO: 1, // 一般資訊
  WARN: 2, // 警告訊息
  ERROR: 3, // 錯誤訊息
}
```

**重要概念**：數字越大越重要，當設定某個等級時，會顯示該等級及**以上**的所有日誌。

## ⚙️ 設定方式

### 1. 透過環境變數設定

在 `.env` 或 `.env.production` 檔案中設定：

```bash
# 顯示所有日誌（DEBUG, INFO, WARN, ERROR）
LOG_LEVEL=DEBUG

# 只顯示 INFO, WARN, ERROR（生產環境推薦）
LOG_LEVEL=INFO

# 只顯示 WARN 和 ERROR
LOG_LEVEL=WARN

# 只顯示 ERROR
LOG_LEVEL=ERROR
```

### 2. 預設行為

- **開發環境** (`NODE_ENV=development`)：預設為 `DEBUG`（顯示所有日誌）
- **生產環境** (`NODE_ENV=production`)：預設為 `INFO`（只顯示 INFO, WARN, ERROR）

## 💻 使用範例

### 在 server.config.js 中使用

```javascript
import { logger } from '../config/server.config.js'

// DEBUG 等級 - 詳細的調試資訊
logger.debug('env:', process.env.NODE_ENV)
logger.debug('baseUrl:', baseUrl)

// INFO 等級 - 重要的初始化資訊
logger.info('serverConfig 初始化完成')

// WARN 等級 - 警告訊息
if (!process.env.SECRET_KEY) {
  logger.warn('SECRET_KEY 未設定，使用預設值')
}

// ERROR 等級 - 錯誤訊息
if (!connection) {
  logger.error('無法連接到資料庫')
}
```

### 在其他檔案中使用

```javascript
// 導入 logger
import { logger } from '@/config/server.config.js'

// 使用不同等級
logger.debug('詳細的調試資訊')
logger.info('系統初始化完成')
logger.warn('配置可能不正確')
logger.error('發生嚴重錯誤')
```

## 📊 日誌等級顯示規則

| 設定的等級 | 顯示的日誌               |
| ---------- | ------------------------ |
| `DEBUG`    | DEBUG, INFO, WARN, ERROR |
| `INFO`     | INFO, WARN, ERROR        |
| `WARN`     | WARN, ERROR              |
| `ERROR`    | ERROR                    |

## 🎨 日誌輸出格式

每則日誌都會包含：

- **Emoji 圖示**：快速識別等級
  - 🔧 DEBUG
  - ℹ️ INFO
  - ⚠️ WARN
  - ❌ ERROR
- **等級標籤**：`[DEBUG]`, `[INFO]`, `[WARN]`, `[ERROR]`
- **檔案名稱前綴**：`server.config.js -`

範例輸出：

```
🔧 [DEBUG] server.config.js - env: production
ℹ️ [INFO] server.config.js - serverConfig 初始化完成
⚠️ [WARN] server.config.js - LINE_PAY_CHANNEL_SECRET 未設定，使用預設值
```

## 🚀 最佳實踐

### 開發環境

```bash
# .env.local 或開發環境
LOG_LEVEL=DEBUG  # 查看所有詳細資訊
```

### 生產環境

```bash
# .env.production
LOG_LEVEL=INFO   # 只記錄重要資訊，減少日誌噪音

# 或更嚴格的設定
LOG_LEVEL=WARN   # 只關注警告和錯誤
```

### 除錯特定問題

```bash
# 臨時啟用詳細日誌
LOG_LEVEL=DEBUG npm run build
```

## 🔄 遷移現有程式碼

如果你有舊的 `debugLog` 呼叫，可以：

1. **直接使用 logger.debug**（向後相容）：

```javascript
// 舊的寫法
debugLog('env:', env)

// 新的寫法（推薦）
logger.debug('env:', env)
```

2. **根據重要性選擇等級**：

```javascript
// 詳細調試資訊 → DEBUG
logger.debug('process.env.LINE_PAY_CHANNEL_ID:', id)

// 重要初始化 → INFO
logger.info('serverConfig 初始化完成')

// 潛在問題 → WARN
logger.warn('使用預設配置')

// 錯誤情況 → ERROR
logger.error('配置錯誤')
```

## 📝 環境變數範例

### .env.local（開發環境）

```bash
NODE_ENV=development
LOG_LEVEL=DEBUG  # 顯示所有日誌
```

### .env.production（生產環境）

```bash
NODE_ENV=production
LOG_LEVEL=INFO  # 只顯示重要資訊
```

### 臨時除錯

```bash
# 在生產環境中臨時啟用 DEBUG
LOG_LEVEL=DEBUG NODE_ENV=production npm run build
```

## ✅ 優點總結

1. **減少生產環境日誌噪音**：只顯示必要的資訊
2. **靈活控制**：可隨時調整日誌等級
3. **更好的除錯體驗**：開發環境自動顯示所有資訊
4. **統一格式**：所有日誌都有一致的格式
5. **視覺化識別**：使用 emoji 快速識別日誌等級
