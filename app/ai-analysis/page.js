'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Container, Row, Col, Card, Button, Alert, Form } from 'react-bootstrap'

export default function AIAnalysisPage() {
  const { isAuth, handleCheckAuth, user } = useAuth()
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
  const [userTimeLogs, setUserTimeLogs] = useState([])
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [loadingUserData, setLoadingUserData] = useState(false)

  useEffect(() => {
    handleCheckAuth()
  }, [handleCheckAuth])

  // 獲取用戶的時間記錄
  useEffect(() => {
    if (isAuth) {
      fetchUserTimeLogs()
    }
  }, [isAuth])

  const fetchUserTimeLogs = async () => {
    try {
      setLoadingUserData(true)
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
      if (result.status === 'success') {
        setUserTimeLogs(result.data.timeLogs)
      }
    } catch (error) {
      console.error('獲取用戶時間記錄失敗:', error)
    } finally {
      setLoadingUserData(false)
    }
  }

  const toggleSelection = (id) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const isSelected = (id) => selectedItems.has(id)

  const analyzeSelected = async () => {
    if (selectedItems.size === 0) {
      setError('請至少選擇一個時間記錄')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const activities = []
      selectedItems.forEach((id) => {
        const log = userTimeLogs.find((l) => l.id === id)
        if (log) {
          activities.push({
            id: log.id,
            type: 'timelog',
            label: log.title,
            timestamp: log.startTime,
            endTime: log.endTime,
          })
          log.steps.forEach((step) => {
            activities.push({
              id: `step-${step.id}`,
              type: 'step',
              label: step.title,
              timestamp: step.startTime,
              endTime: step.endTime,
              timeLogId: log.id,
            })
          })
        }
      })

      const res = await fetch('/api/ai/analyze-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ activities }),
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

  return (
    <Container className="py-4">
      <h2 className="mb-4">🤖 AI 智能分析 - Gemini 2.5 Flash</h2>

      {!isAuth && (
        <Alert variant="warning" className="mb-4">
          需要登入才能讀取你的時間記錄資料。請先登入，或使用手動輸入 JSON。
        </Alert>
      )}

      <Row>
        {/* 左側：用戶時間記錄選擇 */}
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">📊 我的時間記錄</h5>
            </Card.Header>
            <Card.Body>
              {loadingUserData ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">載入中...</span>
                  </div>
                  <p className="mt-2 text-muted">載入時間記錄中...</p>
                </div>
              ) : userTimeLogs.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p>尚無時間記錄</p>
                  <Button variant="outline-primary" size="sm" as="a" href="/">
                    開始記錄時間
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <small className="text-muted">
                      已選擇 {selectedItems.size} 個記錄
                    </small>
                  </div>
                  <div
                    className="mb-3"
                    style={{ maxHeight: '400px', overflowY: 'auto' }}
                  >
                    {userTimeLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`card mb-2 ${isSelected(log.id) ? 'border-primary' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleSelection(log.id)}
                      >
                        <div className="card-body py-2">
                          <div className="d-flex align-items-center">
                            <span className="me-2 fs-5">
                              {isSelected(log.id) ? '✅' : '⭕'}
                            </span>
                            <div className="flex-grow-1">
                              <strong>{log.title}</strong>
                              <div className="small text-muted">
                                {formatDate(log.startTime)} •{' '}
                                {log.steps?.length || 0} 步驟
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="primary"
                    onClick={analyzeSelected}
                    disabled={loading || selectedItems.size === 0}
                    className="w-100"
                  >
                    {loading
                      ? '分析中...'
                      : `分析選中的記錄 (${selectedItems.size})`}
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* 右側：手動 JSON 輸入 */}
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">📝 手動輸入 JSON</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted small mb-3">
                貼上活動
                JSON（陣列）。我們會分析第一次與第二次燙直的時間差，以及影響效果的可能因素。
              </p>

              <Form.Group className="mb-3">
                <Form.Label>活動資料 JSON</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  value={activitiesJson}
                  onChange={(e) => setActivitiesJson(e.target.value)}
                  spellCheck={false}
                  placeholder="輸入 JSON 格式的活動資料..."
                />
              </Form.Group>

              <Button
                variant="outline-primary"
                onClick={analyze}
                disabled={loading}
                className="w-100"
              >
                {loading ? '分析中...' : '分析 JSON 資料'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 錯誤訊息 */}
      {error && (
        <Alert variant="danger" className="mt-4">
          {error}
        </Alert>
      )}

      {/* 分析結果 */}
      {result && (
        <Card className="mt-4">
          <Card.Header>
            <h5 className="mb-0">🎯 分析結果</h5>
          </Card.Header>
          <Card.Body>
            <div className="mb-3">
              <strong>模型</strong>: {result?.model}
            </div>
            {result?.result && (
              <>
                <div className="mb-3">
                  <strong>時間差(天)</strong>:{' '}
                  {String(result?.result?.timeDeltaDays ?? 'n/a')}
                </div>
                <div className="mb-3">
                  <strong>關鍵因素</strong>:
                  <ul className="mb-0">
                    {(result?.result?.keyFactors || []).map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-3">
                  <strong>摘要</strong>: {result?.result?.summary}
                </div>
              </>
            )}
            {!result?.result && (
              <>
                <div className="mb-3 text-muted">
                  AI 回傳非結構化內容，以下為原文：
                </div>
                <pre
                  className="mb-0 p-3 bg-light rounded"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {result?.raw}
                </pre>
              </>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  )
}
