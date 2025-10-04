// Line Pay v3 API服务层 (使用fetch方式)
import { getSession, setSession, deleteSession } from '../lib/iron-session'
import { serverConfig } from '../config/server.config.js'
import { isDev } from '../lib/utils.js'

// NOTE: 這裡是服務層，負責處理商品相關的邏輯
// 不會使用throw錯誤，而是回傳物件，物件包含status, message, payload
// status: 'success' | 'error'
// message: string
// payload: any

// 環境配置
const redirectUrls = {
  confirmUrl: isDev
    ? serverConfig.linePay.development.confirmUrl
    : serverConfig.linePay.production.confirmUrl,
  cancelUrl: isDev
    ? serverConfig.linePay.development.cancelUrl
    : serverConfig.linePay.production.cancelUrl,
}

console.log('🔧 [DEBUG] Line Pay v3 fetch redirectUrls 設定:', redirectUrls)

// 環境配置說明
if (isDev) {
  console.log('🚀 [Line Pay v3 fetch] 運行在開發環境')
} else {
  console.log('🚀 [Line Pay v3 fetch] 運行在生產環境')
}

/**
 * 創建 Line Pay v3 簽名
 */
function createSignature(channelSecret, nonce, requestBody) {
  const crypto = require('crypto')
  const signatureData = channelSecret + nonce + requestBody

  return crypto
    .createHmac('sha256', channelSecret)
    .update(signatureData)
    .digest('base64')
}

/**
 * 生成隨機nonce
 */
function generateNonce() {
  const crypto = require('crypto')
  return crypto.randomBytes(16).toString('hex')
}

/**
 * 創建付款請求 (Line Pay v3 API)
 */
export const requestPayment = async (amount) => {
  console.log('🚀 [Line Pay v3 fetch] 開始創建付款請求，金額:', amount)

  // 驗證輸入參數
  if (!amount || amount <= 0) {
    return {
      status: 'error',
      message: '無效的付款金額',
    }
  }

  try {
    // Line Pay v3 API 請求數據格式
    const requestData = {
      amount: amount,
      currency: 'TWD',
      orderId: generateOrderId(),
      packages: [
        {
          id: generatePackageId(),
          amount: amount,
          name: '商品一批',
          products: [
            {
              id: generateProductId(),
              name: '商品一批',
              quantity: 1,
              price: amount,
            },
          ],
        },
      ],
      redirectUrls: {
        confirmUrl: redirectUrls.confirmUrl,
        cancelUrl: redirectUrls.cancelUrl,
      },
      options: {
        display: {
          locale: 'zh_TW',
        },
      },
    }

    console.log('📋 [Line Pay v3 fetch] 訂單資料:', requestData)

    // Line Pay API 設置
    const channelId = process.env.LINE_PAY_CHANNEL_ID || '2008177891'
    const channelSecret =
      process.env.LINE_PAY_CHANNEL_SECRET || '9a2f9cbdf8058762307491a2da9ab15c'

    console.log('🔧 [Line Pay v3 fetch] LINE Pay 設定:', {
      channelId,
      channelSecretSet: !!channelSecret,
      apiUrl: 'https://sandbox-api-pay.line.me/v3/payments/request',
      redirectUrls,
    })

    // 準備請求
    const url = 'https://sandbox-api-pay.line.me/v3/payments/request'
    const nonce = generateNonce()
    const requestBody = JSON.stringify(requestData)
    const signature = createSignature(channelSecret, nonce, requestBody)

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Language': 'zh-TW',
      'X-LINE-ChannelId': channelId,
      'X-LINE-Authorization-Nonce': nonce,
      'X-LINE-Authorization': signature,
      'User-Agent': 'LINE Pay API Client',
    }

    console.log('🚀 [Line Pay v3 fetch] API 請求:', {
      url,
      method: 'POST',
      headers: {
        'X-LINE-ChannelId': channelId,
        'X-LINE-Authorization-Nonce': nonce,
        'X-LINE-Authorization': signature,
      },
      bodySize: requestBody.length,
      nonceLength: nonce.length,
      signatureLength: signature.length,
    })

    // 發送請求
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: requestBody,
    })

    const responseText = await response.text()
    let responseData

    try {
      responseData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ [Line Pay v3 fetch] JSON 解析失敗:', parseError)
      console.error('❌ [Line Pay v3 fetch] 原始回應:', responseText)
      throw new Error(`Line Pay API 回應格式錯誤: ${responseText}`)
    }

    console.log('📥 [Line Pay v3 fetch] API 回應:', {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
    })

    // 檢查API響應
    if (!response.ok) {
      throw new Error(
        `Line Pay API HTTP 錯誤: ${response.status} ${response.statusText}. Response: ${responseText}`
      )
    }

    if (responseData.returnCode !== '0000') {
      throw new Error(
        `LINE Pay API 錯誤: Code ${responseData.returnCode}, Message: ${responseData.returnMessage}`
      )
    }

    const paymentInfo = responseData.info
    if (!paymentInfo) {
      throw new Error('LINE Pay 響應缺少付款信息')
    }

    if (!paymentInfo.transactionId) {
      throw new Error('LINE Pay 響應缺少交易ID')
    }

    if (!paymentInfo.paymentUrl || !paymentInfo.paymentUrl.web) {
      throw new Error('LINE Pay 響應缺少付款URL')
    }

    // 保存付款信息到session
    const reservation = {
      orderId: requestData.orderId,
      amount: amount,
      currency: 'TWD',
      transactionId: paymentInfo.transactionId,
      paymentAccessToken: paymentInfo.paymentAccessToken,
      returnCode: responseData.returnCode,
      returnMessage: responseData.returnMessage,
      redirectUrls: requestData.redirectUrls,
      packages: requestData.packages,
    }

    await setSession('LINE_PAY', 'reservation', reservation)

    console.log('✅ [Line Pay v3 fetch] 預計付款記錄儲存完成:', reservation)

    return {
      status: 'success',
      payload: {
        paymentUrl: paymentInfo.paymentUrl.web,
        transactionId: paymentInfo.transactionId,
      },
    }
  } catch (error) {
    console.error('❌ [Line Pay v3 fetch] 付款請求失敗:', error)
    return {
      status: 'error',
      message: error.message || 'Line Pay API 調用失敗',
    }
  }
}

// 辅助函数：生成订单ID
function generateOrderId() {
  return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

// 辅助函数：生成包裹ID
function generatePackageId() {
  return `PKG_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

// 辅助函数：生成商品ID
function generateProductId() {
  return `PROD_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

export default {
  requestPayment,
}



