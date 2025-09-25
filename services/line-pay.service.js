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
const redirectUrls = {
  confirmUrl: isDev
    ? serverConfig.linePay.development.confirmUrl
    : serverConfig.linePay.production.confirmUrl,
  cancelUrl: isDev
    ? serverConfig.linePay.development.cancelUrl
    : serverConfig.linePay.production.cancelUrl,
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
