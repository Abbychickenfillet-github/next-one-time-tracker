// app/timelog/history/page.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

interface TimeLog {
  id: number
  title: string
  description?: string
  startTime: string
  endTime?: string
  createdAt: string
  aiAnalysis?: string
  steps: Step[]
  user?: {
    username: string
    email: string
  }
}

interface Step {
  id: number
  title: string
  description?: string
  startTime: string
  endTime?: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function TimeLogHistory() {
  const auth = useAuth() as any
  const user = auth?.user
  const [logs, setLogs] = useState<TimeLog[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<TimeLog | null>(null)

  // 載入時間記錄
  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })

      if (user?.user_id) {
        params.append('userId', user.user_id.toString())
      }

      const response = await fetch(`/api/timelog?${params}`)
      const data = await response.json()

      setLogs(data.logs)
      setPagination(data.pagination)
    } catch (error) {
      console.error('載入時間記錄失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [user])

  // 計算活動時長
  const calculateDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return '進行中'
    const start = new Date(startTime)
    const end = new Date(endTime)
    const duration = end.getTime() - start.getTime()
    const minutes = Math.floor(duration / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0) {
      return `${hours}小時${remainingMinutes}分鐘`
    }
    return `${minutes}分鐘`
  }

  // 格式化日期時間
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">載入中...</span>
          </div>
          <p className="mt-2">載入時間記錄中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">
            📊 我的時間記錄
            {user && (
              <small className="text-muted ms-2">({user.username})</small>
            )}
          </h2>

          {/* 統計卡片 */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body text-center">
                  <h5 className="card-title">總活動數</h5>
                  <h3>{pagination.total}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body text-center">
                  <h5 className="card-title">已完成</h5>
                  <h3>{logs.filter((log) => log.endTime).length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body text-center">
                  <h5 className="card-title">進行中</h5>
                  <h3>{logs.filter((log) => !log.endTime).length}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body text-center">
                  <h5 className="card-title">總步驟數</h5>
                  <h3>
                    {logs.reduce((sum, log) => sum + log.steps.length, 0)}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* 時間記錄表格 */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">📋 活動記錄列表</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>活動名稱</th>
                      <th>開始時間</th>
                      <th>結束時間</th>
                      <th>時長</th>
                      <th>步驟數</th>
                      <th>AI 分析</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <strong>{log.title}</strong>
                          {log.description && (
                            <>
                              <br />
                              <small className="text-muted">
                                {log.description}
                              </small>
                            </>
                          )}
                        </td>
                        <td>{formatDateTime(log.startTime)}</td>
                        <td>
                          {log.endTime ? (
                            formatDateTime(log.endTime)
                          ) : (
                            <span className="badge bg-warning">進行中</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              log.endTime ? 'bg-success' : 'bg-warning'
                            }`}
                          >
                            {calculateDuration(log.startTime, log.endTime)}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-info">
                            {log.steps.length}
                          </span>
                        </td>
                        <td>
                          {log.aiAnalysis ? (
                            <small className="text-success">
                              {log.aiAnalysis}
                            </small>
                          ) : (
                            <small className="text-muted">分析中...</small>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setSelectedLog(log)}
                          >
                            📝 詳情
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 分頁 */}
          {pagination.totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li
                  className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}
                >
                  <button
                    className="page-link"
                    onClick={() => fetchLogs(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    上一頁
                  </button>
                </li>

                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <li
                    key={page}
                    className={`page-item ${page === pagination.page ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => fetchLogs(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}
                >
                  <button
                    className="page-link"
                    onClick={() => fetchLogs(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    下一頁
                  </button>
                </li>
              </ul>
            </nav>
          )}

          {/* 詳情 Modal */}
          {selectedLog && (
            <div
              className="modal show d-block"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">📋 {selectedLog.title}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setSelectedLog(null)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <strong>開始時間：</strong>
                        <p>{formatDateTime(selectedLog.startTime)}</p>
                      </div>
                      <div className="col-md-6">
                        <strong>結束時間：</strong>
                        <p>
                          {selectedLog.endTime
                            ? formatDateTime(selectedLog.endTime)
                            : '進行中'}
                        </p>
                      </div>
                    </div>

                    {selectedLog.description && (
                      <div className="mb-3">
                        <strong>描述：</strong>
                        <p>{selectedLog.description}</p>
                      </div>
                    )}

                    {selectedLog.aiAnalysis && (
                      <div className="mb-3">
                        <strong>🤖 AI 分析：</strong>
                        <div className="alert alert-info">
                          {selectedLog.aiAnalysis}
                        </div>
                      </div>
                    )}

                    <div className="mb-3">
                      <strong>📝 步驟詳情：</strong>
                      <div className="list-group">
                        {selectedLog.steps.map((step, index) => (
                          <div key={step.id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">
                                  {index + 1}. {step.title}
                                </h6>
                                {step.description && (
                                  <p className="mb-1">{step.description}</p>
                                )}
                                <small>
                                  {formatDateTime(step.startTime)}
                                  {step.endTime &&
                                    ` - ${formatDateTime(step.endTime)}`}
                                </small>
                              </div>
                              {step.endTime && (
                                <span className="badge bg-success">
                                  ✅ 完成
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setSelectedLog(null)}
                    >
                      關閉
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
