# LINE Pay 專案完整文件

## 📁 專案中所有 LINE Pay 相關檔案清單

### 🔧 核心服務檔案
- **`services/line-pay.service.js`** - LINE Pay 核心服務邏輯
- **`config/server.config.js`** - 伺服器配置 (包含 LINE Pay 設定)
- **`config/client.config.js`** - 客戶端配置

### 🌐 API 路由檔案
- **`app/(api)/api/payment/line-pay/request/route.js`** - 付款請求 API
- **`app/(api)/api/payment/line-pay/confirm/route.js`** - 付款確認 API
- **`app/(api)/api/payment/line-pay/notification/route.js`** - 通知處理 API

### 🎨 前端頁面檔案
- **`app/line-pay/page.js`** - LINE Pay 主頁面
- **`app/line-pay/callback/page.js`** - 付款完成回調頁面
- **`app/line-pay/cancel/page.js`** - 付款取消頁面

### 🛡️ 安全相關檔案
- **`lib/ip-whitelist.js`** - IP 白名單檢查工具

### 📊 範例資料檔案
- **`data/line-pay/reserve-sample.js`** - 預約範例資料

### 🖼️ 圖片資源檔案
- **`public/line-pay/`** - LINE Pay 相關圖片 (13 個檔案)

---

## 📋 完整程式碼清單

### 1. 核心服務檔案

