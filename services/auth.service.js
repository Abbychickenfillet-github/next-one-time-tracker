import prisma from '../lib/prisma.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
// 驗證資料用
import { emailSchema } from './definitions/common'
import { loginSchema, resetPasswordSchema } from './definitions/auth'
import { isDev } from '../lib/utils.js'
import { generateToken } from '../lib/otp.js'
import { serverConfig } from '../config/server.config.js'

// 回傳: { status, message, errors, payload: { data } }
// status: 'success' | 'error'
// message: string
// errors: { field: string, message: string }[]
// payload: { data: { name, password } }

// 會員登入(本地端)
// data = { name, password }
export const login = async (data) => {
  // 驗證參數是否為正確的資料類型
  const validatedFields = loginSchema.safeParse(data)

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
    // 查詢資料庫這帳號的使用者資料(如果name有設定為unique，可以用`findUnique`)
    const user = await prisma.user.findUnique({
      where: { name: data.name },
    })

    // null代表不存在
    if (!user) {
      return {
        status: 'error',
        message: '會員不存在',
        payload: { data },
      }
    }

    // 比較密碼正確性，isValid=true 代表正確: compareHash(輸入的密碼純字串, 資料庫中的密碼hash)
    const isValid = await bcrypt.compare(data.password, user.password)

    // isValid=false 代表密碼錯誤
    if (!isValid) {
      return {
        status: 'error',
        message: '密碼錯誤',
        payload: { data },
      }
    }

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
      message: '登入成功',
      payload: { user },
    }
  } catch (error) {
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '登入失敗',
      payload: { data },
    }
  }
}

// 產生otp，在資料庫建立一筆資料，並回傳otp資料
// data = { email }
export const generateOtp = async (data) => {
  // 驗證email格式是否正確
  const validatedEmail = emailSchema.safeParse(data)

  // 如果任何表單欄位無效，提前返回
  if (!validatedEmail.success) {
    return {
      status: 'error',
      message: '參數資料類型不正確',
      errors: validatedEmail.error.flatten().fieldErrors,
      payload: { data },
    }
  }

  // 產生一筆新的totp
  const newOtp = generateToken(data.email)
  // 30 秒後會重新改變
  const second =
    newOtp.totp.period - (Math.floor(Date.now() / 1000) % newOtp.totp.period)
  // 預設 10 分鐘過期(10 * 60 * 1000)，毫秒整數值
  const exp = Date.now() + serverConfig.otp.expire
  // otp token(6位數字)
  const token = newOtp.token
  // 產生一個隨機hash，用於返回網站時驗証用
  const hash = crypto.randomBytes(10).toString('hex')
  // 過期時間(日期物件)，用於資料庫比對otp是否到期
  const expiredAt = new Date(exp)

  try {
    // 用email查詢是否有記錄
    const existOtp = await prisma.otp.findUnique({
      where: { email: data.email },
    })

    // 如果有過期的otp，刪除它
    if (existOtp && existOtp?.expiredAt <= new Date()) {
      await prisma.otp.delete({ where: { id: existOtp.id } })
    }

    // 如果有未過期的otp，返回錯誤
    if (existOtp && existOtp?.expiredAt >= new Date()) {
      return {
        status: 'error',
        message: '有尚未過期的otp',
        payload: {
          data,
        },
      }
    }

    // 建立一筆otp在資料表
    const otp = await prisma.otp.create({
      data: { email: data.email, token, hash, expiredAt },
    })

    // null代表不存在
    if (!otp) {
      return {
        status: 'error',
        message: '產生otp失敗',
        payload: {
          data,
        },
      }
    }

    // 驗証完成，回傳OTP資料
    return {
      status: 'success',
      message: '產生otp成功',
      payload: {
        otp: {
          email: data.email, // 會員email
          hash: hash, // 產生的特定hash，用於返回網站時驗証用
          token: token, // 產生的 token，注意: 這個值"不要返回給前端"，只是用來驗証比對用
          uri: newOtp.uri, // 產生的 uri，這個uri可以用在Google Authenticator整合用
          changeAt: Date.now() + second * 1000, // 30 秒後會重新改變，注意:這個值是在除錯驗證時用的
          exp: exp, // 過期時間，毫秒值
        },
      },
    }
  } catch (error) {
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '產生otp失敗',
      payload: {
        data,
      },
    }
  }
}

// 重設密碼
// data = { email, password, token }
export const resetPassword = async (data) => {
  // 驗證參數是否為正確的資料類型
  const validatedFields = resetPasswordSchema.safeParse(data)

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
    // 驗證是否有這個email的未到期的otp
    const otp = await prisma.otp.findFirst({
      where: {
        AND: [
          { email: data.email },
          { token: data.token },
          { expiredAt: { gte: new Date() } },
        ],
      },
    })

    // 驗證otp是否存在
    const isValid = !!otp

    if (!isValid) {
      return {
        status: 'error',
        message: 'otp驗證失敗',
        payload: { data },
      }
    }

    // 查詢資料庫這email的使用者資料
    const dbUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (!dbUser) {
      return {
        status: 'error',
        message: '會員不存在',
        payload: { data },
      }
    }

    // 產生新的hash密碼
    const passwordHash = await bcrypt.hash(data.password, 10)

    // 更新密碼欄位
    const updateUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { password: passwordHash },
    })

    // 刪除所有這個email的otp
    await prisma.otp.deleteMany({ where: { email: data.email } })

    // 不回傳密碼，刪除密碼屬性
    delete updateUser.password

    // 如果user的屬性中有null值，轉換為空字串
    if (updateUser) {
      for (const key in updateUser) {
        if (updateUser[key] === null) {
          updateUser[key] = ''
        }
      }
    }

    return {
      status: 'success',
      message: '重設會員密碼成功',
      payload: { user: updateUser },
    }
  } catch (error) {
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '重設會員密碼失敗',
      payload: { data },
    }
  }
}
