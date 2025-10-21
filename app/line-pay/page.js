'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from '@/lib/line-pay-axios'
import { useAuth } from '@/hooks/use-auth'
import '@/styles/LinePayPage.css'

function LinePayPage() {
  const { isAuth } = useAuth()

  // 調試 isAuth 狀態變化
  useEffect(() => {
    console.log('🔄 isAuth 狀態變化:', isAuth)
  }, [isAuth])

  const [formData, setFormData] = useState({
    amount: 99, // 預設金額，對應月費方案
    orderId: '',
    currency: 'TWD',
    subscriptionType: 'monthly',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentUrl, setPaymentUrl] = useState('')

  // 訂閱狀態相關
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)

  // 調試 subscriptionStatus 狀態變化
  useEffect(() => {
    console.log('🔄 subscriptionStatus 狀態變化:', subscriptionStatus)
  }, [subscriptionStatus])

  // 調試 subscriptionLoading 狀態變化
  useEffect(() => {
    console.log('🔄 subscriptionLoading 狀態變化:', subscriptionLoading)
  }, [subscriptionLoading])

  // 獲取用戶訂閱狀態
  const fetchSubscriptionStatus = useCallback(async () => {
    console.log('🔍 fetchSubscriptionStatus 被呼叫')
    console.log('🔍 isAuth 狀態:', isAuth)

    if (!isAuth) {
      console.log('🔐 用戶未登入，跳過訂閱狀態查詢')
      setSubscriptionLoading(false)
      return
    }

    console.log('🚀 開始獲取訂閱狀態...')
    setSubscriptionLoading(true)

    try {
      // 使用原生 fetch 避免瀏覽器擴充功能干擾
      const response = await fetch('/api/user/subscription-status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 Fetch 回應狀態:', response.status, response.ok)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ 訂閱狀態 API 回應:', result)
      console.log('✅ 設定 subscriptionStatus:', result)
      setSubscriptionStatus(result)
    } catch (error) {
      console.error('❌ 獲取訂閱狀態失敗:', error)
      console.error('❌ 錯誤詳情:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      })
      setSubscriptionStatus(null)
    } finally {
      console.log('🏁 設定 subscriptionLoading 為 false')
      setSubscriptionLoading(false)
    }
  }, [isAuth])

  // 組件載入時獲取訂閱狀態
  useEffect(() => {
    fetchSubscriptionStatus()
  }, [isAuth, fetchSubscriptionStatus])

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
      const orderId = `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
      const selectedPlan = subscriptionPlans[formData.subscriptionType]
      const finalAmount = selectedPlan.price // 直接使用方案價格，不讓用戶自訂

      console.log('💰 選擇的方案:', selectedPlan)
      console.log('💰 最終金額:', finalAmount)

      const paymentData = {
        amount: Number(finalAmount),
        orderId: orderId,
        currency: formData.currency,
        packages: [
          {
            id: 'subscription',
            amount: Number(finalAmount),
            name: selectedPlan.name,
            products: [
              {
                name: `訂閱服務 - ${selectedPlan.name}`,
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

        {/* 功能說明 */}
        <div className="features-info">
          <h3>📋 付費版功能</h3>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>解鎖多裝置同步</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>無限制記錄數量 (最多50筆)</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>雲端資料庫儲存</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>資料永久保存</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>基礎統計分析</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <span>手機、平板、電腦同步</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🚦</span>
              <span>每小時120次 API 呼叫</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🚦</span>
              <span>每天520次資料庫查詢</span>
            </div>
          </div>
        </div>

        {/* 訂閱狀態顯示 */}
        {isAuth && (
          <div className="subscription-status">
            {(() => {
              console.log('🎨 渲染訂閱狀態區域')
              console.log('🎨 subscriptionLoading:', subscriptionLoading)
              console.log('🎨 subscriptionStatus:', subscriptionStatus)
              return null
            })()}
            {subscriptionLoading ? (
              <div className="status-loading">
                <p>載入訂閱狀態中...</p>
              </div>
            ) : subscriptionStatus?.data?.isActive ? (
              <div className="status-card">
                <div className="status-header">
                  <h3>📋 訂閱狀態</h3>
                  <span className="status-badge active">✅ 已訂閱</span>
                </div>
                <div className="status-details">
                  <div className="status-item">
                    <span className="label">訂單編號:</span>
                    <span className="value">
                      {subscriptionStatus.data.orderId}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="label">付款時間:</span>
                    <span className="value">
                      {new Date(subscriptionStatus.data.paidAt).toLocaleString(
                        'zh-TW',
                        {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'Asia/Taipei',
                        }
                      )}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="label">到期時間:</span>
                    <span className="value">
                      {new Date(subscriptionStatus.data.dueAt).toLocaleString(
                        'zh-TW',
                        {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'Asia/Taipei',
                        }
                      )}
                    </span>
                  </div>
                  <div className="status-item">
                    <span className="label">剩餘天數:</span>
                    <span className="value">
                      {subscriptionStatus.data.daysLeft > 0
                        ? `${subscriptionStatus.data.daysLeft} 天`
                        : '已過期'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="status-card">
                <div className="status-header">
                  <h3>📋 訂閱狀態</h3>
                  <span className="status-badge inactive">❌ 尚未訂閱</span>
                </div>
                <p className="status-message">
                  您尚未訂閱任何方案，請選擇下方方案開始訂閱。
                </p>
              </div>
            )}
          </div>
        )}

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
            </select>
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
            </select>
          </div>

          {(() => {
            console.log('🔘 按鈕狀態檢查:')
            console.log('🔘 subscriptionStatus:', subscriptionStatus)
            console.log(
              '🔘 subscriptionStatus?.data:',
              subscriptionStatus?.data
            )
            console.log('🔘 isActive:', subscriptionStatus?.data?.isActive)
            console.log('🔘 isCurrent:', subscriptionStatus?.data?.isCurrent)
            console.log('🔘 loading:', loading)
            return null
          })()}
          <button
            type="submit"
            className={`pay-button ${
              subscriptionStatus?.data?.isCurrent === true ? 'paid' : ''
            }`}
            disabled={
              loading ||
              (subscriptionStatus?.data?.isActive &&
                subscriptionStatus?.data?.isCurrent)
            }
          >
            {loading
              ? '處理中...'
              : subscriptionStatus?.data?.isActive &&
                  subscriptionStatus?.data?.isCurrent
                ? '✅ 已付款'
                : '開始訂閱並付款'}
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
