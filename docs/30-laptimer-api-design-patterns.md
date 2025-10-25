# LapTimer API 設計模式與命名空間標記

## 概述

本文檔記錄了 LapTimer 分圈計時器系統的 API 設計模式，特別是命名空間標記的使用、不同 API 端點的設計差異，以及前端狀態管理的實現方式。

## 1. 命名空間標記設計模式

### 1.1 什麼是命名空間標記？

命名空間標記是一種在資料庫中區分不同類型記錄的設計模式，通過在標題前加上特定前綴來實現分類。

```javascript
// 不同類型的活動標記
const lapTimerTitle = `[LapTimer] 跑步訓練`
const projectTitle = `[Project] 網站開發`
const meetingTitle = `[Meeting] 週會`
const studyTitle = `[Study] React 學習`
const workoutTitle = `[Workout] 健身訓練`
```

### 1.2 為什麼需要命名空間標記？

1. **資料分類**：在同一個 `TimeLog` 表中儲存多種類型的時間記錄
2. **查詢效率**：快速篩選特定類型的記錄
3. **業務邏輯分離**：不同類型的活動可能有不同的處理邏輯
4. **用戶體驗**：在前端提供清晰的視覺區分

### 1.3 實現方式

#### 後端儲存時加上標記

```javascript
const lapTimerTitle = `[LapTimer] ${title || '分圈計時器'}`
```

#### 查詢時使用標記篩選

```javascript
const lapTimerData = await prisma.timeLog.findFirst({
  where: {
    userId: userId,
    title: {
      startsWith: '[LapTimer]', // 只查詢分圈計時器相關的記錄
    },
    endTime: null, // 只查詢未結束的活動
  },
  // ...
})
```

#### 前端顯示時的處理

```javascript
// 移除標記顯示純粹的活動名稱
title: lapTimerData.title.replace('[LapTimer] ', '')
```

## 2. API 設計差異分析

### 2.1 LapTimer API (`/api/lap-timer`)

**用途**：專門處理分圈計時器的操作

**特點**：

- 移除 `[LapTimer]` 標記
- 只查詢未結束的活動 (`endTime: null`)
- 提供即時狀態恢復功能

```javascript
// GET 端點 - 獲取進行中的分圈計時器
const parsedData = {
  id: lapTimerData.id,
  title: lapTimerData.title.replace('[LapTimer] ', ''), // 移除標記
  desc: lapTimerData.memo || '',
  // ...
}
```

### 2.2 TimeLogs API (`/api/timelogs`)

**用途**：顯示所有類型的時間記錄列表

**特點**：

- 保留所有標記
- 查詢所有記錄（包括已結束的）
- 提供統計資訊

```javascript
// GET 端點 - 獲取所有時間記錄
const responseData = {
  timeLogs: timeLogs.map((log) => ({
    id: log.id,
    title: log.title, // 保留原始標記
    startTime: log.startTime,
    endTime: log.endTime,
    // ...
  })),
  // ...
}
```

### 2.3 設計差異的原因

| 特性         | LapTimer API             | TimeLogs API           |
| ------------ | ------------------------ | ---------------------- |
| **目標用戶** | 正在使用分圈計時器的用戶 | 查看歷史記錄的用戶     |
| **標記處理** | 移除標記，顯示純粹名稱   | 保留標記，顯示完整資訊 |
| **資料範圍** | 只查詢未結束的活動       | 查詢所有記錄           |
| **使用場景** | 即時操作、狀態恢復       | 歷史查看、統計分析     |

## 3. 前端狀態管理

### 3.1 Enter 鍵切換功能

實現了智能的 Enter 鍵行為：

```javascript
onKeyDown={(e) => {
  if (e.key === 'Enter') {
    // 根據當前分圈狀態決定操作
    if (isLapRunning) {
      handleEndLap()  // 結束分圈
    } else {
      handleStartLap() // 開始分圈
    }
  }
}}
```

### 3.2 動態提示文字

```javascript
placeholder={
  isLapRunning
    ? '按 Enter 結束分圈...'
    : '輸入分圈描述，按 Enter 開始...'
}
```

## 4. 認證與授權

### 4.1 Cookie 與 JWT Token

