'use client'

import { useState, useEffect } from 'react'

/**
 * 訂單摘要組件 - 顯示訂單基本資訊和登入狀態
 * @param {Object} props
 * @param {Object} props.authInfo - 認證資訊
 * @param {boolean} props.authInfo.isAuth - 是否已登入
 * @param {Object} props.authInfo.user - 用戶資訊
 * @param {string} props.className - 額外的 CSS 類別名稱
 */
export default function OrderSummary({ authInfo, className = '' }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  const { isAuth, user } = authInfo

  // 更新時間顯示（每分鐘更新一次）
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // 每分鐘更新

    return () => clearInterval(timer)
  }, [])

  return (
    <div className={`order-summary ${className}`}>
      <div className="auth-status">
        <h3>登入狀態</h3>
        <div
          className={`status-indicator ${isAuth ? 'logged-in' : 'logged-out'}`}
        >
          <div className="status-dot"></div>
          <span>{isAuth ? `已登入 - ${user?.name || '用戶'}` : '未登入'}</span>
        </div>

        {!isAuth && <div className="login-prompt">請先登入以使用付款功能</div>}
      </div>

      <div className="order-info">
        <h3>訂單資訊</h3>
        <div className="info-item">
          <span className="label">建立時間:</span>
          <span className="value">
            {currentTime.toLocaleString('zh-TW', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <div className="info-item">
          <span className="label">付款方式:</span>
          <span className="value">LINE Pay</span>
        </div>
      </div>
    </div>
  )
}

