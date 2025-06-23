import { NextResponse as res } from 'next/server'

// 導入服務層的類別
import { getProducts } from '@/services/product.service'
// 導入回應函式
import { successResponse, errorResponse, isDev } from '@/lib/utils.js'

export async function GET(request) {
  // 取得查詢參數，與設定預設值
  const searchParams = request.nextUrl.searchParams
  // type=all，所有資料都要取得
  // type=count，就不需要取得資料
  // type=data，就需要取得資料
  const type = searchParams.get('type') || 'all'

  const page = Number(searchParams.get('page')) || 1
  const perPage = Number(searchParams.get('perpage')) || 10

  const nameLike = searchParams.get('name_like') || ''
  const brandIds = searchParams.get('brand_ids')
    ? searchParams
        .get('brand_ids')
        .split(',')
        .map((id) => Number(id))
    : []
  const categoryIds = searchParams.get('category_ids')
    ? searchParams
        .get('category_ids')
        .split(',')
        .map((id) => Number(id))
    : []

  const priceGte = Number(searchParams.get('price_gte')) || 0
  const priceLte = Number(searchParams.get('price_lte')) || 100000

  const conditions = { nameLike, brandIds, categoryIds, priceGte, priceLte }

  // 排序條件欄位，預設為id遞增，可選擇id,name與price
  const sort = searchParams.get('sort') || 'id'
  // 預設為遞增，可選擇asc與desc (注意: 這裡的asc與desc是字串)
  const order = searchParams.get('order') || 'asc'
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
  if (data.status === 'success') {
    return successResponse(res, data?.payload)
  } else {
    const error = { message: data?.message }
    return errorResponse(res, error)
  }
}