#### `services/line-pay.service.js`
```javascript
// 產生uuid用和hash字串用
import * as crypto from 'crypto'
// 移除 line-pay-merchant 依賴，改用手動實作
// import { createLinePayClient } from 'line-pay-merchant'
// 導入session函式
import { getSession, setSession, deleteSession } from '../lib/iron-session'

// 移除 dotenv import，Next.js 15 會自動載入環境變數
// import 'dotenv/config.js'

import { serverConfig } from '../config/server.config.js'
import { isDev } from '../lib/utils.js'

// NOTE: 這裡是服務層，負責處理商品相關的邏輯
// 不會使用throw錯誤，而是回傳物件，物件包含status, message, payload
// status: 'success' | 'error'
// message: string
// payload: any

// 手動實作 Line Pay API 呼叫
const linePayConfig = {
  channelId: isDev
    ? serverConfig.linePay.development.channelId
    : serverConfig.linePay.production.channelId,
  channelSecretKey: isDev
    ? serverConfig.linePay.development.channelSecret
    : serverConfig.linePay.production.channelSecret,
  env: process.env.NODE_ENV,
}

// Line Pay API 基礎 URL
const LINE_PAY_API_URL = isDev
  ? 'https://sandbox-api-pay.line.me'
  : 'https://api-pay.line.me'

// Zeabur 環境配置
const isZeabur = process.env.ZEABUR || process.env.VERCEL || false

// 手動實作 Line Pay API 呼叫函式
const createLinePayRequest = async (endpoint, method, body = null) => {
  const url = `${LINE_PAY_API_URL}${endpoint}`
  const timestamp = Date.now().toString()
  const nonce = crypto.randomBytes(16).toString('hex')

  // 建立簽名
  const signature = crypto
    .createHmac('sha256', linePayConfig.channelSecretKey)
    .update(linePayConfig.channelSecretKey + endpoint + body + nonce + timestamp)
    .digest('base64')

  const headers = {
    'Content-Type': 'application/json',
    'X-LINE-ChannelId': linePayConfig.channelId,
    'X-LINE-ChannelSecret': linePayConfig.channelSecretKey,
    'X-LINE-MerchantDeviceType': 'SERVER',
    'X-LINE-MerchantDeviceProfileId': 'PROFILE_ID',
    'X-LINE-Timestamp': timestamp,
    'X-LINE-Nonce': nonce,
    'X-LINE-Signature': signature,
  }

  const options = {
    method,
    headers,
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, options)
    const data = await response.json()
    return { body: data }
  } catch (error) {
    throw new Error(`Line Pay API 呼叫失敗: ${error.message}`)
  }
}

// 設定重新導向與失敗導向的網址
// 在 Zeabur 環境中使用域名而非 IP
const redirectUrls = {
  confirmUrl: isDev
    ? serverConfig.linePay.development.confirmUrl
    : serverConfig.linePay.production.confirmUrl,
  cancelUrl: isDev
    ? serverConfig.linePay.development.cancelUrl
    : serverConfig.linePay.production.cancelUrl,
}

// Zeabur 環境的額外配置
if (isZeabur) {
  console.log('🚀 運行在 Zeabur 環境，使用 IP 白名單保護')
}

// 回應line-pay交易網址到前端，由前端導向line pay付款頁面
// 資料格式參考 https://enylin.github.io/line-pay-merchant/api-reference/request.html#example
// 只需要總金額，其它都是範例資料，可以依照需求修改
export const requestPayment = async (amount) => {
  // 使用目前最新的v3版本的API，以下是資料的說明:
  // https://pay.line.me/jp/developers/apis/onlineApis?locale=zh_TW

  // packages[]	是包裝的集合，每個包裝可以包含多個商品，以下(Y)是必要的欄位
  //
  // packages[].id	String	50	Y	Package list的唯一ID
  // packages[].amount	Number		Y	一個Package中的商品總價=sum(products[].quantity * products[].price)
  // packages[].userFee	Number		N	手續費：在付款金額中含手續費時設定
  // packages[].name	String	100	N	Package名稱 （or Shop Name）

  // products[]	是商品的集合，包含多個商品，以下有(Y)是必要的欄位
  //
  // packages[].products[].id	String	50	N	商家商品ID
  // packages[].products[].name	String	4000	Y	商品名
  // packages[].products[].imageUrl	String	500	N	商品圖示的URL
  // packages[].products[].quantity	Number		Y	商品數量
  // packages[].products[].price	Number		Y	各商品付款金額
  // packages[].products[].originalPrice	Number		N	各商品原金額

  // 要傳送給line pay的訂單資訊
  const order = {
    orderId: crypto.randomUUID(),
    currency: 'TWD',
    amount: amount,
    packages: [
      {
        id: crypto.randomBytes(5).toString('hex'),
        amount: amount,
        products: [
          {
            id: crypto.randomBytes(5).toString('hex'),
            name: '商品一批',
            quantity: 1,
            price: amount,
          },
        ],
      },
    ],
    options: { display: { locale: 'zh_TW' } },
    redirectUrls, // 設定重新導向與失敗導向的網址
  }

  if (isDev) console.log('訂單資料:', order)

  try {
    // 向line pay傳送的訂單資料
    const linePayResponse = await createLinePayRequest(
      '/v3/payments/request',
      'POST',
      { ...order, redirectUrls }
    )

    // 深拷貝一份order資料
    const reservation = JSON.parse(JSON.stringify(order))

    reservation.returnCode = linePayResponse.body.returnCode
    reservation.returnMessage = linePayResponse.body.returnMessage
    reservation.transactionId = linePayResponse.body.info.transactionId
    reservation.paymentAccessToken =
      linePayResponse.body.info.paymentAccessToken

    if (isDev) console.log('預計付款記錄(Reservation):', reservation)

    // 記錄到session中(這裡是為了安全性，和一個簡單的範例，在實際應用中，應該也需要要存到資料庫妥善保管)
    await setSession('LINE_PAY', 'reservation', reservation)

    return {
      status: 'success',
      payload: {
        paymentUrl: linePayResponse.body.info.paymentUrl.web,
      },
    }
    // 導向到付款頁面， line pay回應後會帶有info.paymentUrl.web為付款網址
    // successResponse(res, {
    //   paymentUrl: linePayResponse.body.info.paymentUrl.web,
    // })
  } catch (error) {
    //errorResponse(res, error)
    return { status: 'error', message: error.message }
  }
}

// 付款完成後，導回前端同一畫面，之後由伺服器向Line Pay伺服器確認交易結果
// 格式參考: https://enylin.github.io/line-pay-merchant/api-reference/confirm.html#example
export const confirmPayment = async (transactionId) => {
  if (!transactionId) {
    return { status: 'error', message: '缺少交易編號' }
  }

  // 從session得到交易金額
  const session = await getSession('LINE_PAY')
  const reservation = session?.reservation

  if (!reservation || !reservation?.amount) {
    return { status: 'error', message: '沒有已記錄的付款資料' }
  }

  // 從session得到交易金額
  const amount = reservation?.amount

  try {
    // 最後確認交易
    const linePayResponse = await createLinePayRequest(
      `/v3/payments/${transactionId}/confirm`,
      'POST',
      {
        currency: 'TWD',
        amount: amount,
      }
    )

    // linePayResponse.body回傳的資料
    if (isDev) console.log('line-pay confirm response: ', linePayResponse)

    // 清除session中的reservation的資料
    await deleteSession('LINE_PAY', 'reservation')

    // 回傳line pay的回應
    return {
      status: 'success',
      payload: { ...linePayResponse.body },
    }
  } catch (error) {
    return { status: 'error', message: error.message }
  }
}

// 以下目前沒有使用到，僅供參考
// 檢查交易用(查詢LINE Pay付款請求的狀態。商家應隔一段時間後直接檢查付款狀態)
export const checkPaymentStatus = async (transactionId) => {
  try {
    const linePayResponse = await createLinePayRequest(
      `/v3/payments/authorizations/${transactionId}`,
      'GET'
    )

    // 範例:
    // {
    //   "body": {
    //     "returnCode": "0000",
    //     "returnMessage": "reserved transaction."
    //   },
    //   "comments": {}
    // }

    return { status: 'success', payload: { ...linePayResponse.body } }
  } catch (error) {
    return { status: 'error', message: error.message }
  }
}
```

