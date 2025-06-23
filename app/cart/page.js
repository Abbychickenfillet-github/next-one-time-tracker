'use client'

import { useCart } from '@/hooks/use-cart-state'
import List from './_components/list'
import Link from 'next/link'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// cart init
// initialState = {
//   items: [],
//   isEmpty: true,
//   totalItems: 0,
//   cartTotal: 0,
// }

export default function CartBasicPage() {
  //可從useCart中獲取的各方法與屬性，參考README檔中說明
  const {
    cart,
    addItem,
    removeItem,
    updateItemQty,
    clearCart,
    isInCart,
    // updateItem,
    // items,
    // increment,
    // decrement,
  } = useCart()

  return (
    <>
      <h1>購物車範例</h1>
      <hr />
      <p>
        <Link href="/cart/products">商品列表頁範例</Link>
      </p>
      <p>
        <Link href="/cart/coupon">折價券範例</Link>
      </p>
      <div></div>

      {/* 列出cart中清單 */}
      <h2>購物車列表</h2>
      <List />
      {/* 以下為測試按鈕 */}
      <h4>測試按鈕</h4>
      <div>
        <button
          onClick={() => {
            console.log(cart)
            toast.success('已在主控台記錄cart狀態')
          }}
        >
          主控台記錄cart狀態
        </button>
        <br />
        <button
          onClick={() => {
            addItem({
              id: '111',
              quantity: 5,
              name: 'iphone',
              price: 15000,
              color: 'red',
              size: '',
            })
            toast.success('新增項目 id=111')
          }}
        >
          新增項目(id=111, x5)
        </button>
        <br />
        <button
          onClick={() => {
            addItem({
              id: '222',
              quantity: 1,
              name: 'ipad',
              price: 19000,
              color: '',
              size: '',
            })
            toast.success('新增項目 id=222')
          }}
        >
          新增項目(id=222, x1)
        </button>
        <br />
        <button
          onClick={() => {
            removeItem('222')
            toast.success('移除項目 id=222')
          }}
        >
          移除項目(id=222)
        </button>
        <br />
        <button
          onClick={() => {
            updateItemQty(222, 7)
            toast.success('更新項目 id=222 的數量為 7')
          }}
        >
          更新項目 id=222 的數量為 7
        </button>
        <br />
        <button
          className="btn btn-outline-secondary"
          onClick={() => {
            updateItemQty(111, 99)
            toast.success('更新項目 id=111 的數量為 99')
          }}
        >
          更新項目 id=111 的數量為 99
        </button>
        <br />
        <button
          className="btn btn-outline-secondary"
          onClick={() => {
            clearCart()
            toast.success('已清除整個購物車')
          }}
        >
          清除整個購物車
        </button>
        <br />
        <button
          onClick={() => {
            if (isInCart('222')) {
              toast.success('有id=222在購物車中')
            } else {
              toast.error('沒有id=222在購物車中')
            }
          }}
        >
          檢查id=222是否有在購物車中
        </button>
      </div>
      {/* 土司訊息視窗用 */}
      <ToastContainer />
    </>
  )
}
