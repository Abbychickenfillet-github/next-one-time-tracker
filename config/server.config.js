import 'server-only' // 限制只能在伺服器端使用

// 移除 dotenv import，Next.js 15 會自動載入環境變數
// import 'dotenv/config.js'

// env: development | production
const env = process.env.NODE_ENV || 'development'

// 判斷是否為開發環境
export const isDev = env === 'development'

// baseUrl: 開發or營運環境的網址
export const baseUrl = isDev
  ? 'http://localhost:3001'
  : 'https://time-insight.zeabur.app'

export const serverConfig = {
  // (deprecated)
  sessionStoreType: isDev ? 'file' : 'redis', // file | redis
  // 前端網址
  nextUrl: baseUrl,
  // 後端伺服器佈置後的網域名稱，與cookie有關
  domain: isDev ? '' : 'time-insight.zeabur.app',
  smtp: {
    type: 'gmail', // ethereal | gmail
    ethereal: {
      provider: 'ethereal',
      host: 'smtp.ethereal.email',
      user: 'test@ethereal.email',
      pass: '1234567890',
    },
    gmail: {
      provider: 'gmail',
      host: 'smtp.gmail.com',
      user: 'test@gmail.com',
      pass: '1234567890',
    },
  },
  // iron session(一般的session)
  ironSession: {
    // 產生: https://1password.com/password-generator/
    password:
      'XKBsTNhGKjasnas7n79wqrikY3K5m0QmncDvMFFzaWPyH1E8hNqfNURLRgAF2QtvZdTgkwA5UTdwTZE33B', // 32 characters
    ttl: 60 * 60 * 24 * 7, // 7 days
    cookieOptions: {
      secure: env !== 'development', // false in local (non-HTTPS) development
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 - 60, // Expire cookie before the session expires.
      path: '/',
    },
  },
  // jwt(openssl rand -base64 32)
  jwt: {
    // 產生: https://www.cryptool.org/en/cto/openssl/
    secret: '3Xtu+BRpWLoNvMtyEQKQKeO2qBXSvUZZtTVUscoN2Rs=',
  },
  otp: {
    // 產生: https://1password.com/password-generator/
    secret:
      'uEXDvQc6Vy0aokEjy6qmdtExifDuxW5hxsCKLosxD0d4LzEt1G52KMEDYCgFoqv4HGLkjRpnCbstQbFyHX', // 32 characters
    expire: 10 * 60 * 1000, // 10 分鐘
  },
  // line login設定值
  // 注意: callbackUrl 必需要與
  // LINE Developer 的 "Callback URL" 設定一致，目前與LINE登入頁設定為一致(登入頁路由=回調頁路由)
  lineLogin: {
    development: {
      channelId: 'test_202509267841@line.pay',
      channelSecret: 'TXadX0Rvd',
      callbackUrl: baseUrl + '/user/line-login',
    },
    production: {
      channelId: 'test_202509267841@line.pay',
      channelSecret: 'aTXadX0Rvd',
      callbackUrl: baseUrl + '/user/line-login',
    },
  },
  // 7-11地址選擇，前端接回導向的網址
  ship711: {
    development: {
      callbackUrl: baseUrl + '/ship/callback',
    },
    production: {
      callbackUrl: baseUrl + '/ship/callback',
    },
  },
  // line pay設定值
  linePay: {
    development: {
      channelId: process.env.LINE_PAY_CHANNEL_ID || '12008177891',
      channelSecret:
        process.env.LINE_PAY_CHANNEL_SECRET ||
        '9a2f9cbdf8058762307491a2da9ab15c',
      confirmUrl: baseUrl + '/line-pay/callback',
      cancelUrl: baseUrl + '/line-pay/cancel',
    },
    production: {
      channelId: process.env.LINE_PAY_CHANNEL_ID || '12008177891',
      channelSecret:
        process.env.LINE_PAY_CHANNEL_SECRET ||
        '9a2f9cbdf8058762307491a2da9ab15c',
      confirmUrl: baseUrl + '/line-pay/callback',
      cancelUrl: baseUrl + '/line-pay/cancel',
    },
  },
}