### 2. API 路由檔案

#### `app/(api)/api/payment/line-pay/request/route.js`
```javascript
// 說明：處理金流串接的路由
import { NextResponse as res } from 'next/server'
// 導入服務層的類別
import { requestPayment } from '@/services/line-pay.service'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'
// 導入 IP 白名單檢查
import { linePayIPMiddleware } from '@/lib/ip-whitelist.js'

// 處理金流串接的路由 GET /api/payment/line-pay/request
export async function GET(request) {
  // IP 白名單檢查（僅在生產環境啟用）
  if (process.env.NODE_ENV === 'production') {
    const ipCheckResult = linePayIPMiddleware(request)
    if (ipCheckResult) {
      return ipCheckResult // 返回 403 Forbidden
    }
  }

  // 取得查詢參數，與設定預設值
  const searchParams = request.nextUrl.searchParams
  const amount = Number(searchParams.get('amount')) || 0

  if (!amount) {
    return errorResponse(res, { message: '缺少金額' })
  }

  // 取得資料
  const data = await requestPayment(amount)

  // 如果是開發環境，顯示部落格列表
  if (isDev) console.log(data)

  // API回應
  if (data.status === 'success') {
    return successResponse(res, data?.payload)
  } else {
    const error = { message: data?.message }
    return errorResponse(res, error)
  }
}
```

#### `app/(api)/api/payment/line-pay/confirm/route.js`
```javascript
// 說明：處理金流串接的路由
import { NextResponse } from 'next/server'
// 導入服務層的類別
import { confirmPayment } from '@/services/line-pay.service.js'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'
// 導入 IP 白名單檢查
import { linePayIPMiddleware } from '@/lib/ip-whitelist.js'

export async function GET(request) {
  // IP 白名單檢查（僅在生產環境啟用）
  if (process.env.NODE_ENV === 'production') {
    const ipCheckResult = linePayIPMiddleware(request)
    if (ipCheckResult) {
      return ipCheckResult // 返回 403 Forbidden
    }
  }

  // 取得查詢參數，與設定預設值
  const searchParams = request.nextUrl.searchParams
  const transactionId = searchParams.get('transactionId') || ''

  if (!transactionId) {
    return errorResponse(NextResponse, { message: '缺少交易編號' })
  }

  // 取得資料
  const data = await confirmPayment(transactionId)

  // 如果是開發環境，顯示部落格列表
  if (isDev) console.log(data)

  // API回應
  if (data.status === 'success') {
    return successResponse(NextResponse, data?.payload)
  } else {
    const error = { message: data?.message }
    return errorResponse(NextResponse, error)
  }
}
```

