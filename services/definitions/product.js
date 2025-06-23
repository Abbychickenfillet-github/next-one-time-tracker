import { z } from 'zod'

// 頁數的驗証用的schema
export const pageSchema = z.object({
  page: z.number({ message: 'page資料類型必需為數字' }).int().positive(),
  perPage: z.number({ message: 'perPage資料類型必需為數字' }).int().positive(),
})

// 條件的驗証用的schema
export const conditionsSchema = z.object({
  nameLike: z.string().optional(),
  brandIds: z.array(z.number()).optional(),
  categoryIds: z.array(z.number()).optional(),
  priceGte: z.number().optional(),
  priceLte: z.number().optional(),
})

// 排序的驗証用的schema
export const sortBySchema = z.object({
  sort: z.enum(['id', 'name', 'price']),
  order: z.enum(['asc', 'desc']),
})
