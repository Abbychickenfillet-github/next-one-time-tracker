'use client'
import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useLoader } from '@/hooks/use-loader'
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import Image from 'next/image'
import { Accordion, Col, Nav, Tab, Container } from 'react-bootstrap'
import TimeLogClient from '@/components/timelog/TimeLogClient'
import DashboardLapTimer from '@/components/timelog/DashboardLapTimer'
// Next.js 的 App Router production build 會把 bs-icon (CJS) 的預設匯出
// 雙層包裹成 { default: fn }，導致 `import Icon from 'bs-icon'` 拿到的是物件而非
// 元件，渲染 <Icon> 時丟出 React #130（dev 正常、部署後才崩）。取出真正的元件。
import IconImport from 'bs-icon'
const Icon = IconImport?.default || IconImport
import styles from '@/styles/dashboard.module.scss'
// ========================================
// 🔍 lazy() 空參數說明
// ========================================
// lazy(() => import(...)) 中的空參數 () 表示：
// - 不論有沒有任何參數傳入都會執行
// - 這是 React.lazy() 的標準寫法
// - 函數會在組件需要時才執行，實現延遲載入
const AvatarUpload = lazy(() => import('@/components/AvatarUpload'))
const AIAnalysisSection = lazy(
  () => import('@/components/ai-analysis/AIAnalysisSection')
)

