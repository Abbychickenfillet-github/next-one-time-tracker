'use server' // 伺服器函式 Server Functions

// 導入next/cache模組
import { revalidatePath } from 'next/cache'
// 導入服務層的類別
import {
  // getProductById,
  getProducts,
  getBrands,
  getCategories,
} from '@/services/product.service'
import { isDev } from '@/lib/utils'

// eslint-disable-next-line no-unused-vars
export async function refresh(currentState, formData) {
  // 重新驗証資料: 通知next資料快取到期，重新獲取資料與重整快取，用於刷新RSC獲取的資料用，參數為RSC的路徑
  // https://nextjs.org/docs/app/api-reference/functions/revalidatePath
  revalidatePath('/rsc/blog')
}

// eslint-disable-next-line no-unused-vars
export async function getAllBrands(currentState, formData) {
  // 取得品牌列表
  const data = await getBrands()

  // 如果是開發時，呈現資料
  if (isDev) console.log(data)

  // API回應
  return data
}

// eslint-disable-next-line no-unused-vars
export async function getAllCategories(currentState, formData) {
  // 取得分類列表
  const data = await getCategories()
  // 如果是開發時，呈現資料
  if (isDev) console.log(data)

  // API回應
  return data
}

export async function getAllProducts(currentState, formData) {
  // 由傳入的formData得到表單(客戶端元件)提交的資料(FormData物件)
  const type = formData.get('type') || 'all'

  const page = Number(formData.get('page')) || 1
  const perPage = Number(formData.get('perpage')) || 10

  const nameLike = formData.get('name_like') || ''
  const brandIds = formData.get('brand_ids')
    ? formData
        .get('brand_ids')
        .split(',')
        .map((id) => Number(id))
    : []
  const categoryIds = formData.get('category_ids')
    ? formData
        .get('category_ids')
        .split(',')
        .map((id) => Number(id))
    : []

  const priceGte = Number(formData.get('price_gte')) || 0
  const priceLte = Number(formData.get('price_lte')) || 100000

  const conditions = { nameLike, brandIds, categoryIds, priceGte, priceLte }

  // 排序條件欄位，預設為id遞增，可選擇id,name與price
  const sort = formData.get('sort') || 'id'
  // 預設為遞增，可選擇asc與desc (注意: 這裡的asc與desc是字串)
  const order = formData.get('order') || 'asc'
  const sortBy = { sort, order }
  // 取得部落格列表
  const data = await getProducts(
    type, // type=all, type=count, type=data
    page, // 預設第1頁
    perPage, // 預設每頁10筆
    conditions, // 過濾條件
    sortBy // 排序條件
  )

  // 如果是開發環境，顯示部落格列表
  if (isDev) console.log(data)

  // API回應
  return data
}
