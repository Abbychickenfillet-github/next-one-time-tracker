'use client'

import { useCart } from '@/hooks/use-cart-state'
import Image from 'next/image'
import Link from 'next/link'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// 商品範例
import products from '../_data/Product.json'

export default function CartProductListPage() {
  // 加入購物車
  const { addItem } = useCart()

  // 跳出訊息通知函式(使用react-hot-toast套件)
  const notify = (productName) => {
    toast.success(productName + ' 已成功加入購物車!')
  }

  return (
    <>
      <h1>購物車-商品列表頁範例</h1>
      <hr />
      <p>
        <Link href="/cart">購物車範例</Link>
        <br />
        <Link href="/cart/coupon">購物車範例-折價券</Link>
      </p>
      <hr />
      <div>
        <ul>
          {products.slice(0, 20).map((v) => {
            return (
              <li key={v.id}>
                <div>
                  <Image
                    src={`/images/product/thumb/${v.photos.split(',')[0]}`}
                    alt="..."
                    width={75}
                    height={50}
                  />
                </div>
                <div>{v.name}</div>
                <div>NTD {v.price}元</div>
                <button
                  onClick={() => {
                    // 商品原本沒有數量屬性(quantity)，要先加上
                    const item = { ...v, quantity: 1 }
                    // 注意: 重覆加入會自動+1產品數量
                    addItem(item)
                    // 呈現跳出對話盒
                    notify(v.name)
                  }}
                >
                  加入購物車
                </button>
                <hr />
              </li>
            )
          })}
        </ul>
      </div>
      {/* 土司訊息用的元件 */}
      <ToastContainer />
    </>
  )
}
