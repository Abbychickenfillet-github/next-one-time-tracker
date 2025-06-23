'use client'

import { useGetProductListData } from '@/services/rest-client/use-product'
import Link from 'next/link'

export default function ProductList({ page = 1, queryStringNoPage = '' }) {
  // 直接解出products，不需要再用useState定義
  // eslint-disable-next-line
  const { products, isLoading, isError } = useGetProductListData(
    page,
    queryStringNoPage
  )

  // if (isLoading) return <div>載入中...</div>
  if (isError) return <div>發生錯誤</div>

  return (
    <>
      {products.map((product) => (
        <li
          key={product.id}
          style={{
            borderColor: 'gray',
            borderStyle: 'solid',
            borderWidth: '1px',
            padding: '20px',
          }}
        >
          <Link href={`/product/detail/${product.id}`}>
            {product.name}({product.price})
          </Link>
        </li>
      ))}
    </>
  )
}
