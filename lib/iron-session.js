import 'server-only' // 只在伺服器端執行 Server-only

import { cookies } from 'next/headers'
import { getIronSession } from 'iron-session'
import { serverConfig } from '@/config/server.config.js'
import { isDev } from '@/lib/utils.js'

/**
 * 使用提供的 Cookie 名稱檢索會話物件。
 *
 * @async
 * @function getSession
 * @param {string} cookieName - 要檢索會話的 Cookie 名稱。
 * @returns {Promise<Object|null>} 如果成功，返回解析為會話物件的 Promise；如果發生錯誤，則返回 `null`。
 * @throws {Error} 如果在檢索會話期間拋出異常，則在開發模式下記錄錯誤。
 */
export async function getSession(cookieName) {
  try {
    const session = await getIronSession(await cookies(), {
      password: serverConfig.ironSession.password,
      cookieName: cookieName,
    })

    return session
  } catch (error) {
    if (isDev) console.log(error)

    return null
  }
}

/**
 * 設置會話物件的值。
 *
 * @async
 * @function setSession
 * @param {string} cookieName - 要設置的會話的 Cookie 名稱。
 * @param {string} key - 要設置的會話的鍵。
 * @param {any} value - 要設置的會話的值。
 * @returns {Promise<Object|null>} 如果成功，返回解析為會話物件的 Promise；如果發生錯誤，則返回 `null`。
 * @throws {Error} 如果在設置會話期間拋出異常，則在開發模式下記錄錯誤。
 */
export async function setSession(cookieName, key, value) {
  try {
    const session = await getIronSession(await cookies(), {
      password: serverConfig.ironSession.password,
      cookieName: cookieName,
    })

    session[key] = value

    await session.save()

    return session
  } catch (error) {
    if (isDev) console.log(error)

    return null
  }
}

/**
 * 刪除會話物件的值。
 *
 * @async
 * @function deleteSession
 * @param {string} cookieName - 要刪除的會話的 Cookie 名稱。
 * @returns {Promise<null>} 如果成功，返回解析為 `null` 的 Promise。
 * @throws {Error} 如果在刪除會話期間拋出異常，則在開發模式下記錄錯誤。
 */
export async function deleteSession(cookieName) {
  try {
    const session = await getIronSession(await cookies(), {
      password: serverConfig.ironSession.password,
      cookieName: cookieName,
    })

    await session.destroy()

    return null
  } catch (error) {
    if (isDev) console.log(error)

    return null
  }
}
