# Prisma Git 記錄與遷移檔案詳細解釋

## 1. Prisma 有被 Git 記錄嗎？

### 答案：**是的，但只有部分檔案**

### Git 記錄的檔案：

```bash
# 這些檔案會被 Git 記錄
prisma/schema.prisma              # ✅ 你的手寫藍圖
prisma/migrations/               # ✅ 遷移歷史記錄
├── 20240101000000_init/
│   ├── migration.sql
│   └── schema.prisma
├── 20240102000000_add_user/
│   ├── migration.sql
│   └── schema.prisma
└── ...
```

### Git 忽略的檔案：

```bash
# 這些檔案不會被 Git 記錄
prisma/generated/                 # ❌ 自動生成的檔案
node_modules/.prisma/client/      # ❌ 預設生成的 Prisma Client
```

### 為什麼這樣設計？

- **`prisma/schema.prisma`**：團隊協作需要，每個人都要有一致的資料庫設計
- **`prisma/migrations/`**：團隊需要相同的遷移歷史，確保資料庫狀態一致
- **`prisma/generated/`**：自動生成，每個人的環境可能不同

## 2. 終端機錯誤訊息詳細解釋

### 錯誤 1：`Invalid value ${JSON.stringify(e)} for datasource`

**完整錯誤訊息可能是：**

```
Invalid value ${JSON.stringify(e)} for datasource "db" provider "postgresql"
```

**原因分析：**

```javascript
// 錯誤的環境變數設定
DATABASE_URL=${JSON.stringify(e)}  // ❌ 錯誤

// 正確的環境變數設定
DATABASE_URL=postgresql://user:password@localhost:5432/database  // ✅ 正確
```

**解決方法：**

```bash
# 檢查 .env 檔案
cat .env

# 確保 DATABASE_URL 格式正確
DATABASE_URL=postgresql://postgres:abc123@localhost:5432/timelog_db
```

### 錯誤 2：`更新訂單狀態失敗，returnCode是0000成功`

**這個錯誤很矛盾，讓我們分析：**

**可能的情況：**

```javascript
// API 回應成功
{
  "returnCode": "0000",  // LINE Pay 表示成功
  "status": "SUCCESS"
}

// 但資料庫更新失敗
await prisma.paymentOrder.update({
  where: { transactionId: "xxx" },
  data: { status: "SUCCESS" }
})
// 拋出錯誤：no record was found for an update
```

**原因分析：**

1. **LINE Pay 確認成功**：`returnCode: "0000"` 表示付款成功
2. **資料庫更新失敗**：找不到對應的訂單記錄
3. **資料不一致**：外部系統成功，內部系統失敗

### 錯誤 3：`no record was found for an update`

**這是 Prisma 的錯誤訊息，完整解釋：**

```javascript
// 當你執行 update 操作時
await prisma.paymentOrder.update({
  where: {
    transactionId: 'line_pay_transaction_123', // 找不到這個記錄
  },
  data: {
    status: 'SUCCESS',
  },
})

// Prisma 拋出錯誤
// "No record was found for an update"
```

**可能的原因：**

1. **`transactionId` 不存在**：資料庫中沒有這個交易 ID
2. **資料型別不匹配**：`transactionId` 是 `String?` 但傳入了 `null`
3. **時序問題**：LINE Pay 回調時，訂單還沒建立

## 3. 完整的錯誤流程分析

### 典型的 LINE Pay 流程：

```mermaid
sequenceDiagram
    participant User
    participant App
    participant LINE_Pay
    participant Database

    User->>App: 發起付款
    App->>Database: 建立 PaymentOrder (status: PENDING)
    App->>LINE_Pay: 請求付款
    LINE_Pay->>User: 顯示付款頁面
    User->>LINE_Pay: 完成付款
    LINE_Pay->>App: 回調通知 (returnCode: 0000)
    App->>Database: 更新訂單狀態 (失敗!)
    Note over App: no record was found for an update
```

### 可能的問題點：

**1. 訂單建立失敗**

```javascript
// 建立訂單時可能失敗
const order = await prisma.paymentOrder.create({
  data: {
    orderId: 'order_123',
    transactionId: null, // 初始為 null
    status: 'PENDING',
  },
})
// 如果這裡失敗，後續更新就會找不到記錄
```

**2. 回調時找不到記錄**

```javascript
// LINE Pay 回調時
app.post('/api/payment/line-pay/confirm', async (req, res) => {
  const { transactionId } = req.body

  // 嘗試更新訂單
  const updatedOrder = await prisma.paymentOrder.update({
    where: { transactionId }, // 找不到這個 transactionId
    data: { status: 'SUCCESS' },
  })
})
```

## 4. 解決方案

### 方案 1：檢查訂單建立

```javascript
// 建立訂單時加入錯誤處理
try {
  const order = await prisma.paymentOrder.create({
    data: {
      orderId: generateOrderId(),
      amount: 100,
      status: 'PENDING',
      // ... 其他欄位
    },
  })
  console.log('✅ 訂單建立成功:', order.id)
} catch (error) {
  console.error('❌ 訂單建立失敗:', error)
  throw error
}
```

### 方案 2：使用 upsert 更新

```javascript
// 使用 upsert 避免找不到記錄的問題
const updatedOrder = await prisma.paymentOrder.upsert({
  where: { transactionId },
  update: {
    status: 'SUCCESS',
    paidAt: new Date(),
  },
  create: {
    // 如果找不到，建立新記錄
    orderId: generateOrderId(),
    transactionId,
    amount: 100,
    status: 'SUCCESS',
  },
})
```

### 方案 3：加入詳細日誌

```javascript
// 在更新前先查詢
const existingOrder = await prisma.paymentOrder.findUnique({
  where: { transactionId },
})

if (!existingOrder) {
  console.error('❌ 找不到訂單:', transactionId)
  console.log('📋 所有訂單:', await prisma.paymentOrder.findMany())
  return res.status(404).json({ error: 'Order not found' })
}

// 執行更新
const updatedOrder = await prisma.paymentOrder.update({
  where: { transactionId },
  data: { status: 'SUCCESS' },
})
```

## 5. 除錯步驟

### 步驟 1：檢查資料庫狀態

```bash
# 連接到 PostgreSQL
psql -h localhost -U postgres -d timelog_db

# 查詢所有訂單
SELECT * FROM "PaymentOrder" ORDER BY "created_at" DESC LIMIT 10;

# 查詢特定交易
SELECT * FROM "PaymentOrder" WHERE "transaction_id" = 'your_transaction_id';
```

### 步驟 2：檢查環境變數

```bash
# 檢查 .env 檔案
cat .env | grep DATABASE_URL

# 測試資料庫連線
npx prisma db push
```

### 步驟 3：重設遷移（如果需要）

```bash
# 備份資料
pg_dump timelog_db > backup.sql

# 重設遷移
npx prisma migrate reset

# 重新生成
npx prisma generate
```

## 總結

### Git 記錄：

- ✅ `prisma/schema.prisma` 和 `prisma/migrations/` 會被 Git 記錄
- ❌ `prisma/generated/` 不會被 Git 記錄

### 錯誤解決：

1. **檢查環境變數**：確保 `DATABASE_URL` 格式正確
2. **檢查訂單建立**：確保訂單成功建立到資料庫
3. **使用 upsert**：避免找不到記錄的問題
4. **加入日誌**：詳細記錄每個步驟的狀態

### 最佳實踐：

- 使用 `upsert` 而不是 `update`
- 加入完整的錯誤處理
- 記錄詳細的操作日誌
- 定期備份資料庫
