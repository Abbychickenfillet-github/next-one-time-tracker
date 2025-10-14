'use client'

import { useState } from 'react'
import axios from '@/lib/line-pay-axios'
import { useAuth } from '@/hooks/use-auth'
import '@/styles/LinePayPage.css'

function LinePayPage() {
  const { isAuth } = useAuth()
  const [formData, setFormData] = useState({
    amount: '',
    orderId: '',
    currency: 'TWD',
    subscriptionType: 'monthly',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentUrl, setPaymentUrl] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    console.log('🎯 handleSubmit 被調用')
    e.preventDefault()

    // 檢查登入狀態
    if (!isAuth) {
      setError('請先登入才能進行付款')
      return
    }

    setLoading(true)
    setError('')
    setPaymentUrl('')

    try {
      console.log('📋 表單資料:', formData)

      const subscriptionPlans = {
        monthly: { name: '月費方案', price: 99, duration: '1個月' },
      }

      const selectedPlan = subscriptionPlans[formData.subscriptionType]
      const finalAmount = formData.amount || selectedPlan.price

      console.log('💰 選擇的方案:', selectedPlan)
      console.log('💰 最終金額:', finalAmount)

      const paymentData = {
        amount: Number(finalAmount),
        orderId: formData.orderId,
        currency: formData.currency,
        packages: [
          {
            id: 'subscription',
            amount: Number(finalAmount),
            name: selectedPlan.name,
            products: [
              {
                name: `訂閱服務 - ${selectedPlan.name}`,
                quantity: 1, // 移除
                price: Number(finalAmount),
              },
            ],
          },
        ],
      }

      console.log('🚀 發送付款請求:', paymentData)

      const response = await axios.post(
        '/payment/line-pay/request',
        paymentData //帶入paymentData物件
      )

      console.log('✅ 付款請求回應:', response.data)

      if (
        response.data.status === 'success' &&
        (response.data.payload?.paymentUrl || response.data.data?.paymentUrl)
      ) {
        const paymentUrl =
          response.data.payload?.paymentUrl || response.data.data?.paymentUrl
        console.log('🎯 付款 URL:', paymentUrl)
        console.log('response.data', response.data)
        setPaymentUrl(paymentUrl)
        // Auto redirect to LINE Pay
        window.location.href = paymentUrl
      } else {
        console.error('❌ 付款請求失敗:', response.data)
        setError('Failed to create payment request')
      }
    } catch (err) {
      console.error('❌ LINE Pay 付款請求錯誤:', err)
      console.error('❌ 錯誤詳情:', {
        // Axios 錯誤訊息
        axiosMessage: err.message,
        // HTTP 狀態碼
        httpStatus: err.response?.status,
        httpStatusText: err.response?.statusText,
        // 後端回傳的錯誤資料
        backendData: err.response?.data,
        // 後端的錯誤訊息
        backendMessage: err.response?.data?.message,
        // 後端的 payload（如果有的話）
        backendPayload: err.response?.data?.payload,
      })

      // 優先顯示後端的錯誤訊息，其次是 Axios 錯誤訊息
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Payment request failed'
      setError(errorMessage)
    } finally {
      // finally確保無論成功或失敗，資料庫連線都會被正確關閉，避免記憶體洩漏與連線池耗盡
      setLoading(false)
    }
  }

  return (
    <div className="linepay-page">
      <div className="linepay-container">
        <h1>訂閱服務付款</h1>
        <p className="subscription-description">
          選擇您的訂閱方案，享受專業服務
        </p>

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label htmlFor="subscriptionType">訂閱方案</label>
            <select
              id="subscriptionType"
              name="subscriptionType"
              value={formData.subscriptionType}
              onChange={handleInputChange}
            >
              <option value="monthly">月費方案 - NT$99/月</option>
              <option value="quarterly">季費方案 - NT$799/季 (省 NT$98)</option>
              <option value="yearly">年費方案 - NT$2,999/年 (省 NT$589)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="orderId">訂單編號</label>
            <input
              type="text"
              id="orderId"
              name="orderId"
              value={formData.orderId}
              onChange={handleInputChange}
              placeholder="例如: SUB-2024-001"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">自訂金額 (選填)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="留空使用方案預設價格"
              min="1"
            />
            <small className="form-help">留空將使用選擇方案的預設價格</small>
          </div>

          <div className="form-group">
            <label htmlFor="currency">幣別</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
            >
              <option value="TWD">TWD (新台幣)</option>
              <option value="USD">USD (美元)</option>
              <option value="JPY">JPY (日圓)</option>
            </select>
          </div>

          <button type="submit" className="pay-button" disabled={loading}>
            {loading ? '處理中...' : '開始訂閱並付款'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {paymentUrl && (
          <div className="payment-url">
            <p>付款連結已生成，正在跳轉...</p>
            <a href={paymentUrl} target="_blank" rel="noopener noreferrer">
              手動開啟 LINE Pay
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default LinePayPage
