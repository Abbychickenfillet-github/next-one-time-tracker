import 'server-only' // 這個檔案只會在伺服器端執行

// 本檔案會讀取伺服器設定檔案server.config.js，
// 進行line登入類別實例的初始化再匯出(export)

// line-login模組
import LineLogin from '@/lib/line-login.js'
// 設定環境變數
import { serverConfig, isDev } from '@/config/server.config.js'

// line 登入使用
const channel_id = isDev
  ? serverConfig.lineLogin.development.channelId
  : serverConfig.lineLogin.production.channelId

const channel_secret = isDev
  ? serverConfig.lineLogin.development.channelSecret
  : serverConfig.lineLogin.production.channelSecret

const callback_url = isDev
  ? serverConfig.lineLogin.development.callbackUrl
  : serverConfig.lineLogin.production.callbackUrl

const lineLogin = new LineLogin({
  channel_id,
  channel_secret,
  callback_url,
  scope: 'openid profile',
  prompt: 'consent',
  bot_prompt: 'normal',
})

export default lineLogin
