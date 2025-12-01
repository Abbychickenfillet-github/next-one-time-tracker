// 產生uuid用和hash字串用
import * as crypto from 'crypto'
import axios from 'axios'
// 移除 line-pay-merchant 依賴，改用手動實作
// import { createLinePayClient } from 'line-pay-merchant'
// 導入session函式
import { getSession, setSession, deleteSession } from '../lib/iron-session'

// 移除 dotenv import，Next.js 15 會自動載入環境變數
// import 'dotenv/config.js'

import { serverConfig } from '../config/server.config.js'
import { isDev } from '../lib/utils.js'
import { LINE_PAY_IPS, getLinePayOutboundIPs } from '../lib/ip-whitelist.js'

// 只在開發環境或有 DEBUG_SERVER_CONFIG 環境變數時輸出 debug
const shouldDebug = isDev || process.env.DEBUG_SERVER_CONFIG === 'true'

function debugLog(...args) {
  if (shouldDebug) {
    console.log(...args)
  }
}

// NOTE: 這裡是服務層，負責處理商品相關的邏輯
// 不會使用throw錯誤，而是回傳物件，物件包含status, message, payload
// status: 'success' | 'error'
// message: string
// payload: any

// 手動實作 Line Pay API 呼叫
const linePayConfig = {
  channelId:
    process.env.LINE_PAY_CHANNEL_ID ||
    (isDev
      ? serverConfig.linePay.development.channelId
      : serverConfig.linePay.production.channelId),
  channelSecretKey:
    process.env.LINE_PAY_CHANNEL_SECRET ||
    (isDev
      ? serverConfig.linePay.development.channelSecret
      : serverConfig.linePay.production.channelSecret),
  env: process.env.NODE_ENV,
}

// Line Pay API 基礎 URL - 使用 v3 API
// 根據環境變數切換 sandbox 或 production
// 注意：使用正式環境會進行真實扣款！
const isLinePayProduction =
  process.env.LINE_PAY_ENV === 'production' ||
  (process.env.NODE_ENV === 'production' &&
    process.env.LINE_PAY_ENV !== 'sandbox')

const LINE_PAY_API_URL = isLinePayProduction
  ? 'https://api-pay.line.me' // 正式環境（真實扣款）
  : 'https://sandbox-api-pay.line.me' // 測試環境（假付款）

// 記錄 IP 白名單資訊
const outboundIPs = getLinePayOutboundIPs()
debugLog('🌐 LINE Pay 設定:', {
  environment: isLinePayProduction ? 'production' : 'sandbox',
  apiUrl: LINE_PAY_API_URL,
  channelId: linePayConfig.channelId,
  outboundIPs: outboundIPs, // 商家伺服器 IP（需在 LINE Pay 後台加入白名單）
  inboundIPs: isDev
    ? LINE_PAY_IPS.inbound.test
    : LINE_PAY_IPS.inbound.production, // LINE Pay 官方 IP
})

// 環境配置 (已移除未使用的變數)

