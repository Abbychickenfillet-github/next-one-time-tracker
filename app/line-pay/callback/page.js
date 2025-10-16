'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from '@/lib/line-pay-axios'
import CssLoader from '@/components/css-loader'
import styles from './PaymentResult.module.css'

// 訂閱狀態的初始結構
const initSubscriptionStatus = {
  isActive: false,
  isCurrent: false,
  orderId: '',
  paidAt: null,
  dueAt: null,
  daysLeft: 0,
  amount: 0,
  currency: 'TWD',
  message: '',
}

function PaymentResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuth } = useAuth()

  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState({
    returnCode: '',
    returnMessage: '',
  })
  const [subscriptionStatus, setSubscriptionStatus] = useState(
    initSubscriptionStatus
  )
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  const [hasProcessedPayment, setHasProcessedPayment] = useState(false)

  // 獲取用戶訂閱狀態
  const fetchSubscriptionStatus = useCallback(async () => {
    if (!isAuth) {
      setSubscriptionLoading(false)
      return
    }

    console.log('🚀 開始獲取訂閱狀態...')
    try {
      const response = await axios.get('/user/subscription-status')
      const result = response.data
      console.log('✅ 訂閱狀態 API 回應:', result)

      if (result.status === 'success') {
        setSubscriptionStatus(result.data)
      } else {
        console.error('❌ 獲取訂閱狀態失敗:', result.message)
        setSubscriptionStatus(initSubscriptionStatus)
      }
    } catch (error) {
      console.error('❌ 獲取訂閱狀態失敗:', error)
      setSubscriptionStatus(initSubscriptionStatus)
    } finally {
      setSubscriptionLoading(false)
    }
  }, [isAuth])

  // 智能判斷付款狀態（基於訂閱狀態）
  const determinePaymentStatus = useCallback(
    (orderId) => {
      console.log('🔍 智能判斷付款狀態...')
      console.log('📋 訂閱狀態:', subscriptionStatus)
      console.log('🆔 當前訂單ID:', orderId)

      // 如果用戶有有效訂閱，無論訂單ID是否匹配，都認為付款成功
      if (subscriptionStatus.isActive) {
        console.log('✅ 基於訂閱狀態判斷：付款成功（用戶有有效訂閱）')
        return {
          status: 'success',
          message: `付款成功！訂單編號: ${subscriptionStatus.orderId || orderId}`,
          result: {
            returnCode: '0000',
            returnMessage: '付款確認成功',
          },
        }
      }

      // 如果用戶沒有有效訂閱，則認為付款失敗或未完成
      if (!subscriptionStatus.isActive && !subscriptionLoading) {
        console.log('❌ 基於訂閱狀態判斷：付款失敗或未完成')
        return {
          status: 'error',
          message: '付款未完成或已失敗',
          result: {
            returnCode: '9999',
            returnMessage: '付款狀態異常',
          },
        }
      }

      // 其他情況，保持載入狀態
      return {
        status: 'loading',
        message: '正在確認付款狀態...',
        result: {
          returnCode: '',
          returnMessage: '',
        },
      }
    },
    [subscriptionStatus, subscriptionLoading]
  )

  // 確認交易，處理伺服器通知line pay已確認付款，為必要流程
  const handleConfirm = useCallback(
    async (transactionId) => {
      try {
        const response = await axios.get('/payment/line-pay/confirm', {
          params: { transactionId },
        })
        const resData = response.data
        console.log('Payment confirm response:', resData)

        if (resData.status === 'success') {
          // 呈現結果 - 修正資料結構問題
          const resultData = resData.payload || resData.data
          setResult(resultData)
          setStatus('success')
          setMessage(`付款成功！訂單編號: ${searchParams.get('orderId')}`)
          // 顯示成功訊息
          toast.success('付款成功')
        } else {
          setStatus('error')
          setMessage('付款過程中發生錯誤')
          toast.error('付款失敗')
        }
      } catch (error) {
        console.error('Payment confirm error:', error)
        setStatus('error')
        setMessage('付款確認過程中發生錯誤')
        toast.error('付款確認失敗')
      }
    },
    [searchParams]
  )

  // 主要邏輯：處理付款結果
  useEffect(() => {
    const transactionId = searchParams.get('transactionId')
    const orderId = searchParams.get('orderId')

    console.log('🔄 頁面載入，檢查參數:', { transactionId, orderId })

    if (transactionId && orderId) {
      // 有交易ID和訂單ID的情況
      if (!hasProcessedPayment) {
        // 第一次處理，向server發送確認交易api
        console.log('🚀 第一次處理付款確認...')
        setStatus('loading')
        setMessage('正在確認付款...')
        setHasProcessedPayment(true)
        handleConfirm(transactionId)
      } else {
        // 已經處理過（可能是重新整理），使用智能判斷
        console.log('🔄 重新整理後，使用智能判斷...')
        if (!subscriptionLoading) {
          const paymentStatus = determinePaymentStatus(orderId)
          setStatus(paymentStatus.status)
          setMessage(paymentStatus.message)
          setResult(paymentStatus.result)
        }
      }
    } else {
      // 沒有交易ID或訂單ID的情況
      const error = searchParams.get('error')
      if (error) {
        setStatus('error')
        setMessage('付款過程中發生錯誤')
      } else {
        setStatus('cancel')
        setMessage('付款已取消')
      }
    }
  }, [
    searchParams,
    handleConfirm,
    hasProcessedPayment,
    subscriptionLoading,
    determinePaymentStatus,
  ])

  // 獲取訂閱狀態
  useEffect(() => {
    fetchSubscriptionStatus()
  }, [fetchSubscriptionStatus])

  // 當訂閱狀態更新時，重新判斷付款狀態
  useEffect(() => {
    const orderId = searchParams.get('orderId')
    if (orderId && hasProcessedPayment && !subscriptionLoading) {
      console.log('📊 訂閱狀態更新，重新判斷付款狀態...')
      const paymentStatus = determinePaymentStatus(orderId)
      setStatus(paymentStatus.status)
      setMessage(paymentStatus.message)
      setResult(paymentStatus.result)
    }
  }, [
    subscriptionStatus,
    searchParams,
    hasProcessedPayment,
    subscriptionLoading,
    determinePaymentStatus,
  ])

  const handleBackToHome = () => {
    router.push('/subscription')
  }

  if (status === 'loading') {
    return (
      <>
        <CssLoader />
        <div className={styles.loadingMessage}>載入中，請稍後...</div>
        <ToastContainer />
      </>
    )
  }

  return (
    <div className={styles.paymentResultPage}>
      <div className={styles.resultContainer}>
        <div className={`${styles.resultIcon} ${styles[status]}`}>
          {status === 'success' && '✓'}
          {status === 'error' && '✗'}
          {status === 'cancel' && '○'}
          {status === 'loading' && '⟳'}
        </div>

        <h1 className={`${styles.resultTitle} ${styles[status]}`}>
          {status === 'success' && '付款成功'}
          {status === 'error' && '付款失敗'}
          {status === 'cancel' && '付款取消'}
          {status === 'loading' && '處理中...'}
        </h1>

        <p className={styles.resultMessage}>{message}</p>

        {/* 顯示詳細的付款結果 */}
        {result.returnCode && (
          <div className={styles.paymentDetails}>
            <h3>付款詳細資訊</h3>
            <p>
              <strong>返回代碼:</strong> {result.returnCode}
            </p>
            <p>
              <strong>返回訊息:</strong> {result.returnMessage}
            </p>
            {result.returnCode === '0000' && (
              <p className={styles.successNote}>✓ 付款確認成功</p>
            )}
          </div>
        )}

        {/* 顯示登入狀態 */}
        <div className={styles.authStatus}>
          <p>會員登入狀態: {isAuth ? '已登入' : '未登入'}</p>
          {!isAuth && (
            <Link href="/user" className={styles.loginLink}>
              前往會員登入頁
            </Link>
          )}
        </div>

        {/* 顯示訂閱狀態 */}
        {isAuth && (
          <div className={styles.subscriptionStatus}>
            <h3>訂閱狀態</h3>
            {subscriptionLoading ? (
              <p>載入中...</p>
            ) : (
              <div>
                <p>
                  <strong>訂閱狀態:</strong>{' '}
                  <span
                    className={
                      subscriptionStatus.isActive
                        ? styles.active
                        : styles.inactive
                    }
                  >
                    {subscriptionStatus.isActive
                      ? '✅ 有效訂閱'
                      : '❌ 無效訂閱'}
                  </span>
                </p>
                {subscriptionStatus.isActive && (
                  <>
                    <p>
                      <strong>訂單編號:</strong> {subscriptionStatus.orderId}
                    </p>
                    <p>
                      <strong>付款時間:</strong>{' '}
                      {subscriptionStatus.paidAt
                        ? new Date(subscriptionStatus.paidAt).toLocaleString(
                            'zh-TW'
                          )
                        : '未知'}
                    </p>
                    <p>
                      <strong>到期時間:</strong>{' '}
                      {subscriptionStatus.dueAt
                        ? new Date(subscriptionStatus.dueAt).toLocaleString(
                            'zh-TW'
                          )
                        : '未知'}
                    </p>
                    <p>
                      <strong>剩餘天數:</strong>{' '}
                      <span
                        className={
                          subscriptionStatus.daysLeft > 7
                            ? styles.good
                            : styles.warning
                        }
                      >
                        {subscriptionStatus.daysLeft} 天
                      </span>
                    </p>
                    <p>
                      <strong>訂閱金額:</strong> {subscriptionStatus.amount}{' '}
                      {subscriptionStatus.currency}
                    </p>
                  </>
                )}
                {subscriptionStatus.message && (
                  <p className={styles.subscriptionMessage}>
                    {subscriptionStatus.message}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 只有在付款失敗時才顯示重試按鈕 */}
        {status === 'error' && (
          <div className={styles.resultActions}>
            <button onClick={handleBackToHome} className={styles.backButton}>
              重試訂閱
            </button>
          </div>
        )}
      </div>

      {/* 土司訊息視窗用 */}
      <ToastContainer />
    </div>
  )
}

export default function PaymentResult() {
  return (
    <Suspense fallback={<CssLoader />}>
      <PaymentResultContent />
    </Suspense>
  )
}
