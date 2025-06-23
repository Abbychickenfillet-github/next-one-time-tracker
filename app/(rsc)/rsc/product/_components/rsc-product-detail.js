import { isDev } from '@/lib/utils'
import { getProductById } from '@/services/product.service'
import { cache } from 'react'

export const getProductByIdWithCache = cache(async (id) => {
  const data = await getProductById(id)

  return data
})

export default async function RscProductDetail({ searchParams }) {
  const params = await searchParams
  console.log(params)
  const id = Number(params.id) || 0

  const data = await getProductByIdWithCache(id)

  if (isDev) console.log(data)

  const product = data?.payload?.product

  if (!product) return <p>找不到商品</p>

  return (
    <>
      <h2>{product?.name}</h2>
      <h3>NT${product?.price?.toLocaleString()}</h3>
      <p>{product?.info}</p>
    </>
  )
}
