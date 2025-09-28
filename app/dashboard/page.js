'use client'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import Head from 'next/head'

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
  }, [auth, isAuth, router])

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
          {/* 歡迎區域 */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div
                  className="card-body bg-gradient"
                  style={{
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <h2 className="text-white mb-2">歡迎回來！</h2>
                      <p className="text-white-50 mb-0">
                        您好，{auth.userData?.name || auth?.userData?.email}
                        ，這是您的時間管理儀表板
                      </p>
                    </div>
                    <div className="col-md-4 text-end">
                      <div className="text-white">
                        <div className="fs-4 fw-bold">
                          {statistics.totalLogs}
                        </div>
                        <div className="small">總記錄數</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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

          {/* 時間戳記錄表格 */}
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
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>活動名稱</th>
                            <th>描述</th>
                            <th>開始時間</th>
                            <th>結束時間</th>
                            <th>持續時間</th>
                            <th>步驟數</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {timeLogs.map((log) => (
                            <tr key={log.id}>
                              <td>
                                <div className="fw-semibold">{log.title}</div>
                              </td>
                              <td>
                                <div className="text-muted small">
                                  {log.description}
                                </div>
                              </td>
                              <td>
                                <div className="small">
                                  {formatDate(log.startTime)}
                                </div>
                              </td>
                              <td>
                                <div className="small">
                                  {formatDate(log.endTime)}
                                </div>
                              </td>
                              <td>
                                <span className="badge bg-info">
                                  {log.duration
                                    ? `${log.duration} 小時`
                                    : '進行中'}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-secondary">
                                  {log.steps.length} 步驟
                                </span>
                              </td>
                              <td>
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-outline-primary"
                                    title="編輯"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button
                                    className="btn btn-outline-danger"
                                    title="刪除"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
