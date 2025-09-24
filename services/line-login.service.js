import prisma from '../lib/prisma.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
// 驗證資料用
import { lineLoginSchema } from './definitions/auth.js'
import { isDev } from '../lib/utils.js'
// lineLogin實例
import lineLogin from '@/config/server.line-login'

// data = { code, state }
export const lineLoginAuthCallback = async (data) => {
  // 如果是開發環境，顯示訊息
  if (isDev) console.log(data)

  // 驗證參數是否為正確的資料類型
  const validatedFields = lineLoginSchema.safeParse(data)

  // 如果任何表單欄位無效，提前返回
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: '參數資料類型不正確',
      errors: validatedFields.error.flatten().fieldErrors,
      payload: {
        data,
      },
    }
  }

  try {
    const { code, state } = data
    const result = await lineLogin.callback(code, state)

    // 如果是開發環境，顯示訊息
    if (isDev) console.log('return result:', result)

    // accessToken = line access token 儲存於資料庫中，用於後續操作
    const accessToken = result.access_token
    // sub = line user id
    const { sub, name, picture } = result.id_token

    // 透過line user id查詢是否有此會員
    let user = await prisma.user.findUnique({
      where: {
        lineUid: sub,
      },
    })

    if (user) {
      // 如果是開發環境，顯示訊息
      if (isDev) console.log('type1: 已有會員')
      // 更新lineAccessToken
      user = await prisma.user.update({
        where: {
          lineUid: sub,
        },
        data: {
          lineAccessToken: accessToken,
        },
      })
    }

    if (!user) {
      // 如果是開發環境，顯示訊息
      if (isDev) console.log('type2: 新會員')

      // 用亂數產生密碼，長度10(因為密碼是必要的，這裡並不會用到)
      const password = crypto.randomBytes(10).toString('hex')
      const passwordHash = await bcrypt.hash(password, 10)
      // email = line user id + '@line.com'
      const email = sub + '@line.com'

      // 新增會員資料
      user = await prisma.user.create({
        data: {
          // 用lineUid當帳號(因為帳號是必要的，這裡不會用到)
          username: String(sub),
          password: passwordHash,
          email: email,
          lineUid: String(sub),
          emailValidated: true,
          lineAccessToken: accessToken,
          profile: {
            create: { name: name, avatar: picture },
          },
        },
      })
    }

    if (isDev) console.log('user', user)

    // 不回傳密碼，刪除密碼屬性
    delete user.password

    // 如果user的屬性中有null值，轉換為空字串
    if (user) {
      for (const key in user) {
        if (user[key] === null) {
          user[key] = ''
        }
      }
    }

    // 驗証完成，回傳會員資料
    return {
      status: 'success',
      message: '資料庫認証成功',
      payload: { user },
    }
  } catch (error) {
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '資料庫認証失敗',
      payload: { data },
    }
  }
}

export const lineLoginGetAuthUrl = async () => {
  try {
    // 獲得line登入網址
    const url = await lineLogin.getAuthUrl()

    return {
      status: 'success',
      message: '獲得登入網址成功',
      payload: { url },
    }
  } catch (error) {
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '獲得登入網址失敗',
      payload: {},
    }
  }
}

// user_id = user.user_id
export const lineLoginLogout = async (user_id) => {
  try {
    // 獲得資料庫的lineAccessToken
    const user = await prisma.user.findUnique({
      where: {
        user_id,
      },
    })

    // 進行註銷
    const result = await lineLogin.revokeAccessToken(user.lineAccessToken)

    // 如果是開發環境，顯示訊息
    if (isDev) console.log('result:', result)

    // 清除資料庫的lineAccessToken
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        lineAccessToken: '',
      },
    })

    return {
      status: 'success',
      message: '註銷Line Access Token成功',
      payload: { result },
    }
  } catch (error) {
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '註銷Line Access Token失敗',
      payload: {},
    }
  }
}
