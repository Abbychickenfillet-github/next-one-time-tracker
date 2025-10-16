'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from '@/lib/line-pay-axios'
import styles from '@/styles/subscription.module.scss'

export default function SubscriptionPage() {
  const { isAuth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [redirecting, setRedirecting] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState('')

  // 訂閱狀態相關
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)

  // 訂閱方案設定
  const subscriptionPlans = {
    monthly: {
      name: '月費方案',
      price: 99,
      duration: '1個月',
      description: '已付費用戶',
      features: [
        '✅ 解鎖多裝置同步',
        '✅ 無限制記錄數量 (最多50筆)',
        '✅ 雲端資料庫儲存',
        '✅ 資料永久保存',
        '✅ 基礎統計分析',
        '📱 手機、平板、電腦同步',
        '🚦 每小時100次 API 呼叫',
        '🚦 每天500次資料庫查詢',
      ],
    },
  }

  const selectedPlanData = subscriptionPlans[selectedPlan]

  // 獲取用戶訂閱狀態
  const fetchSubscriptionStatus = useCallback(async () => {
    if (!isAuth) {
      setSubscriptionLoading(false)
      return
    }

    console.log('🚀 開始獲取訂閱狀態...')
    try {
      // 使用原生 fetch 避免瀏覽器擴充功能干擾
      const response = await fetch('/api/user/subscription-status', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ 訂閱狀態 API 回應:', result)
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
      setSubscriptionLoading(false)
    }
  }, [isAuth])

  // 組件載入時獲取訂閱狀態
  useEffect(() => {
    fetchSubscriptionStatus()
  }, [isAuth, fetchSubscriptionStatus])

  // 處理訂閱付款
  const handleSubscribe = async () => {
    if (!isAuth) {
      toast.error('請先登入才能訂閱')
      return
    }

    if (!selectedPlanData) {
      toast.error('請選擇訂閱方案')
      return
    }

    setLoading(true)
    try {
      const orderId = `SUB-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`

      const paymentData = {
        amount: selectedPlanData.price,
        orderId: orderId,
        currency: 'TWD',
        packages: [
          {
            id: 'subscription',
            amount: selectedPlanData.price,
            name: selectedPlanData.name,
            products: [
              {
                name: `訂閱服務 - ${selectedPlanData.name}`,
                price: selectedPlanData.price,
              },
            ],
          },
        ],
      }

      const response = await axios.post(
        '/payment/line-pay/request',
        paymentData
      )

      const data = response.data

      if (
        data.status === 'success' &&
        (data.payload?.paymentUrl || data.data?.paymentUrl)
      ) {
        // 顯示跳轉狀態
        const paymentUrl = data.payload?.paymentUrl || data.data?.paymentUrl
        setRedirecting(true)
        setPaymentUrl(paymentUrl)
        toast.success('付款請求成功，正在跳轉到 LINE Pay...')

        // 延遲跳轉，讓用戶看到成功訊息
        setTimeout(() => {
          window.location.href = paymentUrl
        }, 1000)
      } else {
        throw new Error(data.message || '付款請求失敗')
      }
    } catch (error) {
      console.error('❌ 訂閱付款失敗:', error)
      console.error('❌ 錯誤詳情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      })
      toast.error(error.message || '付款處理失敗，請稍後再試')
    } finally {
      // finally確保無論成功或失敗，資料庫連線都會被正確關閉，避免記憶體洩漏與連線池耗盡
      setLoading(false)
    }
  }

  return (
    <div className={styles.subscriptionPage}>
      <div className={styles.subscriptionContainer}>
        <header className={styles.pageHeader}>
          <h1>訂閱服務</h1>
          <p className={styles.subscriptionDescription}>
            選擇您的訂閱方案，享受專業的時間管理服務
          </p>
        </header>

        {!isAuth && (
          <div className={styles.authRequired}>
            <p>請先登入才能訂閱服務</p>
            <Link href="/user/login" className={styles.loginLink}>
              前往登入
            </Link>
          </div>
        )}

        {/* 訂閱狀態顯示 */}
        {isAuth && (
          <div className={styles.subscriptionStatus}>
            {subscriptionLoading ? (
              <div className={styles.statusLoading}>
                <p>載入訂閱狀態中...</p>
              </div>
            ) : subscriptionStatus?.data?.isActive ? (
              <div className={styles.statusCard}>
                <div className={styles.statusHeader}>
                  <h3>📋 訂閱狀態</h3>
                  <span className={`${styles.statusBadge} ${styles.active}`}>
                    ✅ 已訂閱
                  </span>
                </div>
                <div className={styles.statusDetails}>
                  <div className={styles.statusItem}>
                    <span className={styles.label}>訂單編號:</span>
                    <span className={styles.value}>
                      {subscriptionStatus.data.orderId}
                    </span>
                  </div>
                  <div className={styles.statusItem}>
                    <span className={styles.label}>付款時間:</span>
                    <span className={styles.value}>
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
                  <div className={styles.statusItem}>
                    <span className={styles.label}>到期時間:</span>
                    <span className={styles.value}>
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
                  <div className={styles.statusItem}>
                    <span className={styles.label}>剩餘天數:</span>
                    <span className={styles.value}>
                      {subscriptionStatus.data.daysLeft > 0
                        ? `${subscriptionStatus.data.daysLeft} 天`
                        : '已過期'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.statusCard}>
                <div className={styles.statusHeader}>
                  <h3>📋 訂閱狀態</h3>
                  <span className={`${styles.statusBadge} ${styles.inactive}`}>
                    ❌ 尚未訂閱
                  </span>
                </div>
                <p className={styles.statusMessage}>
                  您尚未訂閱任何方案，請選擇下方方案開始訂閱。
                </p>
              </div>
            )}
          </div>
        )}

        <div className={styles.subscriptionPlans}>
          {Object.entries(subscriptionPlans).map(([key, plan]) => (
            <div
              key={key}
              className={`${styles.planCard} ${selectedPlan === key ? styles.selected : ''}`}
              onClick={() => setSelectedPlan(key)}
              // 新增鍵盤事件處理器以符合無障礙性要求
              // 支援 Enter 鍵和空白鍵操作，讓使用鍵盤導航的使用者也能選擇方案
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelectedPlan(key)
                }
              }}
              role="button" // 告訴輔助技術這是按鈕
              tabIndex={0} // 允許鍵盤聚焦
            >
              <div className={styles.planHeader}>
                <h3>{plan.name}</h3>
                <div className={styles.planPrice}>
                  <span className={styles.price}>NT${plan.price}</span>
                  <span className={styles.duration}>/{plan.duration}</span>
                </div>
                {plan.description && (
                  <p className={styles.planSavings}>{plan.description}</p>
                )}
              </div>

              <div className={styles.planFeatures}>
                <ul>
                  {plan.features.map((feature, index) => (
                    <li key={index}>✓ {feature}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.planAction}>
                <button
                  className={`${styles.selectPlanBtn} ${selectedPlan === key ? styles.selected : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedPlan(key)
                  }}
                >
                  {selectedPlan === key ? '已選擇' : '選擇方案'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedPlanData && (
          <div className={styles.selectedPlanSummary}>
            <h3>選擇的方案</h3>
            <div className={styles.summaryContent}>
              <div className={styles.planInfo}>
                <h4>{selectedPlanData.name}</h4>
                <p className={styles.planDuration}>
                  {selectedPlanData.duration}
                </p>
              </div>
              <div className={styles.planPrice}>
                <span className={styles.totalPrice}>
                  NT${selectedPlanData.price}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.paymentSection}>
          <button
            className={`${styles.subscribeBtn} ${
              subscriptionStatus?.data?.isActive &&
              subscriptionStatus?.data?.isCurrent
                ? styles.paid
                : ''
            }`}
            onClick={handleSubscribe}
            disabled={
              loading ||
              redirecting ||
              !isAuth ||
              !selectedPlanData ||
              (subscriptionStatus?.data?.isActive &&
                subscriptionStatus?.data?.isCurrent)
            }
            // 只要有一個條件為true，整個表達式就是true。會造成按鈕無法點擊
          >
            {loading
              ? '處理中...'
              : redirecting
                ? '正在跳轉...'
                : subscriptionStatus?.data?.isActive &&
                    subscriptionStatus?.data?.isCurrent
                  ? '✅ 已付款'
                  : '開始訂閱並付款'}
          </button>

          {redirecting && (
            <div className={styles.redirectInfo}>
              <p>✅ 付款請求成功！正在跳轉到 LINE Pay...</p>
              <p>如果沒有自動跳轉，請點擊下方按鈕：</p>
              <button
                className={styles.manualRedirectBtn}
                onClick={() => window.open(paymentUrl, '_blank')}
              >
                手動開啟 LINE Pay 付款頁面
              </button>
            </div>
          )}

          <p className={styles.paymentNote}>
            使用 LINE Pay 安全付款，支援信用卡、銀行帳戶等多種付款方式
          </p>
        </div>
      </div>

      <ToastContainer />
    </div>
  )
}
