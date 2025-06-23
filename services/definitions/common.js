import { z } from 'zod'

// 驗証用的schema，id必須為正整數
export const idSchema = z.object({
  id: z.number({ message: 'id資料類型必需為數字' }).int().positive(),
})

// 驗証email格式
export const emailSchema = z.object({
  email: z.string().email({ message: 'email格式不正確' }),
})
