'use client'

import FavIcon from './_components/fav-icon'
import Link from 'next/link'
import { useGetProductList } from '@/services/rest-client/use-product'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function FavPage() {
  // 呈現商品
  const { products, isError, isLoading } = useGetProductList()

  if (isError) return <div>failed to load</div>
  if (isLoading) return <div>載入中...</div>

  return (
    <>
      <h1>我的最愛列表</h1>
      <p>會員未登入時，是看不到任何的愛心圖示有被點亮的情況。</p>
      <p>
        在點按時會用loading狀態來控制一個動畫呈現，阻止使用者可能有快速點按問題。
      </p>
      <Link href="/user">會員登入頁</Link>
      <hr />
      <ul>
        {products.map((v) => {
          return (
            <li key={v.id}>
              <FavIcon id={v.id} />
              <span>
                {v.name} / {v.price}
              </span>
            </li>
          )
        })}
      </ul>
      <ToastContainer />
    </>
  )
}
