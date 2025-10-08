'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

export default function AIAnalysisPage() {
  const { isAuth, handleCheckAuth } = useAuth()
  const [activitiesJson, setActivitiesJson] = useState(
    JSON.stringify(
      [
        {
          id: 1,
          type: 'hair_straightening',
          label: '燙直-第一次',
          timestamp: '2025-08-10T10:30:00+08:00',
        },
        {
          id: 2,
          type: 'hair_straightening',
          label: '燙直-第二次',
          timestamp: '2025-09-15T14:00:00+08:00',
        },
        {
          id: 3,
          type: 'hair_coloring',
          label: '染髮',
          timestamp: '2025-09-30',
        },
      ],
      null,
      2
    )
  )
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    handleCheckAuth()
  }, [handleCheckAuth])

  async function analyze() {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      let payload = {}
      if (activitiesJson.trim()) {
        try {
          payload.activities = JSON.parse(activitiesJson)
        } catch {
          throw new Error('活動資料不是合法的 JSON')
        }
      }

      const res = await fetch('/api/ai/analyze-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data?.status !== 'success')
        throw new Error(data?.message || '分析失敗')
      setResult(data?.data)
    } catch (err) {
      setError(err?.message || '發生未知錯誤')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-4">
      <h2 className="mb-3">使用者活動 AI 分析（燙直差異）</h2>
      {!isAuth && (
        <div className="alert alert-warning" role="alert">
          需要登入才能讀取你的 dashboard 資料。請先登入，或貼上自定活動 JSON。
        </div>
      )}
      <p className="text-muted">
        貼上活動
        JSON（陣列）。我們會分析第一次與第二次燙直的時間差，以及影響效果的可能因素。
      </p>

      <div className="mb-3">
        <label className="form-label">活動資料 JSON</label>
        <textarea
          className="form-control"
          rows={10}
          value={activitiesJson}
          onChange={(e) => setActivitiesJson(e.target.value)}
          spellCheck={false}
        />
      </div>

      <button className="btn btn-primary" onClick={analyze} disabled={loading}>
        {loading ? '分析中...' : '送出分析'}
      </button>

      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          {error}
        </div>
      )}

      {result && (
        <div className="card mt-4">
          <div className="card-body">
            <h5 className="card-title">分析結果</h5>
            <div className="mb-2">
              <strong>模型</strong>: {result?.model}
            </div>
            {result?.result && (
              <>
                <div className="mb-2">
                  <strong>時間差(天)</strong>:{' '}
                  {String(result?.result?.timeDeltaDays ?? 'n/a')}
                </div>
                <div className="mb-2">
                  <strong>關鍵因素</strong>:
                  <ul className="mb-0">
                    {(result?.result?.keyFactors || []).map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-2">
                  <strong>摘要</strong>: {result?.result?.summary}
                </div>
              </>
            )}
            {!result?.result && (
              <>
                <div className="mb-2 text-muted">
                  AI 回傳非結構化內容，以下為原文：
                </div>
                <pre className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                  {result?.raw}
                </pre>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
