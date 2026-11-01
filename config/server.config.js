import 'server-only' // 限制只能在伺服器端使用

// 移除 dotenv import，Next.js 15 會自動載入環境變數
// import 'dotenv/config.js'

// env: development | production
const env = process.env.NODE_ENV || 'development'

// 判斷是否為開發環境
export const isDev = process.env.NODE_ENV === 'development'

// baseUrl: 開發or營運環境的網址

export const baseUrl = isDev
  ? 'http://localhost:3001'
  : 'https://next-one-time-tracker.vercel.app'

// ===== 日誌等級系統 =====
// 日誌等級定義（數字越大越重要）
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
}

// 從環境變數讀取日誌等級，預設值：
// - 開發環境：DEBUG（顯示所有日誌）
// - 生產環境：INFO（只顯示 INFO, WARN, ERROR）
const LOG_LEVEL_ENV =
  process.env.LOG_LEVEL?.toUpperCase() || (isDev ? 'DEBUG' : 'INFO')
const currentLogLevel = LOG_LEVELS[LOG_LEVEL_ENV] ?? LOG_LEVELS.INFO

// 判斷是否應該輸出指定等級的日誌
function shouldLog(level) {
  // 等級數字 >= 當前設定的等級，就輸出
  return LOG_LEVELS[level] >= currentLogLevel
}

// 統一的日誌輸出函式
function logWithLevel(level, prefix, ...args) {
  if (shouldLog(level)) {
    const emoji =
      {
        DEBUG: '🔧',
        INFO: 'ℹ️',
        WARN: '⚠️',
        ERROR: '❌',
      }[level] || '📝'
    console.log(`${emoji} [${level}] ${prefix}`, ...args)
  }
}

// 導出不同等級的日誌函式
export const logger = {
  debug: (...args) => logWithLevel('DEBUG', 'server.config.js -', ...args),
  info: (...args) => logWithLevel('INFO', 'server.config.js -', ...args),
  warn: (...args) => logWithLevel('WARN', 'server.config.js -', ...args),
  error: (...args) => logWithLevel('ERROR', 'server.config.js -', ...args),
}

export const serverConfig = {
  // 前端網址
  nextUrl: baseUrl,
  // 後端伺服器佈置後的網域名稱，與cookie有關 - 含備援網域
  domain: isDev ? 'localhost:3001' : 'next-one-time-tracker.vercel.app',
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
      channelId: process.env.LINE_PAY_CHANNEL_ID || '2008177891',
      channelSecret:
        process.env.LINE_PAY_CHANNEL_SECRET ||
        '9a2f9cbdf8058762307491a2da9ab15c',
      confirmUrl: baseUrl + '/line-pay/callback',
      cancelUrl: baseUrl + '/line-pay/cancel',
    },
    production: {
      channelId: process.env.LINE_PAY_CHANNEL_ID || '2008177891',
      channelSecret:
        process.env.LINE_PAY_CHANNEL_SECRET ||
        '9a2f9cbdf8058762307491a2da9ab15c',
      confirmUrl: 'https://next-one-time-tracker.vercel.app/line-pay/callback',
      cancelUrl: 'https://next-one-time-tracker.vercel.app/line-pay/cancel',
    },
  },
}

// 日誌輸出 - 使用不同等級
logger.debug('env:', env)
logger.debug('isDev:', isDev)
logger.debug('baseUrl:', baseUrl)
logger.info('serverConfig 初始化完成')
logger.debug(
  'process.env.LINE_PAY_CHANNEL_ID:',
  process.env.LINE_PAY_CHANNEL_ID
)
logger.debug(
  'process.env.LINE_PAY_CHANNEL_SECRET:',
  process.env.LINE_PAY_CHANNEL_SECRET ? '已設定' : '未設定'
)
logger.debug(
  'serverConfig.linePay.development.channelId:',
  serverConfig.linePay.development.channelId
)
logger.debug(
  'serverConfig.linePay.development.channelSecret:',
  serverConfig.linePay.development.channelSecret ? '已設定' : '未設定'
)
logger.debug(
  'serverConfig.linePay.development.confirmUrl:',
  serverConfig.linePay.development.confirmUrl
)
logger.debug(
  'serverConfig.linePay.development.cancelUrl:',
  serverConfig.linePay.development.cancelUrl
)

// 如果敏感資訊未設定，發出警告
if (!process.env.LINE_PAY_CHANNEL_SECRET) {
  logger.warn('LINE_PAY_CHANNEL_SECRET 未設定，使用預設值')
}
