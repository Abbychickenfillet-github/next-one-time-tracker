import prisma from '../lib/prisma.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
// 驗證資料用
import { providerDataSchema } from './definitions/auth.js'
import { isDev } from '../lib/utils.js'

// data = { providerId, displayName, email, uid, photoURL }
export const googleLoginAuth = async (data) => {
  // 如果是開發環境，顯示訊息
  if (isDev) console.log(data)

  // 驗證參數是否為正確的資料類型
  const validatedFields = providerDataSchema.safeParse(data)

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

  const { displayName, email, uid, photoURL } = data

  try {
    // 查詢資料庫是否有同email的會員資料
    const emailUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    })

    // 查詢資料庫是否有同googleUid的資料
    const googleUidUser = await prisma.user.findUnique({
      where: {
        googleUid: uid,
      },
    })

    // 會員資料
    let user = null

    // Type1: 有emailUser，但沒有googleUidUser  ==> 進行更新googleUid+profile
    if (!googleUidUser && emailUser) {
      // 如果是開發環境，顯示訊息
      if (isDev) console.log('type1: 有emailUser，但沒有googleUidUser')

      // 更新googleUid+profile
      user = await prisma.user.update({
        where: {
          id: emailUser.id,
        },
        data: {
          googleUid: uid,
          profile: {
            update: {
              where: {
                userId: emailUser.id,
              },
              data: {
                name: displayName,
                avatar: photoURL,
              },
            },
          },
        },
        include: {
          profile: true,
        },
      })
    }

    // 兩者都有存在(代表是有已存在的會員)
    if (googleUidUser && emailUser) {
      // 如果是開發環境，顯示訊息
      if (isDev) console.log('type2: 已存在的會員')

      user = googleUidUser
    }

    // 兩者都不存在 -> 建立一個新會員資料(無帳號與密碼)
    if (!googleUidUser && !emailUser) {
      // 如果是開發環境，顯示訊息
      if (isDev) console.log('type3: 新會員')

      // 用亂數產生密碼，長度10(因為密碼是必要的，這裡並不會用到)
      const password = crypto.randomBytes(10).toString('hex')
      const passwordHash = await bcrypt.hash(password, 10)

      // 新增會員資料
      user = await prisma.user.create({
        data: {
          // 用googleUid當帳號(因為帳號是必要的，這裡不會用到)
          username: String(uid),
          password: passwordHash,
          email: email,
          googleUid: uid,
          emailValidated: true,
          profile: {
            create: { name: displayName, avatar: photoURL },
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
