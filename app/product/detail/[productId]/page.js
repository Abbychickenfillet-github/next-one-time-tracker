'use client'

import { useGetProduct } from '@/services/rest-client/use-product'
// 這裡的useParams是next的hook，用來取得網址上的動態參數
import { useParams } from 'next/navigation'
import Link from 'next/link'

// 網址範例: /product/detail/1
export default function ProductIdPage() {
  // 取得網址上的動態參數，例如: /product/detail/1
  // productId是由資料夾名稱決定，例如: [productId]資料夾名稱，得到的參數名稱就是productId
  const params = useParams()
  // 使用自訂的useGetProduct勾子，取得單一筆的商品資料
  const { product, isLoading, isError } = useGetProduct(params.productId)

  // 這裡的data會是undefined，因為還在載入中，但會受到isLoading的控制保護渲染時不會出錯
  if (isLoading) return <div>載入中...</div>
  if (isError) return <div>發生錯誤</div>

  return (
    <>
      <h1>商品詳細頁面</h1>
      <Link href="/product/list">回到一般列表</Link>
      <br />
      <Link href="/product/list-loadmore" scroll={false}>
        回到[載入更多]列表
      </Link>
      <br />
      <Link href="/product/list-is">回到[捲動載入]列表</Link>
      <hr />
      <h2>{product.name}</h2>
      <p>價格: {product.price}</p>
      <p>說明: {product.info}</p>
    </>
  )
}
