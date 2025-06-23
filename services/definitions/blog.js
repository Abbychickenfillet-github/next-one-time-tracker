import { z } from 'zod'

// 部落格資料的驗証用的schema
export const blogSchema = z.object({
  title: z
    .string()
    .min(1, { message: '標題為必要' })
    .max(100, { message: '標題最多100字' }),
  content: z
    .string()
    .min(1, { message: '內容為必要' })
    .max(500, { message: '內容最多500字' }),
  published: z.boolean().optional(),
})
