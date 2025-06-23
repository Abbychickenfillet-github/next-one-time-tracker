import 'server-only' // 限制只能在伺服器端使用

import * as OTPAuth from 'otpauth'
import { serverConfig } from '../config/server.config.js'

// 伺服器端的secret
const otpSecret = serverConfig.otp.secret

// 產生Totp Generate a token
export const generateToken = (
  secretString = '',
  issuer = 'NEXT-ONE',
  label = 'user'
) => {
  let secret = secretString

  // 如果secretString是空字串，建立新的 Secret 物件
  if (secretString === '') {
    secret = new OTPAuth.Secret({ size: 20 })
  } else {
    secret = OTPAuth.Secret.fromLatin1(secretString + otpSecret)
  }
  // 建立新的 TOTP 物件
  // 註: issuer和label是當需要整合Google Authenticator使用的
  const totp = new OTPAuth.TOTP({
    issuer: issuer,
    label: label,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    // 任意的 base32 編碼密鑰或 OTPAuth.Secret 實例（如果省略，則會生成一個加密安全的隨機密鑰）。
    secret: secret,
  })

  const token = totp.generate()

  return {
    totp: totp, // totp 物件
    token: token, // token 字串
    uri: totp.toString(), // uri 字串，整合Google Authenticator使用
  }
}
