'use client'
import React, { useState, useEffect, lazy, Suspense } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useLoader } from '@/hooks/use-loader'
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import Image from 'next/image'
import { Accordion, Col } from 'react-bootstrap'
import TimeLogClient from '@/components/timelog/TimeLogClient'

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
  const [timeLogs, setTimeLogs] = useState([])
  // eslint-disable-next-line no-unused-vars
  const [result, setResult] = useState(undefined)
  // eslint-disable-next-line no-unused-vars
  const [statistics, setStatistics] = useState({
    totalLogs: 0,
    totalDuration: 0,
    todayLogs: 0,
    weekLogs: 0,
    efficiency: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

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
  // 前端是從哪一句code帶使用者id給後端的？而是透過 JWT Token 的方式：
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
        <div className="container py-4">
          {/* 統計卡片 */}
          <div className="row mb-4">
            <TimeLogClient />
          </div>

          {/* 時間戳記錄手風琴 */}
          <div className="row">
            <div className="col-12">
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
                        <p className="small">
                          使用上方的時間記錄工具開始記錄您的活動
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Accordion className="border-0">
                      {timeLogs.map((log, index) => (
                        <Accordion.Item
                          key={log.id}
                          eventKey={index.toString()}
                        >
                          <Accordion.Header>
                            <div className="d-flex justify-content-between align-items-center w-100 me-3">
                              <div>
                                <h6 className="mb-0 fw-semibold">
                                  {log.title}
                                </h6>
                                <small className="text-muted">
                                  {log.description}
                                </small>
                              </div>
                              <div className="d-flex gap-2">
                                <span className="badge bg-info">
                                  {log.duration
                                    ? `${log.duration} 小時`
                                    : '進行中'}
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
                                    <strong>開始時間:</strong>{' '}
                                    {formatDate(log.startTime)}
                                  </li>
                                  <li>
                                    <strong>結束時間:</strong>{' '}
                                    {formatDate(log.endTime)}
                                  </li>
                                  <li>
                                    <strong>持續時間:</strong>
                                    <span className="badge bg-info ms-2">
                                      {log.duration
                                        ? `${log.duration} 小時`
                                        : '進行中'}
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
                                                log.steps[stepIndex + 1]
                                                  .startTime
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
                                <button
                                  className="btn btn-outline-primary"
                                  title="編輯"
                                >
                                  <i className="bi bi-pencil"></i> 編輯
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  title="刪除"
                                  onClick={() =>
                                    handleDeleteTimeLog(log.id, log.title)
                                  }
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
            </div>
          </div>

          {/* AI 分析區域 - 延後載入 */}
          <div className="row mt-4">
            <div className="col-12">
              <Suspense
                fallback={
                  <div className="text-center py-4">載入 AI 分析功能中...</div>
                }
              >
                <AIAnalysisSection />
              </Suspense>
            </div>
          </div>

          {/* 認證資訊卡片 (開發環境)卡片 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="row mt-4">
              <div className="col-12">
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
                    <h6
                      className="mb-0"
                      style={{ color: 'var(--text-primary, #ffffff)' }}
                    >
                      🔧 個資修改
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {/* 頭貼區域 */}
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
                              // 如果頭像載入失敗，使用 SVG 圖標
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'block'
                            }}
                          />
                        </div>
                        <h6 className="mb-2">我的頭貼</h6>
                        <Suspense
                          fallback={
                            <div className="text-center">載入中...</div>
                          }
                        >
                          <AvatarUpload
                            // ========================================
                            // 🔍 箭頭函數空參數說明
                            // ========================================
                            // onUploadSuccess={() => {...}} 中的空參數 () 表示：
                            // - 不論有沒有任何參數傳入都會執行
                            // - 這是箭頭函數的標準寫法
                            // - 函數會在上傳成功時被呼叫
                            onUploadSuccess={() => {
                              // 更新用戶狀態或重新載入頁面
                              window.location.reload()
                            }}
                          />
                        </Suspense>
                      </div>

                      <div className="col-md-4">
                        <h6>🔐 JWT Token 資訊:</h6>
                        <ul className="list-unstyled small">
                          <li>
                            <strong>狀態:</strong>{' '}
                            {isAuth ? '✅ 已認證' : '❌ 未認證'}
                          </li>
                          <li>
                            <strong>用戶電話:</strong> {user?.phone || '未設定'}
                          </li>
                          <li>
                            <strong>Email:</strong> {user?.email || '未設定'}
                          </li>
                          <li>
                            <strong>姓名:</strong> {user?.name || '未設定'}
                            <strong>性別:</strong> {user?.gender || '未設定'}
                          </li>
                        </ul>
                      </div>
                      <div className="col-md-5">
                        <h6>🍪 Cookie 資訊:</h6>
                        <ul className="list-unstyled small">
                          <li>
                            <strong>ACCESS_TOKEN:</strong>{' '}
                            {document.cookie.includes('ACCESS_TOKEN')
                              ? '✅ 存在'
                              : '❌ 不存在'}
                          </li>
                          <li>
                            <strong>Session:</strong>{' '}
                            {auth.hasChecked ? '✅ 已檢查' : '⏳ 檢查中'}
                          </li>
                          <li>
                            <strong>Loading:</strong>{' '}
                            {auth.isLoading ? '⏳ 載入中' : '✅ 完成'}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