#### `app/(api)/api/payment/line-pay/notification/route.js`
```javascript
// 說明：處理 LINE Pay 通知的路由 (用於 Zeabur 無固定 IP 環境)
import { NextResponse } from 'next/server'
// 導入 IP 白名單檢查
import { linePayIPMiddleware } from '@/lib/ip-whitelist.js'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'

/**
 * 處理 LINE Pay 通知
 * 這個路由專門用於接收 LINE Pay 的系統通知
 * 在 Zeabur 環境中，我們使用 IP 白名單來確保安全性
 */
export async function POST(request) {
  // 強制 IP 白名單檢查（生產環境必須）
  if (process.env.NODE_ENV === 'production') {
    const ipCheckResult = linePayIPMiddleware(request)
    if (ipCheckResult) {
      console.log('LINE Pay 通知被拒絕：IP 不在白名單中')
      return ipCheckResult // 返回 403 Forbidden
    }
  }

  try {
    // 解析 LINE Pay 通知資料
    const notificationData = await request.json()

    if (isDev) {
      console.log('收到 LINE Pay 通知:', notificationData)
    }

    // 驗證通知資料的完整性
    if (!notificationData.transactionId) {
      return errorResponse(NextResponse, {
        message: '缺少交易編號',
        code: 'MISSING_TRANSACTION_ID'
      })
    }

    // 這裡可以添加更多業務邏輯
    // 例如：更新資料庫中的訂單狀態、發送確認郵件等

    // 記錄通知到日誌
    console.log(`LINE Pay 通知處理完成: ${notificationData.transactionId}`)

    // 回傳成功響應給 LINE Pay
    return successResponse(NextResponse, {
      message: '通知處理成功',
      transactionId: notificationData.transactionId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('LINE Pay 通知處理失敗:', error)
    return errorResponse(NextResponse, {
      message: '通知處理失敗',
      error: error.message
    })
  }
}

/**
 * 處理 GET 請求（用於測試）
 */
export async function GET(request) {
  // 檢查 IP 白名單
  if (process.env.NODE_ENV === 'production') {
    const ipCheckResult = linePayIPMiddleware(request)
    if (ipCheckResult) {
      return ipCheckResult
    }
  }

  return successResponse(NextResponse, {
    message: 'LINE Pay 通知端點正常運作',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}
```

### 3. 前端頁面檔案

