'use client'

import { useCart } from '@/hooks/use-cart-state'
import List from '../_components/list'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// 範例資料
// type: 'amount'相減，'percent'折扣
const coupons = [
  { id: 1, name: '折100元', value: 100, type: 'amount' },
  { id: 2, name: '折300元', value: 300, type: 'amount' },
  { id: 3, name: '折550元', value: 300, type: 'amount' },
  { id: 4, name: '8折券', value: 0.2, type: 'percent' },
]

export default function CartCouponPage() {
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

  // const [couponOptions, setCouponOptions] = useState(coupons)
  const [selectedCouponId, setSelectedCouponId] = useState(0)
  const [netTotal, setNetTotal] = useState(0)

  useEffect(() => {
    // 一開始沒套用折價券，netTotal和cart.totalPrice一樣
    if (!selectedCouponId) {
      setNetTotal(cart.totalPrice)
      return
    }

    const coupon = coupons.find((v) => v.id === selectedCouponId)

    // type: 'amount'相減固定金額，'percent'百分比
    const newNetTotal =
      coupon.type === 'amount'
        ? cart.totalPrice - coupon.value
        : Math.round(cart.totalPrice * (1 - coupon.value))

    setNetTotal(newNetTotal)
  }, [cart.totalPrice, selectedCouponId])

  return (
    <>
      <h1>購物車-折價券範例</h1>
      <p>
        <Link href="/cart/products">商品列表頁範例</Link>
      </p>

      {/* 列出cart中清單 */}
      <h4>購物車列表</h4>
      <List />
      <h4>折價券</h4>
      <div>
        <select
          value={selectedCouponId}
          onChange={(e) => {
            setSelectedCouponId(Number(e.target.value))
          }}
        >
          <option value="0">選擇折價券</option>
          {coupons.map((v) => {
            return (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            )
          })}
        </select>
        <hr />
        <p>最後折價金額: {netTotal}</p>
      </div>
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
          onClick={() => {
            updateItemQty(111, 99)
            toast.success('更新項目 id=111 的數量為 99')
          }}
        >
          更新項目 id=111 的數量為 99
        </button>
        <br />
        <button
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
