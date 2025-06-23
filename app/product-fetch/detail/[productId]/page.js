'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { serverURL } from '@/config/client.config'

const defaultProduct = {
  id: 0,
  sn: '0',
  name: '0',
  photos: '0',
  stock: 0,
  price: 0,
  info: '0',
  brandId: 0,
  categoryId: 0,
}

export default function ProductIdPage() {
  const params = useParams()
  // data對應的是useGetProduct的data，預設值是undefined
  const [data, setData] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  // 這裡的data是undefined，因為還在載入中
  const getProduct = async (productId) => {
    try {
      const res = await fetch(`${serverURL}/api/products/${productId}`)
      const data = await res.json()
      setData(data)
      setIsLoading(false)
    } catch (error) {
      console.log(error)
      setIsError(true)
    }
  }

  // didMount後，取得商品資料
  useEffect(() => {
    if (params.productId) {
      getProduct(params.productId)
    }
  }, [params])

  // 這裡的data是undefined，因為還在載入中
  if (isLoading) return <div>載入中...</div>
  if (isError) return <div>發生錯誤</div>

  console.log(data)
  const product =
    data && data?.status === 'success' ? data?.data?.product : defaultProduct

  return (
    <>
      <h1>商品詳細頁面</h1>
      <Link href="/product-fetch/list">回到列表</Link>
      <hr />
      <h2>{product.name}</h2>
      <p>價格: {product.price}</p>
      <p>說明: {product.info}</p>
    </>
  )
}
