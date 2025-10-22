'use client'
import React, { useState, useEffect, lazy, Suspense } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useLoader } from '@/hooks/use-loader'
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import Image from 'next/image'
import { Accordion, Col, Nav, Tab, Container } from 'react-bootstrap'
import TimeLogClient from '@/components/timelog/TimeLogClient'
import DashboardLapTimer from '@/components/timelog/DashboardLapTimer'

// 動態載入非關鍵元件，減少首屏 bundle
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
  // eslint-disable-next-line no-unused-vars
  const [result, setResult] = useState(undefined)
  const [statistics, setStatistics] = useState({
    totalLogs: 0,
    totalDuration: 0,
    todayLogs: 0,
    weekLogs: 0,
    efficiency: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

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
    <div className="card border-0 shadow-sm">
      <div
        className="card-header border-bottom"
        style={{
          background:
            'var(--primary-bg, linear-gradient(135deg, #0dcaf0, #0aa2c0))',
          color: 'var(--text-primary, #ffffff)',
          borderBottom: '1px solid var(--accent-color, #0dcaf0)',
        }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <h5
            className="mb-0"
            style={{ color: 'var(--text-primary, #ffffff)' }}
          >
            📋 時間戳記錄
          </h5>
          <div className="btn-group">
            <button
              className="btn btn-outline-primary btn-sm"
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
              <i className="bi bi-exclamation-triangle fs-1"></i>
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
                    <div className="d-flex gap-2">
                      <span className="badge bg-info">
                        {log.duration ? `${log.duration} 小時` : '進行中'}
                      </span>
                      <span className="badge bg-secondary">
                        {log.steps.length} 步驟
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
                                    <strong>{step.name}</strong>
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
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-primary" title="編輯">
                        <i className="bi bi-pencil"></i> 編輯
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        title="刪除"
                        onClick={() => handleDeleteTimeLog(log.id, log.title)}
                      >
                        <i className="bi bi-trash"></i> 刪除
                      </button>
                      <button
                        className="btn btn-outline-info"
                        title="查看詳情"
                        onClick={() => analyzeTimeLog(log)}
                      >
                        <i className="bi bi-eye"></i> 分析
                      </button>
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
    <div className="card border-0 shadow-sm">
      <div
        className="card-header border-bottom"
        style={{
          background:
            'var(--primary-bg, linear-gradient(135deg, #0dcaf0, #0aa2c0))',
          color: 'var(--text-primary, #ffffff)',
          borderBottom: '1px solid var(--accent-color, #0dcaf0)',
        }}
      >
        <h6 className="mb-0" style={{ color: 'var(--text-primary, #ffffff)' }}>
          🔧 頭貼管理
        </h6>
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
    <div className="card border-0 shadow-sm">
      <div
        className="card-header border-bottom"
        style={{
          background:
            'var(--primary-bg, linear-gradient(135deg, #0dcaf0, #0aa2c0))',
          color: 'var(--text-primary, #ffffff)',
          borderBottom: '1px solid var(--accent-color, #0dcaf0)',
        }}
      >
        <h6 className="mb-0" style={{ color: 'var(--text-primary, #ffffff)' }}>
          👤 個人資訊
        </h6>
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

  // 我的最愛組件
  const FavoriteListSection = () => (
    <div className="card border-0 shadow-sm">
      <div
        className="card-header border-bottom"
        style={{
          background:
            'var(--primary-bg, linear-gradient(135deg, #0dcaf0, #0aa2c0))',
          color: 'var(--text-primary, #ffffff)',
          borderBottom: '1px solid var(--accent-color, #0dcaf0)',
        }}
      >
        <h6 className="mb-0" style={{ color: 'var(--text-primary, #ffffff)' }}>
          ❤️ 我的最愛
        </h6>
      </div>
      <div className="card-body">
        <div className="text-center py-5">
          <div className="text-muted">
            <i className="bi bi-heart fs-1"></i>
            <p className="mt-3">尚無收藏項目</p>
            <p className="small">開始收藏您喜歡的內容吧！</p>
          </div>
        </div>
      </div>
    </div>
  )

  // 付款紀錄組件
  const PaymentHistorySection = () => (
    <div className="card border-0 shadow-sm">
      <div
        className="card-header border-bottom"
        style={{
          background:
            'var(--primary-bg, linear-gradient(135deg, #0dcaf0, #0aa2c0))',
          color: 'var(--text-primary, #ffffff)',
          borderBottom: '1px solid var(--accent-color, #0dcaf0)',
        }}
      >
        <h6 className="mb-0" style={{ color: 'var(--text-primary, #ffffff)' }}>
          💳 付款紀錄
        </h6>
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

  // 獲取真實的時間戳記錄數據
  useEffect(() => {
    if (isAuth) {
      fetchTimeLogs()
    }
  }, [isAuth])

  // 當頁面載入時顯示全域 loader
  useEffect(() => {
    showLoader()
    // 當認證檢查完成且已登入時隱藏 loader
    if (auth.hasChecked && isAuth) {
      hideLoader()
    }
  }, [auth.hasChecked, isAuth, showLoader, hideLoader])
  // 前端是從哪一句code帶使用者id給後端的？是透過 JWT Token 的方式：
  const fetchTimeLogs = async () => {
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
  }

  const handleDeleteTimeLog = async (logId, logTitle) => {
    // 動態載入 SweetAlert2，避免首屏阻塞
    const { default: Swal } = await import('sweetalert2')
    const result = await Swal.fire({
      title: '確認刪除',
      text: `您確定要刪除「${logTitle}」這個時間戳記錄嗎？`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '刪除',
      cancelButtonText: '取消',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
    })

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/timelog/${logId}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('刪除時間戳記錄:', result)

        if (result.status === 'success') {
          const { default: Swal } = await import('sweetalert2')
          Swal.fire({
            title: '刪除成功',
            text: '時間戳記錄已成功刪除',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          })

          // 重新載入資料
          await fetchTimeLogs()
        } else {
          throw new Error(result.message || '刪除時間戳記錄失敗')
        }
      } catch (error) {
        console.error('刪除失敗:', error)
        const { default: Swal } = await import('sweetalert2')
        Swal.fire({
          title: '刪除失敗',
          text: '刪除時間戳記錄時發生錯誤',
          icon: 'error',
        })
      }
    }
  }

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
  const analyzeTimeLog = async (log) => {
    const payload = {
      activities: [
        {
          id: log.id,
          type: 'timelog',
          label: log.title,
          timestamp: log.startTime,
          endTime: log.endTime,
        },
      ],
    }
    const response = await fetch(`/api/ai/analyze-activities`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    const data = await response.json()
    if (data?.status !== 'success') throw new Error(data?.message || '分析失敗')
    setResult(data?.data)
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

      <div className="min-vh-100 bg-light">
        <Container className="py-4">
          <Tab.Container activeKey={activeKey} onSelect={setActiveKey}>
            <div className="row">
              {/* 左側導航 */}
              <div className="col-md-2">
                <Nav className="flex-column">
                  {getCurrentSideNav().map((item) => (
                    <Nav.Item key={item.key}>
                      <Nav.Link
                        onClick={() => {
                          handleSideNavClick(item.key)
                          setSubActiveKey(item.key)
                        }}
                        className={`text-center ${
                          subActiveKey === item.key ? 'active' : ''
                        }`}
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
                <Nav
                  variant="tabs"
                  className="mb-3"
                  fill
                  style={{ '--bs-nav-link-color': '#805AF5' }}
                >
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
                    <div className="row justify-content-end">
                      {renderTimelog(subActiveKey)}
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="profile">
                    <div className="row justify-content-end">
                      {renderProfile(subActiveKey)}
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="favorite">
                    <div className="row justify-content-end">
                      {renderFavorite(subActiveKey)}
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="history">
                    <div className="row justify-content-end">
                      {renderHistory(subActiveKey)}
                    </div>
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
