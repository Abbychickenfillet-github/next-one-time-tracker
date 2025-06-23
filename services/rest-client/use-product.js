import { useQuery } from './use-fetcher'
import { serverURL } from '@/config/client.config'

import { createContext, useContext, useState } from 'react'

// 預設商品資料(單筆)
const defaultProduct = {
  id: 0,
  sn: '',
  name: '',
  photos: '',
  stock: 0,
  price: 0,
  info: '',
  brandId: 0,
  categoryId: 0,
}

// 預設搜尋條件
const defaultCriteria = {
  page: 1,
  perpage: 10,
  nameLike: '',
  brandIds: [],
  categoryIds: [],
  priceGte: 0,
  priceLte: 100000,
  sort: 'id',
  order: 'asc',
}

// #region 使用CONTEXT記錄搜尋條件用，勾子名稱為useProductState
const ProductContext = createContext(null)

ProductContext.displayName = 'ProductStateContext'

export function ProductProvider({ children }) {
  // 記錄搜尋條件
  const [criteria, setCriteria] = useState(defaultCriteria)
  return (
    <ProductContext.Provider value={{ criteria, setCriteria, defaultCriteria }}>
      {children}
    </ProductContext.Provider>
  )
}

// 包裝useContext的useProductState
export const useProductState = () => useContext(ProductContext)
// #endregion

// 獲得所有資料，包含總筆數、總頁數…
// queryString: page=1&perpage=10&nameLike=...
export const useGetProductListAll = (queryString) => {
  const { data, error, isLoading, mutate, isError } = useQuery(
    `${serverURL}/api/products?${queryString}`
  )

  let total = 0
  let pageCount = 0
  let products = []
  if (data && data.status === 'success') {
    products = data?.data?.products
    total = data?.data?.total
    pageCount = data?.data?.pageCount
  }

  return {
    total,
    pageCount,
    products,
    data,
    error,
    isLoading,
    mutate,
    isError,
  }
}

export const useGetProductBrands = () => {
  const { data, error, isLoading, mutate, isError } = useQuery(
    `${serverURL}/api/products/brands`
  )

  let brands = []
  if (data && data?.status === 'success') {
    brands = data?.data?.brands
  }

  return {
    brands,
    data,
    error,
    isLoading,
    mutate,
    isError,
  }
}

export const useGetProductCategories = () => {
  const { data, error, isLoading, mutate, isError } = useQuery(
    `${serverURL}/api/products/categories`
  )

  let mainCategories = []
  let subCategories = []
  let allCategories = []
  if (data && data?.status === 'success') {
    allCategories = data?.data?.categories
    mainCategories = allCategories.filter((c) => c.parentId === null)
    subCategories = allCategories.filter((c) => c.parentId !== null)
  }

  return {
    allCategories,
    mainCategories,
    subCategories,
    data,
    error,
    isLoading,
    mutate,
    isError,
  }
}
// 獲得總筆數、總頁數資料(不含商品資料)
export const useGetProductListCount = (queryString = '') => {
  // count 不需要不會影響到資料筆數的條件，例如page, perpage
  const searchParams = new URLSearchParams(queryString)
  searchParams.delete('page')
  searchParams.delete('perpage')

  const newQueryString = searchParams.toString()
  const qs = `type=count${newQueryString ? '&' + newQueryString : ''}`

  const { data, error, isLoading, mutate, isError } = useQuery(
    `${serverURL}/api/products?${qs}`
  )

  let total = 0
  let pageCount = 0
  if (data && data?.status === 'success') {
    total = data?.data?.total
    pageCount = data?.data?.pageCount
  }

  return {
    total,
    pageCount,
    data,
    error,
    isLoading,
    mutate,
    isError,
  }
}

// 獲得資料(只有商品資料)
export const useGetProductListData = (page, queryStringNoPage = '') => {
  const qs = `type=data&page=${page}${
    queryStringNoPage ? '&' + queryStringNoPage : ''
  }`

  const { data, error, isLoading, mutate, isError } = useQuery(
    `${serverURL}/api/products?${qs}`
  )

  let products = []
  if (data && data?.status === 'success') {
    products = data?.data?.products
  }

  return {
    products,
    data,
    error,
    isLoading,
    mutate,
    isError,
  }
}

export const useGetProductList = () => {
  const { data, error, isLoading, mutate, isError } = useQuery(
    `${serverURL}/api/products?perpage=300`
  )

  let products = []
  if (data && data?.status === 'success') {
    products = data?.data?.products
  }

  return {
    products,
    data,
    error,
    isLoading,
    mutate,
    isError,
  }
}

export const useGetProduct = (productId) => {
  const { data, error, isLoading, mutate, isError } = useQuery(
    `${serverURL}/api/products/${productId}`
  )

  let product = defaultProduct
  if (data && data?.status === 'success') {
    product = data?.data?.product
  }

  return {
    product,
    data,
    error,
    isLoading,
    mutate,
    isError,
  }
}
