'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from '@/lib/line-pay-axios'
import CssLoader from '@/components/css-loader'
import styles from './PaymentResult.module.css'

export default function PaymentResult() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isAuth } = useAuth()

  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState({
    returnCode: '',
    returnMessage: '',
  })

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

  useEffect(() => {
    const transactionId = searchParams.get('transactionId')
    const orderId = searchParams.get('orderId')

    if (transactionId && orderId) {
      // Success case - user was redirected back from LINE Pay
      setStatus('loading')
      setMessage('正在確認付款...')
      // 向server發送確認交易api
      handleConfirm(transactionId)
    } else {
      // Check if this is a cancel or error
      const error = searchParams.get('error')
      if (error) {
        setStatus('error')
        setMessage('付款過程中發生錯誤')
      } else {
        setStatus('cancel')
        setMessage('付款已取消')
      }
    }
  }, [searchParams, handleConfirm])

  const handleBackToHome = () => {
    router.push('/')
  }

  const handleNewPayment = () => {
    router.push('/line-pay')
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

        <div className={styles.resultActions}>
          <button onClick={handleBackToHome} className={styles.backButton}>
            返回首頁
          </button>
          <button
            onClick={handleNewPayment}
            className={styles.newPaymentButton}
          >
            新的付款
          </button>
        </div>
      </div>

      {/* 土司訊息視窗用 */}
      <ToastContainer />
    </div>
  )
}
