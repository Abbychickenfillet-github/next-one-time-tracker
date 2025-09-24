import 'server-only' // 只在伺服器端執行 Server-only

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { serverConfig } from '@/config/server.config'

const secretKey = serverConfig.jwt.secret
const encodedKey = new TextEncoder().encode(secretKey)

/**
 * 加密JWT Session
 * @param {Object} payload 有效負載資料
 * @param {String} exp 有效期限(預設7天，可接受的時間單位有d(天), h(時), m(分), s(秒))
 */
export async function encrypt(payload, exp = '7d') {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(encodedKey)
}

/**
 * 解密JWT Session
 * @param {String} session JWT Session
 */
export async function decrypt(session) {
  try {
    // jwtVerify 返回完整的 JWT 對象，包含 payload、header、signature 等信息
    // 之前只返回 payload，但現在需要完整的 result 對象
    // 因為前端需要訪問 result.payload.userId，而不是直接訪問 payload.userId
    const result = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return result
    // eslint-disable-next-line
  } catch (error) {
    console.log('Failed to verify session')
  }
}

/**
 * 建立JWT Session
 * @param {Object} payload 有效負載資料
 * @param {String} exp 有效期限(預設7天，可接受的時間單位有d(天), h(時), m(分), s(秒))
 * @param {String} cookieName Cookie名稱(預設ACCESS_TOKEN)
 */
export async function createSession(
  payload,
  exp = '7d',
  cookieName = 'ACCESS_TOKEN'
) {
  const timeUnit = exp.slice(-1)
  const timeValue = Number(exp.slice(0, -1))

  let expValue = 0
  switch (timeUnit) {
    case 'd':
      expValue = timeValue * 24 * 60 * 60 * 1000
      break
    case 'h':
      expValue = timeValue * 60 * 60 * 1000
      break
    case 'm':
      expValue = timeValue * 60 * 1000
      break
    case 's':
      expValue = timeValue * 1000
      break
    default:
      expValue = 7 * 24 * 60 * 60 * 1000
      break
  }
  const expiresAt = new Date(Date.now() + expValue)
  const session = await encrypt({ ...payload, expiresAt }, exp)
  const cookieStore = await cookies()

  cookieStore.set(cookieName, session, {
    httpOnly: false, // 讓前端 JavaScript 可以讀取
    secure: process.env.NODE_ENV === 'production', // 只在生產環境使用 HTTPS
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

/**
 * 更新JWT Session 時間
 * @param {String} cookieName Cookie名稱(預設ACCESS_TOKEN)
 */
export async function updateSession(cookieName = 'ACCESS_TOKEN') {
  const session = (await cookies()).get(cookieName)?.value
  const payload = await decrypt(session)

  if (!session || !payload) {
    return null
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const cookieStore = await cookies()

  cookieStore.set(cookieName, session, {
    httpOnly: false, // 讓前端 JavaScript 可以讀取
    secure: process.env.NODE_ENV === 'production', // 只在生產環境使用 HTTPS
    expires: expires,
    sameSite: 'lax',
    path: '/',
  })
}

/**
 * 刪除JWT Session
 * @param {String} cookieName Cookie名稱(預設ACCESS_TOKEN)
 */
export async function deleteSession(cookieName = 'ACCESS_TOKEN') {
  const cookieStore = await cookies()
  cookieStore.delete(cookieName)
}
