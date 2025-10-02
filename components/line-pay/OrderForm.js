'use client'

import { useState } from 'react'

/**
 * 訂單表單組件 - 用於輸入商品價格和數量
 * @param {Object} props
 * @param {number} props.initialPrice - 初始價格，預設為 100
 * @param {number} props.initialQuantity - 初始數量，預設為 2
 * @param {Function} props.onPriceChange - 價格變更回調函數 (price) => void
 * @param {Function} props.onQuantityChange - 數量變更回調函數 (quantity) => void
 * @param {boolean} props.disabled - 是否禁用輸入，預設為 false
 * @param {string} props.className - 額外的 CSS 類別名稱
 */
export default function OrderForm({
  initialPrice = 100,
  initialQuantity = 2,
  onPriceChange,
  onQuantityChange,
  disabled = false,
  className = '',
}) {
  const [price, setPrice] = useState(initialPrice)
  const [quantity, setQuantity] = useState(initialQuantity)

  // 處理價格變更
  const handlePriceChange = (e) => {
    const newPrice = Number(e.target.value)
    setPrice(newPrice)
    if (onPriceChange) {
      onPriceChange(newPrice)
    }
  }

  // 處理數量變更
  const handleQuantityChange = (e) => {
    const newQuantity = Number(e.target.value)
    setQuantity(newQuantity)
    if (onQuantityChange) {
      onQuantityChange(newQuantity)
    }
  }

  // 計算總價
  const totalPrice = price * quantity

  return (
    <div className={`order-form ${className}`}>
      <div className="order-form-description">
        <p>
          商品名稱和ID都是在後端路由直接設定範例用，這裡只有價格會變動。
          目前成功回應頁已改為callback路由。
        </p>
      </div>

      <div className="form-inputs">
        <div className="input-group">
          <label htmlFor="quantity">數量:</label>
          <input
            id="quantity"
            type="number"
            name="quantity"
            value={quantity === 0 ? '' : quantity}
            onChange={handleQuantityChange}
            disabled={disabled}
            min="1"
            step="1"
          />
        </div>

        <div className="input-group">
          <label htmlFor="price">單價:</label>
          <input
            id="price"
            type="number"
            name="price"
            value={price === 0 ? '' : price}
            onChange={handlePriceChange}
            disabled={disabled}
            min="0"
            step="1"
          />
        </div>
      </div>

      <hr />

      <div className="total-section">
        <div className="total-price">
          總價: <span className="total-amount">{totalPrice}</span>
        </div>
      </div>
    </div>
  )
}
