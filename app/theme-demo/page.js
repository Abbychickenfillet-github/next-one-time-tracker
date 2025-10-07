'use client'
import React, { useState, useEffect } from 'react'
import Head from 'next/head'

export default function ThemeDemo() {
  const [systemTheme, setSystemTheme] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  // 檢測系統主題
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // 更新時間
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <Head>
        <title>純 CSS 主題切換測試</title>
      </Head>

      <div className="theme-demo-container">
        {/* 頂部資訊欄 */}
        <div className="info-bar">
          <div className="info-item">
            <span className="label">系統主題：</span>
            <span className="value theme-indicator">
              {systemTheme === 'dark' ? '🌙 深色' : '☀️ 亮色'}
            </span>
          </div>
          <div className="info-item">
            <span className="label">當前時間：</span>
            <span className="value">
              {currentTime.toLocaleTimeString('zh-TW')}
            </span>
          </div>
        </div>

        {/* 主要內容區域 */}
        <div className="main-content">
          <h1 className="title">純 CSS 自動主題切換測試</h1>

          <div className="description">
            <p>
              這個頁面使用純 CSS 的 <code>@media (prefers-color-scheme)</code>{' '}
              來自動跟隨系統主題設定。
            </p>
            <p>請嘗試切換你的系統主題設定來查看效果：</p>
            <ul>
              <li>
                <strong>Windows:</strong> 設定 → 個人化 → 色彩 → 選擇你的模式
              </li>
              <li>
                <strong>macOS:</strong> 系統偏好設定 → 一般 → 外觀
              </li>
              <li>
                <strong>手機:</strong> 設定 → 顯示與亮度 → 外觀
              </li>
            </ul>
          </div>

          {/* 卡片展示區域 */}
          <div className="cards-grid">
            <div className="demo-card">
              <h3>📊 統計卡片</h3>
              <div className="stats">
                <div className="stat-item">
                  <span className="stat-number">1,234</span>
                  <span className="stat-label">總用戶</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">5,678</span>
                  <span className="stat-label">總訂單</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">90%</span>
                  <span className="stat-label">滿意度</span>
                </div>
              </div>
            </div>

            <div className="demo-card">
              <h3>🎨 色彩展示</h3>
              <div className="color-palette">
                <div className="color-item primary">主要色彩</div>
                <div className="color-item secondary">次要色彩</div>
                <div className="color-item accent">強調色彩</div>
                <div className="color-item success">成功色彩</div>
                <div className="color-item warning">警告色彩</div>
                <div className="color-item danger">危險色彩</div>
              </div>
            </div>

            <div className="demo-card">
              <h3>📝 表單元素</h3>
              <div className="form-demo">
                <input
                  type="text"
                  placeholder="輸入文字..."
                  className="demo-input"
                />
                <select className="demo-select">
                  <option>選項 1</option>
                  <option>選項 2</option>
                  <option>選項 3</option>
                </select>
                <button className="demo-button primary">主要按鈕</button>
                <button className="demo-button secondary">次要按鈕</button>
              </div>
            </div>

            <div className="demo-card">
              <h3>🔔 通知區域</h3>
              <div className="notifications">
                <div className="notification success">✅ 操作成功完成</div>
                <div className="notification warning">⚠️ 請注意這個警告</div>
                <div className="notification error">❌ 發生了一個錯誤</div>
                <div className="notification info">ℹ️ 這是一個資訊提示</div>
              </div>
            </div>
          </div>

          {/* 比較區域 */}
          <div className="comparison-section">
            <h2>與 Next.js 主題切換的差異</h2>
            <div className="comparison-grid">
              <div className="comparison-card">
                <h3>🌐 純 CSS 自動切換</h3>
                <div className="pros-cons">
                  <div className="pros">
                    <h4>✅ 優點</h4>
                    <ul>
                      <li>自動跟隨系統設定</li>
                      <li>無需 JavaScript</li>
                      <li>性能更好</li>
                      <li>實現簡單</li>
                    </ul>
                  </div>
                  <div className="cons">
                    <h4>❌ 缺點</h4>
                    <ul>
                      <li>無法手動控制</li>
                      <li>用戶無法覆蓋系統設定</li>
                      <li>功能較為有限</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="comparison-card">
                <h3>⚙️ Next.js 手動切換</h3>
                <div className="pros-cons">
                  <div className="pros">
                    <h4>✅ 優點</h4>
                    <ul>
                      <li>用戶可以手動控制</li>
                      <li>可以覆蓋系統設定</li>
                      <li>功能更豐富</li>
                      <li>更好的用戶體驗</li>
                    </ul>
                  </div>
                  <div className="cons">
                    <h4>❌ 缺點</h4>
                    <ul>
                      <li>需要 JavaScript</li>
                      <li>實現較複雜</li>
                      <li>需要額外的狀態管理</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .theme-demo-container {
          min-height: 100vh;
          padding: 20px;
          font-family:
            -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          transition: all 0.3s ease;
        }

        .info-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-radius: 10px;
          margin-bottom: 30px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .label {
          font-weight: 600;
          opacity: 0.8;
        }

        .value {
          font-weight: 700;
          padding: 5px 10px;
          border-radius: 5px;
          background: rgba(0, 0, 0, 0.1);
        }

        .theme-indicator {
          font-size: 1.1em;
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .title {
          text-align: center;
          margin-bottom: 30px;
          font-size: 2.5em;
          font-weight: 700;
        }

        .description {
          background: rgba(0, 0, 0, 0.05);
          padding: 25px;
          border-radius: 15px;
          margin-bottom: 40px;
          line-height: 1.6;
        }

        .description code {
          background: rgba(0, 0, 0, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 25px;
          margin-bottom: 50px;
        }

        .demo-card {
          padding: 25px;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }

        .demo-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .demo-card h3 {
          margin: 0 0 20px 0;
          font-size: 1.3em;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .stat-item {
          text-align: center;
          padding: 15px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.05);
        }

        .stat-number {
          display: block;
          font-size: 1.8em;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 0.9em;
          opacity: 0.8;
        }

        .color-palette {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .color-item {
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          color: white;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .primary {
          background: #007bff;
        }
        .secondary {
          background: #6c757d;
        }
        .accent {
          background: #28a745;
        }
        .success {
          background: #20c997;
        }
        .warning {
          background: #ffc107;
          color: #000;
          text-shadow: none;
        }
        .danger {
          background: #dc3545;
        }

        .form-demo {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .demo-input,
        .demo-select {
          padding: 12px;
          border-radius: 8px;
          border: 2px solid rgba(0, 0, 0, 0.1);
          font-size: 1em;
          transition: border-color 0.3s ease;
        }

        .demo-input:focus,
        .demo-select:focus {
          outline: none;
          border-color: #007bff;
        }

        .demo-button {
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 1em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .demo-button.primary {
          background: #007bff;
          color: white;
        }

        .demo-button.secondary {
          background: rgba(0, 0, 0, 0.1);
        }

        .demo-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .notifications {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .notification {
          padding: 15px;
          border-radius: 8px;
          font-weight: 600;
        }

        .notification.success {
          background: rgba(40, 167, 69, 0.1);
        }
        .notification.warning {
          background: rgba(255, 193, 7, 0.1);
        }
        .notification.error {
          background: rgba(220, 53, 69, 0.1);
        }
        .notification.info {
          background: rgba(23, 162, 184, 0.1);
        }

        .comparison-section {
          margin-top: 50px;
        }

        .comparison-section h2 {
          text-align: center;
          margin-bottom: 30px;
          font-size: 2em;
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 30px;
        }

        .comparison-card {
          padding: 30px;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .comparison-card h3 {
          text-align: center;
          margin-bottom: 25px;
          font-size: 1.5em;
        }

        .pros-cons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .pros h4,
        .cons h4 {
          margin: 0 0 15px 0;
          font-size: 1.1em;
        }

        .pros ul,
        .cons ul {
          margin: 0;
          padding-left: 20px;
        }

        .pros li,
        .cons li {
          margin-bottom: 8px;
          line-height: 1.4;
        }

        /* 亮色主題 */
        @media (prefers-color-scheme: light) {
          .theme-demo-container {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            color: #333;
          }

          .info-bar {
            background: rgba(255, 255, 255, 0.9);
            color: #333;
          }

          .demo-card {
            background: rgba(255, 255, 255, 0.95);
            color: #333;
          }

          .description {
            background: rgba(255, 255, 255, 0.8);
            color: #333;
          }

          .comparison-card {
            background: rgba(255, 255, 255, 0.95);
            color: #333;
          }
        }

        /* 深色主題 */
        @media (prefers-color-scheme: dark) {
          .theme-demo-container {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: #ecf0f1;
          }

          .info-bar {
            background: rgba(44, 62, 80, 0.9);
            color: #ecf0f1;
          }

          .demo-card {
            background: rgba(52, 73, 94, 0.95);
            color: #ecf0f1;
          }

          .description {
            background: rgba(44, 62, 80, 0.8);
            color: #ecf0f1;
          }

          .comparison-card {
            background: rgba(52, 73, 94, 0.95);
            color: #ecf0f1;
          }

          .demo-input,
          .demo-select {
            background: rgba(44, 62, 80, 0.8);
            color: #ecf0f1;
            border-color: rgba(236, 240, 241, 0.3);
          }

          .demo-button.secondary {
            background: rgba(236, 240, 241, 0.1);
            color: #ecf0f1;
          }
        }
      `}</style>
    </>
  )
}
