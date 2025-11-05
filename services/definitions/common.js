import { z } from 'zod'

// 驗証用的schema，id必須為UUID格式
export const idSchema = z.object({
  id: z
    .string({ message: 'id資料類型必需為字串' })
    .uuid({ message: 'id格式必須為有效的UUID' }),
})

// 驗証email格式
export const emailSchema = z.object({
  email: z.string().email({ message: 'email格式不正確' }),
})
