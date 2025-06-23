import {
  getProducts,
  getBrands,
  getCategories,
} from '@/services/product.service'
// import { redirect } from 'next/navigation'
import Pagination from './pagination'
import ProductList from './product-list'

import { cache } from 'react'

export const getProductsWithCache = cache(
  async (
    type, // type=all, type=count, type=data
    page, // 預設第1頁
    perPage, // 預設每頁10筆
    conditions, // 過濾條件
    sortBy
  ) => {
    const data = await getProducts(
      type, // type=all, type=count, type=data
      page, // 預設第1頁
      perPage, // 預設每頁10筆
      conditions, // 過濾條件
      sortBy // 排序條件
    )

    return data
  }
)

export default async function RscProductList({ searchParams }) {
  // TODO: 使用簡短的searchParams的key值，取得搜尋條件

  const params = await searchParams
  console.log(params)

  // 由傳入的formData得到表單(客戶端元件)提交的資料(FormData物件)
  const type = params.type || 'all'

  const page = Number(params.page) || 1
  const perPage = Number(params.perpage) || 10

  const nameLike = params.name_like || ''
  const brandIds = params.brand_ids
    ? params.brand_ids.split(',').map((id) => Number(id))
    : []
  const categoryIds = params.category_ids
    ? params.category_ids.split(',').map((id) => Number(id))
    : []

  const priceGte = Number(params.price_gte) || 0
  const priceLte = Number(params.price_lte) || 100000

  const conditions = { nameLike, brandIds, categoryIds, priceGte, priceLte }

  // 排序條件欄位，預設為id遞增，可選擇id,name與price
  const sort = params.sort || 'id'
  // 預設為遞增，可選擇asc與desc (注意: 這裡的asc與desc是字串)
  const order = params.order || 'asc'
  const sortBy = { sort, order }
  // 取得部落格列表
  const data = await getProductsWithCache(
    type, // type=all, type=count, type=data
    page, // 預設第1頁
    perPage, // 預設每頁10筆
    conditions, // 過濾條件
    sortBy // 排序條件
  )
  // 取得品牌列表
  const brands = await getBrands()
  console.log(brands)
  // 取得分類列表
  const categories = await getCategories()
  console.log(categories)

  console.log(data)

  return (
    <>
      <p>
        目前在第{page}頁 / 共有{data?.payload?.total}筆資料 / 共有
        {data?.payload?.pageCount}頁
      </p>
      <p>
        <Pagination page={page} pageCount={data?.payload?.pageCount} />
      </p>
      <ProductList products={data?.payload?.products} />
    </>
  )
}
