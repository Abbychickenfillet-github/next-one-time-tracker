'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'
import '@/styles/LinePayPage.css'
import axios from '@/lib/line-pay-axios'

export default function DebugLinePay() {
  const [isLoading, setIsLoading] = useState(false)
  const [testAmount, setTestAmount] = useState(100)

  const testLinePay = async () => {
    setIsLoading(true)

    try {
      console.log('🧪 [DEBUG] 开始测试 Line Pay v3...')

      const response = await axios.post('/debug/linepay-test', {
        amount: testAmount,
      })
      const data = response.data

      console.log('🧪 [DEBUG] Line Pay 测试响应:', data)

      if (data.success) {
        toast.success('Line Pay 测试成功!')
        console.log('✅ Line Pay 测试成功:', data.data)
      } else {
        toast.error(`Line Pay 测试失败: ${data.error}`)
        console.error('❌ Line Pay 测试失败:', data.error)
      }
    } catch (error) {
      console.error('❌ Line Pay 测试异常:', error)
      toast.error(`测试异常: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testOriginalAPI = async () => {
    setIsLoading(true)

    try {
      console.log('🧪 [DEBUG] 测试原始 API...')

      const response = await axios.get('/payment/line-pay/request', {
        params: { amount: testAmount },
      })
      const data = response.data

      console.log('🧪 [DEBUG] 原始 API 响应:', data)

      if (data.status === 'success') {
        toast.success('原始 API 测试成功!')
        console.log('✅ 原始 API 测试成功:', data.data)
      } else {
        toast.error(`原始 API 测试失败: ${data.message}`)
        console.error('❌ 原始 API 测试失败:', data.message)
      }
    } catch (error) {
      console.error('❌ 原始 API 测试异常:', error)
      toast.error(`原始 API 测试异常: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1>🧪 Line Pay v3 调试页面</h1>

      <div
        style={{
          margin: '20px 0',
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
        }}
      >
        <h3>测试金额</h3>
        <input
          type="number"
          value={testAmount}
          onChange={(e) => setTestAmount(Number(e.target.value))}
          style={{
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '200px',
          }}
        />
      </div>

      <div style={{ margin: '20px 0' }}>
        <button
          onClick={testLinePay}
          disabled={isLoading}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            backgroundColor: '#00c300',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? '测试中...' : '🧪 测试调试API'}
        </button>

        <button
          onClick={testOriginalAPI}
          disabled={isLoading}
          style={{
            padding: '15px 30px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? '测试中...' : '🚀 测试原始API'}
        </button>
      </div>

      <div
        style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3>📋 使用说明</h3>
        <ul>
          <li>输入要测试的金额（默认100台币）</li>
          <li>点击&ldquo;测试调试API&rdquo;使用专门的调试端点</li>
          <li>点击&ldquo;测试原始API&rdquo;测试标准的付款API</li>
          <li>查看浏览器控制台的详细日志</li>
          <li>成功时应该看到Line Pay付款URL</li>
          <li>失败时会看到具体的错误信息</li>
        </ul>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#fffbe6',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
        }}
      >
        <h3>⚠️ 注意事项</h3>
        <ul>
          <li>
            确保已经设置了正确的LINE_PAY_CHANNEL_ID和LINE_PAY_CHANNEL_SECRET
          </li>
          <li>检查网络连接和防火墙设置</li>
          <li>确保在开发环境中使用sandbox模式</li>
          <li>查看服务器控制台的详细错误日志</li>
        </ul>
      </div>
    </div>
  )
}