#### `app/line-pay/page.js`
```javascript
'use client'

import { useState } from 'react'
// import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Image from 'next/image'
import { isDev, apiURL } from '@/config/client.config'
// 載入loading元件
// import CssLoader from '../../components/css-loader'

export default function LinePayPage() {
  // 檢查是否登入
  const { isAuth } = useAuth()

  // 從line-pay回來後要進行loading，確認交易需要一小段時間
  // const [loading, setLoading] = useState(true)

  // 商品用狀態
  const [price, setPrice] = useState(100)
  const [quantity, setQuantity] = useState(2)

  // confirm回來用的，在記錄確認之後，line-pay回傳訊息與代碼，例如
  // {returnCode: '1172', returnMessage: 'Existing same orderId.'}
  // const [result, setResult] = useState({
  //   returnCode: '',
  //   returnMessage: '',
  // })

  // 取得網址參數，例如: ?transactionId=xxxxxx
  // const searchParams = useSearchParams()
  // const router = useRouter()

  // if (isDev) console.log('transactionId', searchParams.get('transactionId'))

  // 導向至LINE Pay付款頁面
  const goLinePay = async () => {
    // 先連到API路由，取得LINE Pay付款網址
    const res = await fetch(
      `${apiURL}/payment/line-pay/request?amount=${quantity * price}`,
      {
        method: 'GET',
        // 讓fetch能夠傳送cookie
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    )

    const resData = await res.json()

    if (isDev) console.log(resData)

    if (resData.status === 'success') {
      if (window.confirm('確認要導向至LINE Pay進行付款?')) {
        //導向至LINE Pay付款頁面
        window.location.href = resData.data.paymentUrl
      }
    } else {
      toast.error('要求付款網址失敗')
    }
  }

  // 確認交易，處理伺服器通知line pay已確認付款，為必要流程
  // const handleConfirm = async (transactionId) => {
  //   const res = await fetch(
  //     `${apiURL}/payment/line-pay/confirm?transactionId=${transactionId}`,
  //     {
  //       method: 'GET',
  //       // 讓fetch能夠傳送cookie
  //       credentials: 'include',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Accept: 'application/json',
  //       },
  //     }
  //   )

  //   const resData = await res.json()
  //   console.log(resData)

  //   if (resData.status === 'success') {
  //     // 呈現結果
  //     setResult(resData.data)
  //     // 顯示成功訊息
  //     toast.success('付款成功')
  //   } else {
  //     toast.error('付款失敗')
  //   }

  //   // 關閉loading動畫
  //   setTimeout(() => {
  //     // 關閉loading動畫
  //     setLoading(false)
  //     // 導向至訂單頁
  //     router.replace('/line-pay')
  //   }, 3000)
  // }

  // confirm回來用的
  // useEffect(() => {
  //   if (searchParams?.get('transactionId') && searchParams?.get('orderId')) {
  //     // 出現loading動畫
  //     setLoading(true)
  //     // 向server發送確認交易api
  //     handleConfirm(searchParams.get('transactionId'))
  //   } else {
  //     setLoading(false)
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [searchParams])

  const orderDisplay = (
    <>
      <h2>購買商品清單</h2>
      <div>
        商品名稱和ID都是在後端路由直接設定範例用，這裡只有價格會變動。目前成功回應頁已改為callback路由。
        <br />
        數量:
        <input
          type="number"
          name="quantity"
          value={quantity === 0 ? '' : quantity}
          onChange={(e) => {
            setQuantity(Number(e.target.value))
          }}
        />
        單價:
        <input
          type="number"
          name="price"
          value={price === 0 ? '' : price}
          onChange={(e) => {
            setPrice(Number(e.target.value))
          }}
        />
      </div>
      <hr />
      <br />
      總價: {quantity * price}
      <br />
      {/* 圖檔都在public/line-pay資料夾 */}
      <Image
        alt=""
        src="/line-pay/LINE-Pay(h)_W85_n.png"
        width={85}
        height={25}
      />
      <button onClick={goLinePay}>前往付款</button>
    </>
  )

  // const confirmOrder = (
  //   <>
  //     <h2>最後付款確認結果(returnCode=0000 代表成功): </h2>
  //     <p>{JSON.stringify(result)}</p>
  //     <p>
  //       <button
  //         onClick={() => {
  //           window.location.href = '/line-pay'
  //         }}
  //       >
  //         重新測試
  //       </button>
  //     </p>
  //   </>
  // )

  // if (loading)
  //   return (
  //     <>
  //       {/* <RotatingLines eight={40} width={40} /> */}
  //       <CssLoader />
  //       載入中，請稍後...
  //       <ToastContainer />
  //     </>
  //   )

  return (
    <>
      <h1>Line Pay測試</h1>
      <p>
        本功能目前與資料庫無關，但會用到後端伺服器的session機制，這是為了付完款後返回後，需要訂單的金額作最後確認用的。
      </p>
      <p>
        會員登入狀態: {isAuth ? '已登入' : '未登入'}
        <br />
        <Link href="/user">連至會員登入頁</Link>
      </p>
      <hr />
      {orderDisplay}
      {/* 土司訊息視窗用 */}
      <ToastContainer />
    </>
  )
}
```