// 手動實作 Line Pay API 呼叫函式
const createLinePayRequest = async (endpoint, method, body = null) => {
  const url = `${LINE_PAY_API_URL}${endpoint}`
  const nonce = crypto.randomBytes(16).toString('hex')

  // 建立簽名 - LINE Pay v3 API 簽名演算法
  const requestBody = body ? JSON.stringify(body) : ''
  const signature = crypto
    .createHmac('sha256', linePayConfig.channelSecretKey)
    .update(linePayConfig.channelSecretKey + endpoint + requestBody + nonce)
    .digest('base64')

  const headers = {
    'Content-Type': 'application/json',
    'X-LINE-ChannelId': linePayConfig.channelId,
    'X-LINE-Authorization-Nonce': nonce,
    'X-LINE-Authorization': signature,
    'User-Agent': 'LINE Pay API Client',
    Accept: 'application/json',
    'Accept-Language': 'zh-TW',
    'X-LINE-Request-Id': crypto.randomUUID(),
    'X-LINE-Environment': LINE_PAY_API_URL.includes('sandbox')
      ? 'sandbox'
      : 'production',
  }

  const options = {
    method,
    headers,
  }

  if (body) {
    options.body = requestBody
  }

  try {
    console.log('🚀 LINE Pay API 請求:', {
      url,
      method,
      headers,
      body: requestBody,
      channelId: linePayConfig.channelId,
      channelSecret: linePayConfig.channelSecretKey ? '已設定' : '未設定',
      channelSecretLength: linePayConfig.channelSecretKey
        ? linePayConfig.channelSecretKey.length
        : 0,
    })

    const response = await axios({
      method,
      url,
      headers,
      data: body,
    })

    console.log('📥 LINE Pay API 回應:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    })

    return { body: response.data, comments: {} }
  } catch (error) {
    console.error('❌ LINE Pay API 錯誤:', error)
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

debugLog('🔧 [DEBUG] redirectUrls 設定:', redirectUrls)

// 環境配置說明
if (isDev) {
  debugLog('🚀 運行在開發環境 (npm run dev)')
} else {
  debugLog(
    '🚀 運行在生產環境 (npm start)，已經不用 LINE Pay 正式環境 IP 白名單'
  )
}
// 回應line-pay交易網址到前端，由前端導向line pay付款頁面
// 資料格式參考 https://enylin.github.io/line-pay-merchant/api-reference/request.html#example
// 只需要總金額，其它都是範例資料，可以依照需求修改
export const requestPayment = async (amount, options = {}) => {
  // 這個函式 建立付款請求
  // 參數：
  // - amount: 付款金額
  // - options: { orderId, currency, packages }

  // 1. 建立訂單資料
  // 從 options 中解構出參數，如果沒有則使用預設值
  const { orderId, currency = 'TWD', packages } = options

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
    orderId:
      orderId || `ORDER-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    currency: currency, // 使用解構出來的 currency，預設為 'TWD'
    amount: amount,
    packages: packages || [
      {
        id: crypto.randomBytes(5).toString('hex'),
        amount: amount,
        name: '商品一批',
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
    redirectUrls: {
      confirmUrl: redirectUrls.confirmUrl,
      cancelUrl: redirectUrls.cancelUrl,
    }, // 使用動態配置的網址
  }

  console.log('📋 訂單資料:', order)
  console.log('🔧 LINE Pay 設定:', {
    channelId: linePayConfig.channelId,
    channelSecret: linePayConfig.channelSecretKey ? '已設定' : '未設定',
    apiUrl: LINE_PAY_API_URL,
    redirectUrls,
  })

  try {
    // 向line pay傳送的訂單資料 - 使用 v3 API
    const linePayResponse = await createLinePayRequest(
      '/v3/payments/request',
      'POST',
      order
    )

    // 檢查 LINE Pay 回應是否成功
    if (linePayResponse.body.returnCode !== '0000') {
      throw new Error(`LINE Pay 錯誤: ${linePayResponse.body.returnMessage}`)
    }

    // 檢查必要的回應資料
    if (!linePayResponse.body.info) {
      throw new Error('LINE Pay 回應缺少 info 資料')
    }

    if (!linePayResponse.body.info.transactionId) {
      throw new Error('LINE Pay 回應缺少 transactionId')
    }

    if (!linePayResponse.body.info.paymentUrl) {
      throw new Error('LINE Pay 回應缺少 paymentUrl')
    }

    // 深拷貝一份order資料
    const reservation = JSON.parse(JSON.stringify(order))

    reservation.returnCode = linePayResponse.body.returnCode
    reservation.returnMessage = linePayResponse.body.returnMessage
    reservation.transactionId = linePayResponse.body.info.transactionId
    reservation.paymentAccessToken =
      linePayResponse.body.info.paymentAccessToken

    console.log('✅ 預計付款記錄(Reservation):', reservation)

    // 記錄到session中(這裡是為了安全性，和一個簡單的範例，在實際應用中，應該也需要要存到資料庫妥善保管)
    await setSession('LINE_PAY', 'reservation', reservation)

    return {
      status: 'success',
      payload: {
        paymentUrl: linePayResponse.body.info.paymentUrl.web,
        transactionId: linePayResponse.body.info.transactionId,
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
  console.log('🔍 confirmPayment 開始，transactionId:', transactionId)

  if (!transactionId) {
    console.log('❌ 缺少交易編號')
    return { status: 'error', message: '缺少交易編號' }
  }

  // 從session得到交易金額
  const session = await getSession('LINE_PAY')
  const reservation = session?.reservation
  console.log('📋 Session 資料:', { session, reservation })

  // 如果沒有 session 資料，嘗試從資料庫查詢現有訂單
  let amount = null
  if (reservation && reservation?.amount) {
    amount = reservation.amount
  } else {
    // 嘗試從資料庫查詢現有訂單的金額
    try {
      const { PrismaClient } = require('@prisma/client')
      const prisma = new PrismaClient()

      const existingOrder = await prisma.paymentOrder.findUnique({
        where: { transactionId },
        select: { amount: true, status: true },
      })

      if (existingOrder) {
        amount = existingOrder.amount
        console.log('📋 從資料庫取得訂單金額:', amount)

        // 如果訂單已經是 SUCCESS 狀態，直接返回成功
        if (existingOrder.status === 'SUCCESS') {
          console.log('✅ 訂單已經是成功狀態，跳過重複確認')
          return {
            status: 'success',
            payload: {
              returnCode: '0000',
              returnMessage: 'Transaction already confirmed',
              info: {
                transactionId: transactionId,
                orderId:
                  existingOrder.orderId ||
                  `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
              },
            },
          }
        }
      }

      await prisma.$disconnect()
    } catch (dbError) {
      console.error('❌ 查詢資料庫失敗:', dbError)
    }
  }

  if (!amount) {
    console.log('❌ 沒有找到付款金額，session 和資料庫都沒有資料')
    return { status: 'error', message: '沒有已記錄的付款資料' }
  }

  console.log('💰 找到付款金額:', amount)

  try {
    console.log('🚀 開始向 LINE Pay 確認付款...')
    // 最後確認交易 - 使用 v3 API
    const linePayResponse = await createLinePayRequest(
      `/v3/payments/${transactionId}/confirm`,
      'POST',
      {
        currency: 'TWD',
        amount: amount,
      }
    )

    console.log('📥 LINE Pay 確認付款回應:', linePayResponse)

    // 檢查 LINE Pay 回應是否成功
    if (linePayResponse.body.returnCode !== '0000') {
      console.log(
        '❌ LINE Pay 確認付款失敗:',
        linePayResponse.body.returnMessage
      )
      return {
        status: 'error',
        message: `LINE Pay 確認失敗: ${linePayResponse.body.returnMessage}`,
      }
    }

    // 清除session中的reservation的資料
    await deleteSession('LINE_PAY', 'reservation')
    console.log('🗑️ 已清除 session 資料')

    // 回傳line pay的回應
    console.log('✅ 付款確認成功')
    return {
      status: 'success',
      payload: { ...linePayResponse.body },
    }
  } catch (error) {
    console.error('❌ LINE Pay 確認付款時發生錯誤:', error)
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
