// app/timelog/ai-analysis/page.tsx
'use client'
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

interface AIAnalysis {
  analysis: string
  insights: string[]
  recommendations: string[]
  summary: {
    totalActivities: number
    totalDuration: number
    averageDuration: number
    mostProductiveHour: string
  }
}

export default function AIAnalysisPage() {
  const auth = useAuth() as any
  const user = auth?.user
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState(30)

  // 生成 AI 分析
  const generateAnalysis = async () => {
    if (!user?.id) {
      alert('請先登入以使用 AI 分析功能')
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          timeRange: timeRange
        })
      })

      const data = await response.json()
      setAnalysis(data)
    } catch (error) {
      console.error('AI 分析失敗:', error)
      alert('AI 分析失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  // 格式化時長
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours > 0) {
      return `${hours}小時${remainingMinutes}分鐘`
    }
    return `${minutes}分鐘`
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">
            🤖 AI 時間分析
            {user && <small className="text-muted ms-2">({user.username})</small>}
          </h2>

          {/* 控制面板 */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <label htmlFor="timeRange" className="form-label">
                    分析時間範圍
                  </label>
                  <select
                    id="timeRange"
                    className="form-select"
                    value={timeRange}
                    onChange={(e) => setTimeRange(parseInt(e.target.value))}
                  >
                    <option value={7}>最近 7 天</option>
                    <option value={30}>最近 30 天</option>
                    <option value={90}>最近 90 天</option>
                  </select>
                </div>
                <div className="col-md-6 d-flex align-items-end">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={generateAnalysis}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        分析中...
                      </>
                    ) : (
                      <>
                        🚀 開始 AI 分析
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI 分析結果 */}
          {analysis && (
            <div className="row">
              {/* 總覽統計 */}
              <div className="col-md-4 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">📊 總覽統計</h5>
                  </div>
                  <div className="card-body">
                    <div className="row text-center">
                      <div className="col-6 mb-3">
                        <div className="border-end">
                          <h4 className="text-primary">{analysis.summary.totalActivities}</h4>
                          <small className="text-muted">總活動數</small>
                        </div>
                      </div>
                      <div className="col-6 mb-3">
                        <h4 className="text-success">{formatDuration(analysis.summary.totalDuration)}</h4>
                        <small className="text-muted">總時長</small>
                      </div>
                      <div className="col-6">
                        <h4 className="text-info">{formatDuration(analysis.summary.averageDuration)}</h4>
                        <small className="text-muted">平均時長</small>
                      </div>
                      <div className="col-6">
                        <h4 className="text-warning">{analysis.summary.mostProductiveHour}</h4>
                        <small className="text-muted">最有效率時段</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI 洞察 */}
              <div className="col-md-8 mb-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">🔍 AI 洞察</h5>
                  </div>
                  <div className="card-body">
                    <div className="alert alert-info">
                      <strong>整體分析：</strong>
                      <p className="mb-0 mt-2">{analysis.analysis}</p>
                    </div>
                    
                    <h6 className="mt-3">詳細洞察：</h6>
                    <ul className="list-group list-group-flush">
                      {analysis.insights.map((insight, index) => (
                        <li key={index} className="list-group-item">
                          <span className="badge bg-primary me-2">{index + 1}</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* AI 建議 */}
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">💡 AI 建議</h5>
                  </div>
                  <div className="card-body">
                    {analysis.recommendations.length > 0 ? (
                      <div className="row">
                        {analysis.recommendations.map((recommendation, index) => (
                          <div key={index} className="col-md-6 mb-3">
                            <div className="card border-success">
                              <div className="card-body">
                                <h6 className="card-title text-success">
                                  💡 建議 {index + 1}
                                </h6>
                                <p className="card-text">{recommendation}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="alert alert-success">
                        <h6>🎉 表現優異！</h6>
                        <p className="mb-0">根據 AI 分析，您的時間管理已經很好了，暫時沒有特別的改進建議。</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 使用說明 */}
          <div className="card mt-4">
            <div className="card-header">
              <h5 className="mb-0">📖 使用說明</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>🤖 AI 分析功能</h6>
                  <ul>
                    <li>分析您的時間使用模式</li>
                    <li>識別最有效率的時段</li>
                    <li>提供個人化改進建議</li>
                    <li>追蹤活動類型和時長分布</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>📊 分析指標</h6>
                  <ul>
                    <li>時間分布（早晨/下午/晚間）</li>
                    <li>活動類型統計</li>
                    <li>工作效率指標</li>
                    <li>任務複雜度分析</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