#### `app/line-pay/callback/page.js`
```javascript
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { isDev, apiURL } from '@/config/client.config'
// 載入loading元件
import CssLoader from '@/components/css-loader'

export default function LinePayPage() {
  // 檢查是否登入
  const { isAuth } = useAuth()

  // 從line-pay回來後要進行loading，確認交易需要一小段時間
  const [loading, setLoading] = useState(true)

  // confirm回來用的，在記錄確認之後，line-pay回傳訊息與代碼，例如
  // {returnCode: '1172', returnMessage: 'Existing same orderId.'}
  const [result, setResult] = useState({
    returnCode: '',
    returnMessage: '',
  })

  // 取得網址參數，例如: ?transactionId=xxxxxx
  const searchParams = useSearchParams()
  const router = useRouter()

  if (isDev) console.log('transactionId', searchParams.get('transactionId'))

  // 確認交易，處理伺服器通知line pay已確認付款，為必要流程
  const handleConfirm = async (transactionId) => {
    const res = await fetch(
      `${apiURL}/payment/line-pay/confirm?transactionId=${transactionId}`,
      {
        method: 'GET',
        // 讓fetch能夠傳送cookie
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    )

    const resData = await res.json()
    console.log(resData)

    if (resData.status === 'success') {
      // 呈現結果
      setResult(resData.data)
      // 顯示成功訊息
      toast.success('付款成功')
    } else {
      toast.error('付款失敗')
    }

    // 關閉loading動畫
    setTimeout(() => {
      // 關閉loading動畫
      setLoading(false)
      // 導向至訂單頁
      router.replace('/line-pay/callback')
    }, 3000)
  }

  // confirm回來用的
  useEffect(() => {
    if (searchParams?.get('transactionId') && searchParams?.get('orderId')) {
      // 出現loading動畫
      setLoading(true)
      // 向server發送確認交易api
      handleConfirm(searchParams.get('transactionId'))
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const confirmOrder = (
    <>
      <h2>最後付款確認結果(returnCode=0000 代表成功): </h2>
      <p>{JSON.stringify(result)}</p>
      <p>
        <button
          onClick={() => {
            window.location.href = '/line-pay'
          }}
        >
          重新測試
        </button>
      </p>
    </>
  )

  if (loading)
    return (
      <>
        <CssLoader />
        載入中，請稍後...
        <ToastContainer />
      </>
    )

  return (
    <>
      <h1>Line Pay測試-回傳結果</h1>
      <p>
        本功能目前與資料庫無關，但會用到cookie-session機制(iron-session)，這是為了付完款後返回後，需要訂單的金額作最後確認用的。
      </p>
      <p>
        會員登入狀態: {isAuth ? '已登入' : '未登入'}
        <br />
        <Link href="/user">連至會員登入頁</Link>
      </p>
      <hr />
      {result.returnCode ? confirmOrder : ''}
      {/* 土司訊息視窗用 */}
      <ToastContainer />
    </>
  )
}
```

#### `app/line-pay/cancel/page.js`
```javascript
export default function LinePayCancelPage() {
  return (
    <>
      <h1>已取消付款</h1>
    </>
  )
}
```

### 4. 配置檔案

#### `config/server.config.js` (LINE Pay 相關部分)
```javascript
// line pay設定值
linePay: {
  development: {
    channelId: process.env.LINE_PAY_CHANNEL_ID || '12008177891',
    channelSecret: process.env.LINE_PAY_CHANNEL_SECRET || '9a2f9cbdf8058762307491a2da9ab15c',
    confirmUrl: baseUrl + '/line-pay/callback',
    cancelUrl: baseUrl + '/line-pay/cancel',
  },
  production: {
    channelId: process.env.LINE_PAY_CHANNEL_ID || '12008177891',
    channelSecret: process.env.LINE_PAY_CHANNEL_SECRET || '9a2f9cbdf8058762307491a2da9ab15c',
    confirmUrl: baseUrl + '/line-pay/callback',
    cancelUrl: baseUrl + '/line-pay/cancel',
  },
},
```

#### `config/client.config.js` (LINE Pay 相關部分)
```javascript
// breadcrumb面包屑使用
// 用pathname英文對照中文的名稱(類似關聯陣列的物件)
// 使用方式需用 ex. pathnameLocale['home']
// 下面是防止自動格式化使用註解
// prettier-ignore
export const pathsLocaleMap = {
  // ... 其他路徑 ...
  'line-pay':'Line Pay',
  // ... 其他路徑 ...
}
```

### 5. 安全相關檔案

