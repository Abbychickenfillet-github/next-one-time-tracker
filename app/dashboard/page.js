'use client'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import Head from 'next/head'
import { Accordion } from 'react-bootstrap'

export default function Dashboard() {
  const { auth, logout, user, isAuth } = useAuth()
  const router = useRouter()
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

  // 檢查認證狀態
  useEffect(() => {
    console.log('Dashboard: 認證狀態檢查', {
      hasChecked: auth.hasChecked,
      isAuth: isAuth,
      isLoading: auth.isLoading,
      user: user,
    })

    // 暫時註解掉自動跳轉，讓你可以測試 dashboard
    // if (auth.hasChecked && !isAuth) {
    //   console.log('❌ 未認證，跳轉到登入頁面')
    //   router.replace('/user/login')
    // }
  }, [auth, isAuth, router, user])

  // 獲取真實的時間戳記錄數據
  useEffect(() => {
    if (isAuth) {
      fetchTimeLogs()
    }
  }, [isAuth])

  const fetchTimeLogs = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('🔄 開始獲取時間戳記錄...')

      const response = await fetch('/api/timelogs', {
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
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '確認登出',
      text: '您確定要登出嗎？',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '登出',
      cancelButtonText: '取消',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
    })

    if (result.isConfirmed) {
      await logout()
    }
  }

  const handleDeleteTimeLog = async (logId, logTitle) => {
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
        // 這裡可以加入實際的刪除 API 呼叫
        console.log('刪除時間戳記錄:', logId)

        // 暫時顯示成功訊息
        Swal.fire({
          title: '刪除成功',
          text: '時間戳記錄已成功刪除',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        })

        // 重新載入資料
        await fetchTimeLogs()
      } catch (error) {
        console.error('刪除失敗:', error)
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
    })
  }

  if (!auth.hasChecked || isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">載入中...</span>
          </div>
          <p className="mt-3">載入中...</p>
          <p className="small text-muted">
            認證狀態: {auth.hasChecked ? '已檢查' : '檢查中'} | 登入狀態:{' '}
            {isAuth ? '已登入' : '未登入'}
          </p>
        </div>
      </div>
    )
  }

  // 暫時註解掉認證檢查，讓你可以測試 dashboard
  // if (!isAuth) {
  //   return null
  // }

  return (
    <>
      <Head>
        <title>Dashboard - TimeLog & Analysis</title>
      </Head>

      <div className="min-vh-100 bg-light">
        {/* 頂部導航 */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <div className="container">
            <span className="navbar-brand mb-0 h1">📊 TimeLog Dashboard</span>
            <div className="navbar-nav ms-auto">
              <div className="nav-item dropdown">
                <button
                  className="btn btn-outline-light dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  👤 {user?.email || '用戶'}
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      登出
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        <div className="container py-4">

          {/* 統計卡片 */}
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="text-primary fs-2 mb-2">📈</div>
                  <h5 className="card-title">總時數</h5>
                  <p className="card-text fs-4 fw-bold text-primary">
                    {statistics.totalDuration} 小時
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="text-success fs-2 mb-2">🎯</div>
                  <h5 className="card-title">今日記錄</h5>
                  <p className="card-text fs-4 fw-bold text-success">
                    {statistics.todayLogs} 筆
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="text-info fs-2 mb-2">📅</div>
                  <h5 className="card-title">本週記錄</h5>
                  <p className="card-text fs-4 fw-bold text-info">
                    {statistics.weekLogs} 筆
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  <div className="text-warning fs-2 mb-2">⚡</div>
                  <h5 className="card-title">效率評分</h5>
                  <p className="card-text fs-4 fw-bold text-warning">
                    {statistics.efficiency}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 時間戳記錄手風琴 */}
          <div className="row">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">📋 時間戳記錄</h5>
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
                        <button className="btn btn-primary">
                          開始記錄時間
                        </button>
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
                              <div className="col-md-6">
                                <h6>📅 時間資訊</h6>
                                <ul className="list-unstyled">
                                  <li><strong>開始時間:</strong> {formatDate(log.startTime)}</li>
                                  <li><strong>結束時間:</strong> {formatDate(log.endTime)}</li>
                                  <li><strong>持續時間:</strong>
                                    <span className="badge bg-info ms-2">
                                      {log.duration ? `${log.duration} 小時` : '進行中'}
                                    </span>
                                  </li>
                                </ul>
                              </div>
                              <div className="col-md-6">
                                <h6>📋 詳細步驟</h6>
                                {log.steps && log.steps.length > 0 ? (
                                  <div className="list-group list-group-flush">
                                    {log.steps.map((step, stepIndex) => (
                                      <div key={stepIndex} className="list-group-item px-0 py-2">
                                        <div className="d-flex justify-content-between align-items-start">
                                          <div>
                                            <strong>{step.name}</strong>
                                            {step.description && (
                                              <div className="small text-muted">{step.description}</div>
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
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-muted">尚無詳細步驟記錄</p>
                                )}
                              </div>
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
                                  onClick={() => handleDeleteTimeLog(log.id, log.title)}
                                >
                                  <i className="bi bi-trash"></i> 刪除
                                </button>
                                <button
                                  className="btn btn-outline-info"
                                  title="查看詳情"
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

          {/* 認證資訊卡片 (開發環境) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="row mt-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-warning text-dark">
                    <h6 className="mb-0">🔧 開發環境 - 認證資訊</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <h6>🔐 JWT Token 資訊:</h6>
                        <ul className="list-unstyled small">
                          <li>
                            <strong>狀態:</strong>{' '}
                            {isAuth ? '✅ 已認證' : '❌ 未認證'}
                          </li>
                          <li>
                            <strong>用戶 ID:</strong> {user?.id || '未設定'}
                          </li>
                          <li>
                            <strong>Email:</strong> {user?.email || '未設定'}
                          </li>
                          <li>
                            <strong>姓名:</strong> {user?.name || '未設定'}
                          </li>
                        </ul>
                      </div>
                      <div className="col-md-6">
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
