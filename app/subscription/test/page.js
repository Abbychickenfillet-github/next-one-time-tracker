'use client'

import { useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from '@/lib/line-pay-axios'

export default function SubscriptionTestPage() {
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const testLinePayConnection = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      const response = await axios.get('/api/payment/line-pay/request', {
        params: { amount: 100 },
      })
      const data = response.data
      setTestResult(data)

      if (data.status === 'success') {
        toast.success('LINE Pay 連接測試成功！')
      } else {
        toast.error(`LINE Pay 連接測試失敗: ${data.message}`)
      }
    } catch (error) {
      console.error('測試失敗:', error)
      setTestResult({ error: error.message })
      toast.error('測試失敗: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testSubscriptionPayment = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      const paymentData = {
        amount: 299,
        orderId: `TEST-${Date.now()}`,
        currency: 'TWD',
        packages: [
          {
            id: 'subscription',
            amount: 299,
            name: '月費方案',
            products: [
              {
                name: '訂閱服務 - 月費方案',
                quantity: 1,
                price: 299,
              },
            ],
          },
        ],
      }

      const response = await axios.post(
        '/api/payment/line-pay/request',
        paymentData
      )
      const data = response.data
      setTestResult(data)

      if (data.status === 'success') {
        toast.success('訂閱付款測試成功！')
        // 可以選擇是否自動跳轉到 LINE Pay
        // window.location.href = data.payload.paymentUrl
      } else {
        toast.error(`訂閱付款測試失敗: ${data.message}`)
      }
    } catch (error) {
      console.error('測試失敗:', error)
      setTestResult({ error: error.message })
      toast.error('測試失敗: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>LINE Pay 訂閱服務測試</h1>

      <div style={{ marginBottom: '2rem' }}>
        <h2>環境變數檢查</h2>
        <div
          style={{
            background: '#f5f5f5',
            padding: '1rem',
            borderRadius: '8px',
          }}
        >
          <p>
            <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
          </p>
          <p>
            <strong>LINE_PAY_CHANNEL_ID:</strong>{' '}
            {process.env.LINE_PAY_CHANNEL_ID || '未設定 (僅在客戶端顯示)'}
          </p>
          <p>
            <strong>注意:</strong>{' '}
            環境變數在客戶端無法直接讀取，需要在伺服器端檢查
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>測試功能</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={testLinePayConnection}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '測試中...' : '測試 LINE Pay 連接 (GET)'}
          </button>

          <button
            onClick={testSubscriptionPayment}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '測試中...' : '測試訂閱付款 (POST)'}
          </button>
        </div>
      </div>

      {testResult && (
        <div style={{ marginBottom: '2rem' }}>
          <h2>測試結果</h2>
          <div
            style={{
              background: '#f8f9fa',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
            }}
          >
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h2>說明</h2>
        <ul>
          <li>
            <strong>GET 測試:</strong> 測試基本的 LINE Pay API 連接
          </li>
          <li>
            <strong>POST 測試:</strong> 測試訂閱服務的付款流程
          </li>
          <li>如果測試成功，會顯示付款 URL，可以手動訪問進行完整測試</li>
          <li>如果失敗，請檢查環境變數和伺服器端設定</li>
        </ul>
      </div>

      <ToastContainer />
    </div>
  )
}