#### `lib/ip-whitelist.js`
```javascript
// IP 白名單檢查工具
import { NextRequest } from 'next/server'

// LINE Pay 官方 IP 範圍
const LINE_PAY_IPS = [
  '211.249.40.1',
  '211.249.40.2',
  '211.249.40.3',
  '211.249.40.4',
  '211.249.40.5',
  '211.249.40.6',
  '211.249.40.7',
  '211.249.40.8',
  '211.249.40.9',
  '211.249.40.10',
  '211.249.40.11',
  '211.249.40.12',
  '211.249.40.13',
  '211.249.40.14',
  '211.249.40.15',
  '211.249.40.16',
  '211.249.40.17',
  '211.249.40.18',
  '211.249.40.19',
  '211.249.40.20',
  '211.249.40.21',
  '211.249.40.22',
  '211.249.40.23',
  '211.249.40.24',
  '211.249.40.25',
  '211.249.40.26',
  '211.249.40.27',
  '211.249.40.28',
  '211.249.40.29',
  '211.249.40.30',
]

/**
 * 檢查請求是否來自 LINE Pay 官方 IP
 * @param {NextRequest} request - Next.js 請求物件
 * @returns {boolean} - 是否為合法的 LINE Pay IP
 */
export function isLinePayIP(request) {
  // 獲取真實 IP（考慮代理和 CDN）
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const clientIP = forwarded?.split(',')[0] || realIP || request.ip

  // 開發環境允許所有 IP
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  // 檢查是否在 LINE Pay IP 範圍內
  return LINE_PAY_IPS.includes(clientIP)
}

/**
 * LINE Pay IP 白名單中間件
 * @param {NextRequest} request - Next.js 請求物件
 * @returns {Response|null} - 如果 IP 不合法則返回 403 響應
 */
export function linePayIPMiddleware(request) {
  if (!isLinePayIP(request)) {
    return new Response('Forbidden: Invalid IP address', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }
  return null
}

/**
 * 更簡潔的 IP 範圍檢查（使用 CIDR 表示法）
 * @param {string} ip - 要檢查的 IP 地址
 * @param {string} cidr - CIDR 格式的 IP 範圍
 * @returns {boolean}
 */
export function isIPInRange(ip, cidr) {
  const [range, bits = 32] = cidr.split('/')
  const mask = -1 << (32 - bits)

  const ipNum = ipToNumber(ip)
  const rangeNum = ipToNumber(range)

  return (ipNum & mask) === (rangeNum & mask)
}

/**
 * 將 IP 地址轉換為數字
 * @param {string} ip - IP 地址字串
 * @returns {number}
 */
function ipToNumber(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0
}

// 使用範例：
// const isValid = isIPInRange('211.249.40.15', '211.249.40.1/28')
```

### 6. 範例資料檔案

#### `data/line-pay/reserve-sample.js`
```javascript
// eslint-disable-next-line no-unused-vars
let options = {
  amount: 1500,
  currency: 'TWD',
  orderId: '20211216003',
  packages: [
    {
      id: 'c99abc79-3b29-4f40-8851-bc618ca57856',
      amount: 1500,
      products: [
        {
          name: 'Product Name1',
          quantity: 1,
          price: 500,
        },
        {
          name: 'Product Name2',
          quantity: 2,
          price: 500,
        },
      ],
    },
  ],
  redirectUrls: {
    confirmUrl: 'http://localhost:3001/pay-confirm',
    cancelUrl: 'http://localhost:3001/pay-cancel',
  },
}
```

---

## 🔍 問題分析：要求付款網址失敗

### 可能的原因

1. **環境變數問題**
   - `LINE_PAY_CHANNEL_ID` 或 `LINE_PAY_CHANNEL_SECRET` 未設定
   - 環境變數載入失敗

2. **API 簽名問題**
   - 簽名計算錯誤
   - 時間戳或 nonce 問題

3. **網路連線問題**
   - 無法連接到 LINE Pay API
   - 防火牆或代理設定問題

4. **請求格式問題**
   - 請求標頭格式錯誤
   - 請求體格式不符合 LINE Pay 要求

### 除錯步驟

1. **檢查環境變數**
   ```bash
   echo $LINE_PAY_CHANNEL_ID
   echo $LINE_PAY_CHANNEL_SECRET
   ```

2. **檢查 API 回應**
   - 查看瀏覽器開發者工具的 Network 標籤
   - 檢查 API 回應的狀態碼和錯誤訊息

3. **檢查伺服器日誌**
   - 查看 Next.js 開發伺服器的控制台輸出
   - 檢查是否有錯誤訊息

4. **測試 API 端點**
   ```bash
   curl -X GET "http://localhost:3001/api/payment/line-pay/request?amount=100"
   ```

### 建議的修復方案

1. **確認環境變數設定**
2. **檢查 LINE Pay 後台設定**
3. **驗證 API 簽名邏輯**
4. **測試網路連線**

---

## 📝 總結

這個專案包含完整的 LINE Pay 整合，包括：
- 手動實作的 LINE Pay API 呼叫
- 完整的付款流程 (請求 → 確認 → 通知)
- IP 白名單安全機制
- 前端付款介面
- 錯誤處理和日誌記錄

主要問題可能出現在環境變數設定或 API 簽名計算上，需要進一步除錯。

