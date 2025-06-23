// 導入prisma客戶端
import prisma from '@/lib/prisma.js'
// 驗證資料用
import { idSchema } from '@/services/definitions/common'
import {
  pageSchema,
  conditionsSchema,
  sortBySchema,
} from '@/services/definitions/product'
// 除錯用
import { isDev } from '@/lib/utils'

// NOTE: 這裡是服務層，負責處理商品相關的邏輯
// 不會使用throw錯誤，而是回傳物件，物件包含status, message, payload
// status: 'success' | 'error'
// message: string
// payload: any

/**
 * 生成orderBy物件.
 *
 * @param {Object} sortBy - The sorting criteria.
 * @param {string} sortBy.sort - The field to sort by.
 * @param {string} sortBy.order - The order of sorting (e.g., 'asc' or 'desc').
 * @returns {Object} An object representing the sorting order.
 */
const generateOrderBy = (sortBy) => {
  return {
    [sortBy.sort]: sortBy.order,
  }
}

/**
 * 生成where物件. Generates a 'where' object based on the provided conditions.
 *
 * @param {Object} conditions - The conditions to generate the 'where' object.
 * @param {string} [conditions.nameLike] - A substring to search for in the name field.
 * @param {number[]} [conditions.brandIds] - An array of brand IDs to filter by.
 * @param {number[]} [conditions.categoryIds] - An array of category IDs to filter by.
 * @param {number} [conditions.priceGte] - A minimum price to filter by.
 * @param {number} [conditions.priceLte] - A maximum price to filter by.
 * @returns {Object} The generated 'where' object with the applied conditions.
 */
const generateWhere = (conditions) => {
  const where = {}
  // 如果有傳入nameLike參數，就加入where物件
  if (conditions.nameLike) {
    where.name = { contains: conditions.nameLike }
  }

  // 如果有傳入brandIds參數(陣列中有資料)，就加入where物件(brandsId in [1, 2, 3])
  if (conditions.brandIds.length) {
    where.brandId = { in: conditions.brandIds }
  }

  // 如果有傳入categoryIds參數(陣列中有資料)，就加入where物件(categoryId in [1, 2, 3])
  if (conditions.categoryIds.length) {
    where.categoryId = { in: conditions.categoryIds }
  }

  if (conditions.priceGte) {
    where.price = { gte: conditions.priceGte }
  }

  // 如果已經有where.price物件，就加入where.price.lte物件
  if (conditions.priceLte) {
    where.price = where.price
      ? { ...where.price, lte: conditions.priceLte }
      : { lte: conditions.priceLte }
  }

  return where
}

/**
 * 取得所有商品資料 Asynchronously retrieves all product entries from the repository.
 */
export const getProducts = async (
  type = 'all', // type=all, type=count, type=data
  page = 1, // 預設第1頁
  perPage = 10, // 預設每頁10筆
  conditions = {}, // 過濾條件
  sortBy = {} // 排序條件
) => {
  // 驗證參數是否為正整數
  const validatedFields1 = pageSchema.safeParse({
    page,
    perPage,
  })

  // 如果驗証失敗，提前返回
  if (!validatedFields1.success) {
    return {
      status: 'error',
      message: 'page參數資料類型不正確',
      errors: validatedFields1.error.flatten().fieldErrors,
      payload: { page, perPage, conditions, sortBy },
    }
  }

  // 需要先驗證conditions物件是否符合規則
  const validatedFields2 = conditionsSchema.safeParse(conditions)

  // 如果驗証失敗，提前返回
  if (!validatedFields2.success) {
    return {
      status: 'error',
      message: 'conditions參數資料類型不正確',
      errors: validatedFields2.error.flatten().fieldErrors,
      payload: { conditions },
    }
  }

  // 需要先驗證sortBy物件是否符合規則
  const validatedFields3 = sortBySchema.safeParse(sortBy)

  // 如果驗証失敗，提前返回
  if (!validatedFields3.success) {
    return {
      status: 'error',
      message: 'sortBy參數資料類型不正確',
      errors: validatedFields3.error.flatten().fieldErrors,
      payload: { sortBy },
    }
  }

  // where物件
  const where = generateWhere(conditions)
  // orderBy物件
  const orderBy = generateOrderBy(sortBy)

  try {
    // 取得商品資料
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        category: true,
        brand: true,
      },
    })

    // 取得總筆數
    const total = await prisma.product.count({ where })
    // 計算總頁數
    const pageCount = Math.ceil(total / perPage)

    // 依照type回傳不同資料
    switch (type) {
      // 只回傳量化資料 (total, pageCount, page, perPage)
      case 'count':
        return {
          status: 'success',
          message: '取得商品列表成功',
          payload: { total, pageCount, page, perPage },
        }
      // 只回傳商品資料
      case 'data':
        return {
          status: 'success',
          message: '取得商品列表成功',
          payload: { products },
        }
      // 預設回傳全部資料
      case 'all':
      default:
        return {
          status: 'success',
          message: '取得商品列表成功',
          payload: {
            total,
            pageCount,
            page,
            perPage,
            products,
          },
        }
    }
  } catch (error) {
    // 如果是開發環境，顯示錯誤訊息
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '取得商品列表失敗',
      payload: { products: null },
    }
  }
}

/**
 * 取得單筆商品資料依照ID.
 */
export const getProductById = async (id) => {
  // 驗證參數是否為正整數
  const validatedFields = idSchema.safeParse({
    id,
  })

  // 如果任何表單欄位無效，提前返回
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: '參數資料類型不正確',
      errors: validatedFields.error.flatten().fieldErrors,
      payload: { id },
    }
  }

  try {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
        brand: true,
      },
    })

    if (!product) {
      return {
        status: 'error',
        message: '商品不存在',
        payload: { id },
      }
    }

    return {
      status: 'success',
      message: '取得商品成功',
      payload: { product },
    }
  } catch (error) {
    // 如果是開發環境，顯示錯誤訊息
    isDev && console.log(error.message)

    return {
      status: 'error',
      message: '取得商品失敗',
      payload: { id },
    }
  }
}

// TODO: 取得單筆商品資料依照Slug
//const getProductBySlug = async (slug) => {
// try {
//   const product = await this.repository.findBySlug(slug)
//   if (!product) {
//     return {
//       status: 'error',
//       message: '商品不存在',
//       payload: { slug },
//     }
//   }
//   return {
//     status: 'success',
//     message: '取得商品成功',
//     payload: { product },
//   }
// } catch (error) {
//   // 如果是開發環境，顯示錯誤訊息
//   isDev && console.log(error.message)
//   return {
//     status: 'error',
//     message: '取得商品失敗',
//     payload: { slug },
//   }
// }
//}
// }

export const getBrands = async () => {
  const brands = await prisma.brand.findMany()

  return {
    status: 'success',
    message: '取得品牌列表成功',
    payload: { brands },
  }
}

// 取得所有分類資料
export const getCategories = async () => {
  const categories = await prisma.category.findMany()

  return {
    status: 'success',
    message: '取得分類列表成功',
    payload: { categories },
  }
}