export default function Dashboard() {
  const { auth, user, isAuth } = useAuth()
  const { showLoader, hideLoader } = useLoader()
  const router = useRouter()

  // 頁籤狀態
  const [activeKey, setActiveKey] = useState('timelog')
  const [subActiveKey, setSubActiveKey] = useState('timelog-client')

  // 時間記錄狀態
  const [timeLogs, setTimeLogs] = useState([])
  const [statistics, setStatistics] = useState({
    totalLogs: 0,
    totalDuration: 0,
    todayLogs: 0,
    weekLogs: 0,
    efficiency: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  // 追蹤已分享的時間記錄 ID
  const [sharedLogIds, setSharedLogIds] = useState(new Set())
  const [sharedShareMap, setSharedShareMap] = useState(new Map()) // timeLogId -> featuredShareId
  const [sharingLogId, setSharingLogId] = useState(null) // 正在分享的記錄ID

  // 定義不同頁籤對應的左側導航配置
  const sideNavConfigs = {
    timelog: [
      { key: 'timelog-client', label: '時間記錄工具' },
      { key: 'lap-timer', label: '分圈計時器' },
      { key: 'timelog-list', label: '時間記錄列表' },
      { key: 'ai-analysis', label: 'AI 分析' },
    ],
    profile: [
      { key: 'avatar-upload', label: '頭貼管理' },
      { key: 'user-info', label: '個人資訊' },
      { key: 'dev-info', label: '開發資訊' },
    ],
    favorite: [{ key: 'favorite-list', label: '我的最愛' }],
    history: [{ key: 'paid', label: '付款紀錄' }],
  }

  const getCurrentSideNav = () => {
    return sideNavConfigs[activeKey] || []
  }

  const handleSideNavClick = (key) => {
    setSubActiveKey(key)
  }

  const renderTimelog = (key) => {
    switch (key) {
      case 'timelog-client':
        return <TimeLogClient />
      case 'lap-timer':
        return <DashboardLapTimer />
      case 'timelog-list':
        return <TimeLogList />
      case 'ai-analysis':
        return (
          <Suspense
            fallback={
              <div className="text-center py-4">載入 AI 分析功能中...</div>
            }
          >
            <AIAnalysisSection />
          </Suspense>
        )
      default:
        return <TimeLogClient />
    }
  }

  const renderProfile = (key) => {
    switch (key) {
      case 'avatar-upload':
        return <AvatarUploadSection />
      case 'user-info':
        return <UserInfoSection />
      default:
        return <AvatarUploadSection />
    }
  }

  const renderFavorite = (key) => {
    switch (key) {
      case 'favorite-list':
        return <FavoriteListSection />
      default:
        return <FavoriteListSection />
    }
  }

  const renderHistory = (key) => {
    switch (key) {
      case 'paid':
        return <PaymentHistorySection />
      default:
        return <PaymentHistorySection />
    }
  }

  // 時間記錄列表組件
  const TimeLogList = () => (
    <div className={styles.card}>
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">📋 時間戳記錄</h5>
          <div className="btn-group">
            <button
              className="btn btn-outline-light btn-sm"
              onClick={fetchTimeLogs}
            >
              <i className="bi bi-arrow-clockwise"></i> 重新載入
            </button>
            <button className="btn btn-primary btn-sm">
              <i className="bi bi-plus"></i> 新增記錄
            </button>
          </div>
        </div>
      </div>
      <div className="card-body p-0">
        {error ? (
          <div className="text-center py-5">
            <div className="text-danger">
              <Icon className="exclamation-lg" />
              <p className="mt-3">載入失敗: {error}</p>
              <button
                className="btn btn-outline-danger"
                onClick={fetchTimeLogs}
              >
                <i className="bi bi-arrow-clockwise"></i> 重新載入
              </button>
            </div>
          </div>
        ) : timeLogs.length === 0 ? (
          <div className="text-center py-5">
            <div className="text-muted">
              <i className="bi bi-clock-history fs-1"></i>
              <p className="mt-3">尚無時間戳記錄</p>
              <p className="small">使用上方的時間記錄工具開始記錄您的活動</p>
            </div>
          </div>
        ) : (
          <Accordion className="border-0">
            {timeLogs.map((log, index) => (
              <Accordion.Item key={log.id} eventKey={index.toString()}>
                <Accordion.Header>
                  <div className="d-flex justify-content-between align-items-center w-100 me-3">
                    <div>
                      <h6 className="mb-0 fw-semibold">{log.title}</h6>
                      <small className="text-muted">{log.description}</small>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                      <span className="badge bg-info">
                        {log.duration ? `${log.duration} 小時` : '進行中'}
                      </span>
                      <span className="badge bg-secondary">
                        {log.steps?.length || 0} 步驟
                      </span>
                      {/* 分享圖標 - 只有當前用戶的時間記錄才顯示 */}
                      {isAuth && (
                        <span
                          role="button"
                          tabIndex={0}
                          className={`btn btn-link p-0 border-0 ${
                            log.id && sharedLogIds.has(log.id)
                              ? 'text-warning'
                              : 'text-muted'
                          }`}
                          style={{
                            fontSize: '1.2rem',
                            lineHeight: '1',
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShareTimeLog(log)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              e.stopPropagation()
                              handleShareTimeLog(log)
                            }
                          }}
                          title={
                            log.id && sharedLogIds.has(log.id)
                              ? '取消分享'
                              : '分享到精選分享'
                          }
                          aria-label={
                            log.id && sharedLogIds.has(log.id)
                              ? '取消分享'
                              : '分享到精選分享'
                          }
                        >
                          <Icon
                            name={
                              log.id && sharedLogIds.has(log.id)
                                ? 'bookmark-heart-fill'
                                : 'bookmark-heart'
                            }
                          />
                        </span>
                      )}
                    </div>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <div className="row">
                    <Col md={4}>
                      <h6>📅 時間資訊</h6>
                      <ul className="list-unstyled">
                        <li>
                          <strong>開始時間:</strong> {formatDate(log.startTime)}
                        </li>
                        <li>
                          <strong>結束時間:</strong> {formatDate(log.endTime)}
                        </li>
                        <li>
                          <strong>持續時間:</strong>
                          <span className="badge bg-info ms-2">
                            {log.duration ? `${log.duration} 小時` : '進行中'}
                          </span>
                        </li>
                      </ul>
                    </Col>
                    <Col md={8}>
                      <h6>📋 詳細步驟</h6>
                      {log.steps && log.steps.length > 0 ? (
                        <div className="list-group list-group-flush">
                          {log.steps.map((step, stepIndex) => (
                            <React.Fragment key={stepIndex}>
                              <div className="list-group-item px-0 py-2">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <strong>{step.title}</strong>
                                    {step.description && (
                                      <div className="small text-muted">
                                        {step.description}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-end">
                                    <div className="small text-muted">
                                      {formatDate(step.startTime)}
                                    </div>
                                    {step.endTime && (
                                      <div className="small text-muted">
                                        至 {formatDate(step.endTime)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {stepIndex < log.steps.length - 1 && (
                                <div className="text-center py-2 text-muted small border-0">
                                  <span className="mx-2">▶</span>
                                  <span className="badge bg-light text-dark">
                                    {calculateTimeGap(
                                      step.endTime,
                                      log.steps[stepIndex + 1].startTime
                                    )}
                                  </span>
                                </div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted">尚無詳細步驟記錄</p>
                      )}
                    </Col>
                  </div>
                  <div className="mt-3 pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center">
                      {/* 分享按鈕 - 只有已登入用戶才顯示 */}
                      {isAuth && (
                        <button
                          className={`btn btn-sm ${
                            log.id && sharedLogIds.has(log.id)
                              ? 'btn-warning'
                              : 'btn-outline-warning'
                          }`}
                          title={
                            log.id && sharedLogIds.has(log.id)
                              ? '取消分享'
                              : '分享到精選分享'
                          }
                          onClick={() => handleShareTimeLog(log)}
                          disabled={sharingLogId === log.id}
                        >
                          <Icon
                            name={
                              log.id && sharedLogIds.has(log.id)
                                ? 'bookmark-heart-fill'
                                : 'bookmark-heart'
                            }
                          />{' '}
                          {sharingLogId === log.id
                            ? log.id && sharedLogIds.has(log.id)
                              ? '取消中...'
                              : '分享中...'
                            : log.id && sharedLogIds.has(log.id)
                              ? '取消分享'
                              : '分享'}
                        </button>
                      )}
                    </div>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  )

  // 頭貼上傳組件
  const AvatarUploadSection = () => (
    <div className={styles.card}>
      <div className="card-header">
        <h6 className="mb-0">🔧 頭貼管理</h6>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-3 text-center mb-3">
            <div className="mb-3">
              <Image
                src={user?.avatar || '/avatar/avatar.svg'}
                alt="用戶頭貼"
                width={80}
                height={80}
                className="rounded-circle shadow-sm"
                style={{
                  border: '3px solid var(--accent-color, #0dcaf0)',
                }}
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'block'
                }}
              />
            </div>
            <h6 className="mb-2">我的頭貼</h6>
            <Suspense fallback={<div className="text-center">載入中...</div>}>
              <AvatarUpload
                onUploadSuccess={() => {
                  window.location.reload()
                }}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )

  // 個人資訊組件
  const UserInfoSection = () => (
    <div className={styles.card}>
      <div className="card-header">
        <h6 className="mb-0">👤 個人資訊</h6>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <h6>🔐 基本資訊:</h6>
            <ul className="list-unstyled small">
              <li>
                <strong>姓名:</strong> {user?.name || '未設定'}
              </li>
              <li>
                <strong>Email:</strong> {user?.email || '未設定'}
              </li>
              <li>
                <strong>電話:</strong> {user?.phone || '未設定'}
              </li>
              <li>
                <strong>性別:</strong> {user?.gender || '未設定'}
              </li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6>📊 統計資訊:</h6>
            <ul className="list-unstyled small">
              <li>
                <strong>總記錄數:</strong> {statistics.totalLogs}
              </li>
              <li>
                <strong>總時數:</strong> {statistics.totalDuration} 小時
              </li>
              <li>
                <strong>今日記錄:</strong> {statistics.todayLogs}
              </li>
              <li>
                <strong>本週記錄:</strong> {statistics.weekLogs}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  // 我的最愛狀態
  const [favorites, setFavorites] = useState([])
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true)
  const [errorFavorites, setErrorFavorites] = useState(null)

  // 載入我的最愛
  const fetchFavorites = useCallback(async () => {
    if (!isAuth) {
      setIsLoadingFavorites(false)
      return
    }

    try {
      setIsLoadingFavorites(true)
      setErrorFavorites(null)

      const response = await fetch('/api/favorites', {
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
      if (result.status === 'success') {
        setFavorites(result.data || [])
      } else {
        throw new Error(result.message || '載入我的最愛失敗')
      }
    } catch (error) {
      console.error('載入我的最愛失敗:', error)
      setErrorFavorites(error.message)
    } finally {
      setIsLoadingFavorites(false)
    }
  }, [isAuth])

  // 當切換到我的最愛頁籤時載入資料
  useEffect(() => {
    if (activeKey === 'favorite' && isAuth) {
      fetchFavorites()
    }
  }, [activeKey, isAuth, fetchFavorites])

  // 格式化時間
  const formatFavoriteDate = (dateString) => {
    if (!dateString) return '未知時間'
    const date = new Date(dateString)
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 計算時間差
  const calculateFavoriteDuration = (startTime, endTime) => {
    if (!endTime) return '進行中'
    const start = new Date(startTime)
    const end = new Date(endTime)
    const hours = Math.floor((end - start) / (1000 * 60 * 60))
    const minutes = Math.floor(((end - start) % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 0) {
      return `${hours}小時${minutes}分鐘`
    }
    return `${minutes}分鐘`
  }

  // 我的最愛組件
  const FavoriteListSection = () => {
    if (!isAuth) {
      return (
        <div className={styles.card}>
          <div className="card-body text-center py-5">
            <div className="text-muted">
              <i className="bi bi-lock fs-1"></i>
              <p className="mt-3">請先登入以查看我的最愛</p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className={styles.card}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <h6 className="mb-0">❤️ 我的最愛</h6>
          <button
            className="btn btn-outline-light btn-sm"
            onClick={fetchFavorites}
            disabled={isLoadingFavorites}
          >
            <i className="bi bi-arrow-clockwise"></i> 重新載入
          </button>
        </div>
        <div className="card-body">
          {errorFavorites ? (
            <div className="text-center py-5">
              <div className="text-danger">
                <i className="bi bi-exclamation-triangle fs-1"></i>
                <p className="mt-3">載入失敗: {errorFavorites}</p>
                <button
                  className="btn btn-outline-danger"
                  onClick={fetchFavorites}
                >
                  <i className="bi bi-arrow-clockwise"></i> 重新載入
                </button>
              </div>
            </div>
          ) : isLoadingFavorites ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">載入中...</span>
              </div>
              <p className="mt-3 text-muted">載入我的最愛中...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted">
                <i className="bi bi-heart fs-1"></i>
                <p className="mt-3">尚無收藏項目</p>
                <p className="small">
                  前往{' '}
                  <a href="/featured-shares" className="text-primary">
                    精選分享
                  </a>{' '}
                  開始收藏您喜歡的內容吧！
                </p>
              </div>
            </div>
          ) : (
            <Accordion className="border-0">
              {favorites.map((favorite, index) => {
                const share = favorite.featuredShare
                return (
                  <Accordion.Item key={favorite.id} eventKey={index.toString()}>
                    <Accordion.Header>
                      <div className="d-flex justify-content-between align-items-center w-100 me-3">
                        <div>
                          <h6 className="mb-0 fw-semibold">{share.title}</h6>
                          {share.description && (
                            <small className="text-muted">
                              {share.description}
                            </small>
                          )}
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                          <span className="badge bg-info">
                            {calculateFavoriteDuration(
                              share.startTime,
                              share.endTime
                            )}
                          </span>
                          <span className="badge bg-warning">
                            ⭐ {share.starCount || 0}
                          </span>
                          <span className="badge bg-secondary">
                            {share.steps?.length || 0} 步驟
                          </span>
                        </div>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <div className="row">
                        <Col md={4}>
                          <h6>📅 時間資訊</h6>
                          <ul className="list-unstyled">
                            <li>
                              <strong>開始時間:</strong>{' '}
                              {formatFavoriteDate(share.startTime)}
                            </li>
                            <li>
                              <strong>結束時間:</strong>{' '}
                              {formatFavoriteDate(share.endTime)}
                            </li>
                            <li>
                              <strong>持續時間:</strong>
                              <span className="badge bg-info ms-2">
                                {calculateFavoriteDuration(
                                  share.startTime,
                                  share.endTime
                                )}
                              </span>
                            </li>
                            <li>
                              <strong>收藏時間:</strong>{' '}
                              {formatFavoriteDate(favorite.createdAt)}
                            </li>
                          </ul>
                        </Col>
                        <Col md={8}>
                          <h6>📋 詳細步驟</h6>
                          {share.steps && share.steps.length > 0 ? (
                            <div className="list-group list-group-flush">
                              {share.steps.map((step, stepIndex) => (
                                <React.Fragment key={stepIndex}>
                                  <div className="list-group-item px-0 py-2">
                                    <div className="d-flex justify-content-between align-items-start">
                                      <div>
                                        <strong>{step.title}</strong>
                                        {step.description && (
                                          <div className="small text-muted">
                                            {step.description}
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-end">
                                        <div className="small text-muted">
                                          {formatFavoriteDate(step.startTime)}
                                        </div>
                                        {step.endTime && (
                                          <div className="small text-muted">
                                            至{' '}
                                            {formatFavoriteDate(step.endTime)}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </React.Fragment>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted">尚無詳細步驟記錄</p>
                          )}
                        </Col>
                      </div>
                      {share.shareReason && (
                        <div className="mt-3">
                          <h6>💭 分享原因</h6>
                          <p className="text-muted">{share.shareReason}</p>
                        </div>
                      )}
                      <div className="mt-3 d-flex justify-content-between align-items-center">
                        <div>
                          <small className="text-muted">
                            分享者: {share.userName || '匿名用戶'}
                          </small>
                        </div>
                        <div>
                          <a
                            href={`/featured-shares`}
                            className="btn btn-sm btn-outline-primary"
                          >
                            查看完整分享
                          </a>
                        </div>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                )
              })}
            </Accordion>
          )}
        </div>
      </div>
    )
  }

  // 付款紀錄組件
  const PaymentHistorySection = () => (
    <div className={styles.card}>
      <div className="card-header">
        <h6 className="mb-0">💳 付款紀錄</h6>
      </div>
      <div className="card-body">
        <div className="text-center py-5">
          <div className="text-muted">
            <i className="bi bi-credit-card fs-1"></i>
            <p className="mt-3">尚無付款紀錄</p>
            <p className="small">您的付款紀錄將顯示在這裡</p>
          </div>
        </div>
      </div>
    </div>
  )

  // 檢查認證狀態
  // ========================================
  // 🔍 useEffect 空參數說明
  // ========================================
  // useEffect(() => {...}) 中的空參數 () 表示：
  // - 不論有沒有任何參數傳入都會執行
  // - 這是 React useEffect 的標準寫法
  // - 函數會在組件渲染後執行
  useEffect(() => {
    console.log('Dashboard: 認證狀態檢查', {
      hasChecked: auth.hasChecked,
      isAuth: isAuth,
      isLoading: auth.isLoading,
      user: user,
    })

    // 如果認證檢查完成且未登入，跳轉到登入頁面
    if (auth.hasChecked && !isAuth) {
      console.log('❌ 未認證，跳轉到登入頁面')
      router.replace('/user/login')
    }
  }, [auth, isAuth, router, user])

  // 初始化 Bootstrap dropdown
  // ========================================
  // 🔍 useEffect 空參數說明 (第二個)
  // ========================================
  // 這裡的空參數 () 同樣表示不論有沒有參數都會執行
  // 用於初始化 Bootstrap 元件
  useEffect(() => {
    // 確保 Bootstrap JavaScript 已載入
    if (typeof window !== 'undefined' && window.bootstrap) {
      // 初始化所有 dropdown
      const dropdownElementList = document.querySelectorAll('.dropdown-toggle')
      dropdownElementList.forEach(
        (dropdownToggleEl) => new window.bootstrap.Dropdown(dropdownToggleEl)
      )
    }
  }, [])

  // 獲取已分享的記錄 ID
  const fetchSharedLogIds = useCallback(async () => {
    try {
      if (!user?.user_id) return

      // 通過 GET featured-shares 獲取當前用戶已分享的記錄
      const response = await fetch(
        `/api/featured-shares?userId=${user.user_id}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )

      if (response.ok) {
        const result = await response.json()
        if (result.status === 'success' && result.data) {
          // ✅ 將精選分享中屬於當前用戶的 timeLogId 收集成 Set（UUID 字串）
          const sharedIds = []
          const sharePairs = []
          console.log(`result 為被解析過的response,${result.data}`)
          console.log('[FeaturedShare]原始資料：', JSON.stringify(result))
          result.data.forEach((share) => {
            const timeLogId = share.timeLog?.id
            if (typeof timeLogId === 'string' && timeLogId.length > 0) {
              sharedIds.push(timeLogId)
              if (typeof share.id === 'string' && share.id.length > 0) {
                sharePairs.push([timeLogId, share.id])
              }
            }
          })

          console.log('[FeaturedShare] 原始資料：', result.data)
          console.log('[FeaturedShare] timeLogId 列表：', sharedIds)
          console.log('[FeaturedShare] timeLogId ↔ shareId 對應：', sharePairs)

          setSharedLogIds(new Set(sharedIds))
          setSharedShareMap(new Map(sharePairs))
        }
      }
    } catch (error) {
      console.error('獲取已分享記錄失敗:', error)
    }
  }, [user])

  // 前端是從哪一句code帶使用者id給後端的？是透過 JWT Token 的方式：
  const fetchTimeLogs = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('🔄 開始獲取時間戳記錄...')

      const response = await fetch('/api/timelogs', {
        method: 'GET',
        credentials: 'include', // ← 關鍵！這會自動帶上 Cookie
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        // ========================================
        // 🚦 處理速率限制錯誤
        // ========================================
        if (response.status === 429) {
          try {
            const errorData = await response.json()
            if (errorData.errorType === 'rate_limit') {
              // 動態載入 SweetAlert2
              const { showRateLimitAlert } = await import(
                '@/lib/swal-rate-limit'
              )

              showRateLimitAlert(errorData)
              throw new Error('速率限制錯誤')
            }
          } catch (parseError) {
            console.error('解析錯誤回應失敗:', parseError)
          }
        }

        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('📊 時間戳記錄 API 回應:', result)

      if (result.status === 'success') {
        setTimeLogs(result.data.timeLogs)
        setStatistics(result.data.statistics)
        console.log('✅ 時間戳記錄載入成功:', {
          總記錄數: result.data.statistics.totalLogs,
          總時數: result.data.statistics.totalDuration,
          今日記錄: result.data.statistics.todayLogs,
        })

        // 載入已分享的記錄 ID（僅已登入用戶）
        if (isAuth && user?.user_id) {
          await fetchSharedLogIds()
        }
      } else {
        throw new Error(result.message || '獲取時間戳記錄失敗')
      }
    } catch (error) {
      console.error('❌ 獲取時間戳記錄失敗:', error)
      setError(error.message)
    } finally {
      // finally確保無論成功或失敗，資料庫連線都會被正確關閉，避免記憶體洩漏與連線池耗盡
      setIsLoading(false)
    }
  }, [isAuth, user, fetchSharedLogIds])

  // 獲取真實的時間戳記錄數據
  useEffect(() => {
    if (isAuth) {
      fetchTimeLogs()
    }
  }, [isAuth, fetchTimeLogs])

  // 當頁面載入時顯示全域 loader
  useEffect(() => {
    showLoader()
    // 當認證檢查完成且已登入時隱藏 loader
    if (auth.hasChecked && isAuth) {
      hideLoader()
    }
  }, [auth.hasChecked, isAuth, showLoader, hideLoader])

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  // 計算時間差
  const calculateTimeGap = (endTime, nextStartTime) => {
    if (!endTime || !nextStartTime) return null
    const gap = new Date(nextStartTime) - new Date(endTime)
    const seconds = Math.floor(gap / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 60) return `${seconds}秒`
    if (minutes < 60) return `${minutes}分`
    return `${hours}小時${minutes % 60}分`
  }

  // 處理分享時間記錄
  const handleShareTimeLog = async (log) => {
    if (!isAuth) {
      const { default: Swal } = await import('sweetalert2')
      Swal.fire({
        title: '需要登入',
        text: '只有已登入用戶才能分享時間記錄',
        icon: 'warning',
        confirmButtonText: '前往登入',
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/user/login')
        }
      })
      return
    }

    const timeLogId = typeof log.id === 'string' ? log.id : null
    if (!timeLogId) {
      console.warn('分享時間記錄缺少有效的 UUID，跳過分享流程', log)
      const { default: Swal } = await import('sweetalert2')
      Swal.fire({
        title: '無法分享',
        text: '尚未生成時間記錄的唯一識別碼，請稍後再試或重新整理頁面後再試一次。',
        icon: 'warning',
      })
      return
    }

    // ✅ 檢查是否已已分享：若再點擊則改為取消分享（true → false）
    if (sharedLogIds.has(timeLogId)) {
      const shareId = sharedShareMap.get(timeLogId)
      const { default: Swal } = await import('sweetalert2')

      const confirmResult = await Swal.fire({
        title: '取消分享？',
        text: '此時間記錄將從精選分享中移除，確定要取消分享嗎？',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '是，取消分享',
        cancelButtonText: '保留分享',
        reverseButtons: true,
      })

      if (!confirmResult.isConfirmed) {
        return
      }

      if (!shareId) {
        console.warn('找不到對應的分享紀錄，無法取消分享', {
          timeLogId,
          log,
        })
        Swal.fire({
          title: '取消分享失敗',
          text: '找不到對應的分享紀錄，請重新整理頁面後再試一次。',
          icon: 'error',
        })
        return
      }

      try {
        setSharingLogId(log.id)
        const response = await fetch(`/api/featured-shares?id=${shareId}`, {
          method: 'DELETE',
          credentials: 'include',
        })

        const result = await response.json()

        if (response.ok && result.status === 'success') {
          setSharedLogIds((prev) => {
            const next = new Set(prev)
            next.delete(timeLogId)
            return next
          })
          setSharedShareMap((prev) => {
            const next = new Map(prev)
            next.delete(timeLogId)
            return next
          })

          Swal.fire({
            title: '已取消分享',
            text: '此時間記錄已從精選分享中移除。',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          })
        } else {
          throw new Error(result.message || '取消分享失敗')
        }
      } catch (error) {
        console.error('取消分享失敗:', error)
        Swal.fire({
          title: '取消分享失敗',
          text: error.message || '取消分享時發生錯誤',
          icon: 'error',
        })
      } finally {
        setSharingLogId(null)
      }

      return
    }

    // 動態載入 SweetAlert2 用於輸入分享資訊
    const { default: Swal } = await import('sweetalert2')
    const { value: formValues } = await Swal.fire({
      title: '分享時間記錄',
      html: `
        <input id="share-title" class="swal2-input" placeholder="分享標題" value="${
          log.title
        }">
        <textarea id="share-description" class="swal2-textarea" placeholder="分享描述（可選）">${
          log.description || ''
        }</textarea>
        <textarea id="share-reason" class="swal2-textarea" placeholder="分享原因（可選）"></textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '分享',
      cancelButtonText: '取消',
      preConfirm: () => {
        return {
          title: document.getElementById('share-title').value,
          description: document.getElementById('share-description').value,
          shareReason: document.getElementById('share-reason').value,
        }
      },
    })

    if (!formValues) return

    if (!formValues.title?.trim()) {
      Swal.fire({
        title: '錯誤',
        text: '請輸入分享標題',
        icon: 'error',
      })
      return
    }

    try {
      setSharingLogId(log.id)
      const response = await fetch('/api/featured-shares', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeLogId,
          title: formValues.title.trim(),
          description: formValues.description?.trim() || null,
          shareReason: formValues.shareReason?.trim() || null,
          isPublic: true,
        }),
      })

      const result = await response.json()

      if (result.status === 'success') {
        // ✅ 分享成功後即時更新 Set（以 UUID 字串為 key）
        setSharedLogIds((prev) => new Set([...prev, timeLogId]))
        if (result.data?.id) {
          setSharedShareMap((prev) => {
            const next = new Map(prev)
            next.set(timeLogId, result.data.id)
            return next
          })
        }

        Swal.fire({
          title: '分享成功',
          text: '您的時間記錄已成功分享到精選分享頁面',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        throw new Error(result.message || '分享失敗')
      }
    } catch (error) {
      console.error('分享失敗:', error)
      Swal.fire({
        title: '分享失敗',
        text: error.message || '分享時間記錄時發生錯誤',
        icon: 'error',
      })
    } finally {
      setSharingLogId(null)
    }
  }

  if (!auth.hasChecked || isLoading) {
    return null // 使用全域 loader，不需要本地載入狀態
  }

  // 如果未登入，不顯示內容
  if (!isAuth) {
    return null
  }

  return (
    <>
      <Head>
        <title>Dashboard - TimeLog & Analysis</title>
      </Head>

      <div className={styles.page}>
        <Container className="py-4">
          <Tab.Container activeKey={activeKey} onSelect={setActiveKey}>
            <div className="row">
              {/* 左側導航 */}
              <div className="col-md-2">
                <Nav className={`flex-column ${styles.sideNav}`}>
                  <div className={styles.sideNavLabel}>選單</div>
                  {getCurrentSideNav().map((item) => (
                    <Nav.Item key={item.key}>
                      <Nav.Link
                        onClick={() => {
                          handleSideNavClick(item.key)
                          setSubActiveKey(item.key)
                        }}
                        className={subActiveKey === item.key ? 'active' : ''}
                      >
                        {item.label}
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </div>

              {/* 主要內容區域 */}
              <div className="col-md-10">
                {/* 上方導航 */}
                <Nav variant="tabs" fill className={styles.tabs}>
                  <Nav.Item>
                    <Nav.Link eventKey="timelog">時間記錄</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="profile">個人中心</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="favorite">我的最愛</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="history">付款紀錄</Nav.Link>
                  </Nav.Item>
                </Nav>

                {/* 內容區域 */}
                <Tab.Content className="mb-5">
                  <Tab.Pane eventKey="timelog">
                    <div>{renderTimelog(subActiveKey)}</div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="profile">
                    <div>{renderProfile(subActiveKey)}</div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="favorite">
                    <div>{renderFavorite(subActiveKey)}</div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="history">
                    <div>{renderHistory(subActiveKey)}</div>
                  </Tab.Pane>
                </Tab.Content>
              </div>
            </div>
          </Tab.Container>
        </Container>
      </div>
    </>
  )
}
