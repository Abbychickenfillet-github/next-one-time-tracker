'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'
import Image from 'next/image'
import { isDev, apiURL } from '@/config/client.config'
import './line-pay.css'

/**
 * Line Pay 付款按鈕組件
 * @param {Object} props
 * @param {boolean} props.isAuth - 用戶登入狀態
 * @param {number} props.totalAmount - 付款總金額
 * @param {string} props.buttonText - 按鈕文字，預設為 '前往付款'
 * @param {string} props.disabledText - 未登入時顯示的文字，預設為 '請先登入'
 * @param {Function} props.onBeforePayment - 付款前的回調函數
 * @param {Function} props.onPaymentSuccess - 付款成功的回調函數
 * @param {Function} props.onPaymentError - 付款失敗的回調函數
 */
export default function LinePayButton({
  isAuth,
  totalAmount,
  buttonText = '前往付款',
  disabledText = '請先登入',
  onBeforePayment,
  onPaymentSuccess,
  onPaymentError,
  disabled = false,
  className = '',
}) {
  const [isLoading, setIsLoading] = useState(false)

  // 導向至LINE Pay付款頁面
  const handlePayment = async () => {
    // 檢查是否已登入
    if (!isAuth) {
      toast.error('請先登入以保留訂單資訊')
      return
    }

    // 執行付款前回調
    if (onBeforePayment) {
      try {
        const shouldContinue = await onBeforePayment()
        if (shouldContinue === false) {
          return
        }
      } catch (error) {
        console.error('付款前回調執行失敗:', error)
        toast.error('付款準備失敗')
        return
      }
    }

    setIsLoading(true)

    try {
      // 先連到API路由，取得LINE Pay付款網址
      console.log(`🚀 開始goLinePay函數請求`)
      console.log(
        '📡 請求 URL:',
        `${apiURL}/payment/line-pay/request?amount=${totalAmount}`
      )
      console.log('🔧 apiURL 值:', apiURL)
      console.log('🔧 isDev 值:', isDev)

      const res = await fetch(
        `${apiURL}/payment/line-pay/request?amount=${totalAmount}`,
        {
          method: 'GET',
          // 讓fetch能夠傳送cookie
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      )

      const resData = await res.json()

      console.log('🔍 API 回應:', resData)
      console.log('📊 回應狀態:', res.status)

      if (resData.status === 'success') {
        if (window.confirm('確認要導向至LINE Pay進行付款?')) {
          // 執行付款成功回調（在導向之前）
          if (onPaymentSuccess) {
            onPaymentSuccess(resData.data)
          }

          //導向至LINE Pay付款頁面
          window.location.href = resData.data.paymentUrl
        }
      } else {
        console.error('❌ 付款請求失敗:', resData)
        const errorMessage = resData.message || '未知錯誤'
        toast.error(`要求付款網址失敗: ${errorMessage}`)

        // 執行付款失敗回調
        if (onPaymentError) {
          onPaymentError(resData)
        }
      }
    } catch (error) {
      console.error('❌ 付款處理過程發生錯誤:', error)
      toast.error('付款處理失敗，請稍後再試')

      // 執行付款失敗回調
      if (onPaymentError) {
        onPaymentError(error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`line-pay-button-container ${className}`}>
      <Image
        alt="Line Pay Logo"
        src="/line-pay/LINE-Pay(h)_W85_n.png"
        width={85}
        height={25}
        className="line-pay-logo"
      />
      <button
        onClick={handlePayment}
        disabled={!isAuth || disabled || isLoading}
        className={`line-pay-btn ${
          !isAuth || disabled ? 'disabled' : ''
        } ${isLoading ? 'loading' : ''}`}
        style={{
          opacity: !isAuth || disabled ? 0.5 : 1,
          cursor: !isAuth || disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? '處理中...' : isAuth ? buttonText : disabledText}
      </button>
    </div>
  )
}
