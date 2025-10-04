'use client'

export default function DebugConfig() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔧 配置调试页面</h1>

      <div
        style={{
          margin: '20px 0',
          padding: '20px',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
        }}
      >
        <h3>环境信息</h3>
        <ul>
          <li>
            当前URL:{' '}
            {typeof window !== 'undefined' ? window.location.href : 'N/A'}
          </li>
          <li>
            协议:{' '}
            {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}
          </li>
          <li>
            端口: {typeof window !== 'undefined' ? window.location.port : 'N/A'}
          </li>
        </ul>
      </div>

      <button
        onClick={() => testConfigAPI()}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        测试配置API
      </button>

      <div
        id="configResult"
        style={{
          margin: '20px 0',
          padding: '20px',
          backgroundColor: '#fff',
          border: '1px solid #ddd',
        }}
      ></div>
    </div>
  )
}

async function testConfigAPI() {
  const resultDiv = document.getElementById('configResult')

  try {
    console.log('🧪 测试配置API...')

    const response = await fetch('/api/debug/config', {
      method: 'GET',
      credentials: 'include',
    })

    const data = await response.json()

    console.log('🧪 配置API响应:', data)

    resultDiv.innerHTML = `
      <h4>配置API测试结果:</h4>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    `
  } catch (error) {
    console.error('❌ 配置API测试失败:', error)
    resultDiv.innerHTML = `
      <h4 style="color: red;">配置API测试失败:</h4>
      <p>${error.message}</p>
    `
  }
}
