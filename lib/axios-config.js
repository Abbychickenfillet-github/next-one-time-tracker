import axios from 'axios'

// 创建一个专用的axios实例用于Line Pay API
export const linePayAxios = axios.create({
  baseURL: 'https://sandbox-api-pay.line.me',
  timeout: 30000, // 30秒超时
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Accept-Language': 'zh-TW',
    'User-Agent': 'LINE Pay API Client',
  },
})

// Line Pay v3认证拦截器
linePayAxios.interceptors.request.use(
  (config) => {
    // 从环境变量或配置中获取认证信息
    const channelId = process.env.LINE_PAY_CHANNEL_ID || '2008177891'
    const channelSecret =
      process.env.LINE_PAY_CHANNEL_SECRET || '9a2f9cbdf8058762307491a2da9ab15c'

    // 生成nonce和签名（v3 API格式）
    const nonce = generateNonce()
    const body = config.data ? JSON.stringify(config.data) : ''
    const signature = generateSignature(channelSecret, nonce, body)

    // 设置v3认证headers - 只使用最基本的认证headers
    config.headers['X-LINE-ChannelId'] = channelId
    config.headers['X-LINE-Authorization-Nonce'] = nonce
    config.headers['X-LINE-Authorization'] = signature

    console.log('🔧 [Line Pay v3] API请求:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      channelId,
      channelSecretSet: !!channelSecret,
      nonceLength: nonce.length,
      signatureLength: signature.length,
      bodyLength: body.length,
      criticalHeaders: {
        'X-LINE-ChannelId': channelId,
        'X-LINE-Authorization-Nonce': nonce,
        'X-LINE-Authorization': signature,
      },
    })

    return config
  },
  (error) => {
    console.error('❌ [Line Pay v3] axios axios拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
linePayAxios.interceptors.response.use(
  (response) => {
    console.log('✅ [Line Pay v3] axios axios响应成功:', {
      status: response.status,
      statusText: response.statusText,
      returnCode: response.data?.returnCode,
      returnMessage: response.data?.returnMessage,
      hasInfo: !!response.data?.info,
    })
    return response
  },
  (error) => {
    console.error('❌ [Line Pay v3] 响应错误:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      requestUrl: error.config?.url,
      requestMethod: error.config?.method,
    })
    return Promise.reject(error)
  }
)

// 生成nonce (32字节随机十六进制字符串)
function generateNonce() {
  const crypto = require('crypto')
  return crypto.randomBytes(16).toString('hex')
}

// 生成v3 API签名
function generateSignature(channelSecret, nonce, requestBody) {
  const crypto = require('crypto')
  const signatureData = channelSecret + nonce + requestBody

  return crypto
    .createHmac('sha256', channelSecret)
    .update(signatureData)
    .digest('base64')
}

// 清理axios实例的工具函数
export const clearLinePayAxiosCache = () => {
  console.log('🧹 [Line Pay v3] 清理axios缓存')
}

export default linePayAxios