```javascript
// 從 Cookie 中取得 JWT Token
const cookie = (await cookies()).get('ACCESS_TOKEN')?.value
if (!cookie) {
  return NextResponse.json(
    { status: 'error', message: '未授權訪問' },
    { status: 401 }
  )
}

// 解密 JWT Token 取得用戶資訊
const session = await decrypt(cookie)
if (!session?.payload?.userId) {
  return NextResponse.json(
    { status: 'error', message: '未授權訪問' },
    { status: 401 }
  )
}
```

### 4.2 HTTP 狀態碼的因果關係

**因果關係**：Cookie 不存在 → 401 未授權

1. **Cookie 不存在** → 立即回傳 401
2. **Cookie 存在但無效** → 解密失敗，回傳 401
3. **Cookie 有效** → 繼續執行業務邏輯

## 5. 資料庫設計

### 5.1 TimeLog 模型

```prisma
model TimeLog {
  id        Int       @id @default(autoincrement())
  title     String    // 儲存帶標記的標題
  startTime DateTime  @map("start_time")
  endTime   DateTime? @map("end_time")
  userId    Int?      @map("user_id")
  memo      String?
  steps     Step[]
  user      User?     @relation(fields: [userId], references: [user_id], onDelete: Cascade)
}
```

### 5.2 Step 模型（分圈記錄）

```prisma
model Step {
  id          Int       @id @default(autoincrement())
  timeLogId   Int       @map("time_log_id")
  userId      Int?      @map("user_id")
  title       String
  description String?
  startTime   DateTime  @map("start_time")
  endTime     DateTime? @map("end_time")
  timeLog     TimeLog   @relation(fields: [timeLogId], references: [id], onDelete: Cascade)
}
```

## 6. 最佳實踐

### 6.1 命名空間標記規範

1. **格式**：`[Type] 描述`
2. **類型命名**：使用有意義的英文單詞
3. **一致性**：同類型活動使用相同標記
4. **可擴展性**：預留未來新類型的空間

### 6.2 API 設計原則

1. **單一職責**：每個 API 專注於特定功能
2. **狀態驅動**：根據業務狀態決定行為
3. **用戶體驗**：提供直觀的操作方式
4. **錯誤處理**：統一的錯誤回應格式

### 6.3 前端狀態管理

1. **狀態驅動 UI**：根據 `isLapRunning` 狀態改變 UI
2. **動態提示**：提供即時的操作指引
3. **錯誤處理**：優雅的錯誤提示和恢復

## 7. 常見問題與解答

### Q1: 為什麼 LapTimer API 要移除標記？

**A**: LapTimer 是專門的操作界面，移除標記讓用戶專注於活動本身，而不是技術標記。

### Q2: 為什麼 TimeLogs API 要保留標記？

**A**: Dashboard 是歷史記錄查看界面，保留標記幫助用戶快速識別不同類型的活動。

### Q3: 可以添加新的命名空間標記嗎？

**A**: 可以！只需要在相關的查詢邏輯中添加新的 `startsWith` 條件即可。

### Q4: 為什麼查詢未結束的活動？

**A**: 分圈計時器需要狀態恢復功能，用戶刷新頁面後能繼續進行中的計時。

## 8. 擴展建議

### 8.1 新增命名空間類型

```javascript
// 可以考慮添加的類型
const newTypes = [
  '[Project]', // 專案管理
  '[Meeting]', // 會議記錄
  '[Study]', // 學習時間
  '[Workout]', // 健身訓練
  '[Travel]', // 旅行記錄
  '[Personal]', // 個人時間
]
```

### 8.2 進階功能

1. **標記過濾器**：在前端提供標記篩選功能
2. **自定義標記**：允許用戶創建個人標記
3. **標記統計**：提供各類型活動的時間統計
4. **標記管理**：後台管理標記的增刪改查

## 9. 總結

LapTimer 系統的設計展現了以下重要概念：

1. **命名空間標記**：有效的資料分類和查詢策略
2. **API 設計差異**：根據使用場景優化不同的 API
3. **狀態驅動 UI**：基於業務狀態的動態用戶界面
4. **認證授權**：安全的用戶身份驗證機制
5. **用戶體驗**：直觀的操作方式和即時反饋

這種設計模式不僅適用於時間記錄系統，也可以應用到其他需要分類管理的業務場景中。

---

**文檔版本**: 1.0
**創建日期**: 2025-01-27
**最後更新**: 2025-01-27
**相關檔案**:

- `app/api/lap-timer/route.js`
- `app/api/timelogs/route.js`
- `components/timelog/DashboardLapTimer.js`
- `prisma/schema.prisma`
