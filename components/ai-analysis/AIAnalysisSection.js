'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, Button, Alert, Form, Row, Col } from 'react-bootstrap'

export default function AIAnalysisSection() {
  const { isAuth } = useAuth()
  const [userTimeLogs, setUserTimeLogs] = useState([])
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loadingUserData, setLoadingUserData] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [manualInput, setManualInput] = useState('')

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

      const payload = { activities }

      // 組合自定義提示詞和手動輸入
      let combinedPrompt = ''
      if (customPrompt.trim()) {
        combinedPrompt += customPrompt.trim()
      }
      if (manualInput.trim()) {
        if (combinedPrompt) combinedPrompt += '\n\n'
        combinedPrompt += '用戶提供的額外資訊：\n' + manualInput.trim()
      }

      if (combinedPrompt) {
        payload.customPrompt = combinedPrompt
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
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-bottom">
        <h5 className="mb-0">🤖 AI 智能分析</h5>
      </Card.Header>
      <Card.Body>
        {!isAuth && (
          <Alert variant="warning" className="mb-4">
            需要登入才能讀取你的時間記錄資料進行 AI 分析。
          </Alert>
        )}

        <Row>
          {/* 左側：時間記錄選擇 */}
          <Col md={6}>
            <div className="mb-3">
              <h6 className="text-muted">📊 選擇要分析的記錄</h6>
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
                  <p className="small">請先使用上方的時間記錄工具創建記錄</p>
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
                    style={{ maxHeight: '300px', overflowY: 'auto' }}
                  >
                    {userTimeLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`card mb-2 ${isSelected(log.id) ? 'border-primary' : ''}`}
                        style={{ cursor: 'pointer' }}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleSelection(log.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            toggleSelection(log.id)
                          }
                        }}
                        aria-label={`選擇記錄 ${log.title || log.id}`}
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
                </>
              )}
            </div>
          </Col>

          {/* 右側：自定義提示詞和手動輸入 */}
          <Col md={6}>
            <div className="mb-3">
              <h6 className="text-muted">💬 自定義分析指令</h6>
              <Form.Group className="mb-3">
                <Form.Label>分析提示詞 (可選)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="例如：請分析我的工作效率，並提供改進建議..."
                />
              </Form.Group>

              <div className="mb-3">
                <h6 className="text-muted">📝 手動輸入分析內容</h6>
                <Form.Group className="mb-3">
                  <Form.Label>任意文字內容 (可選)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="輸入任何你想分析的內容，例如：我今天做了什麼、我的工作習慣、我的時間分配問題等..."
                  />
                </Form.Group>
              </div>

              <Button
                variant="primary"
                onClick={analyzeSelected}
                disabled={loading || selectedItems.size === 0 || !isAuth}
                className="w-100"
              >
                {loading
                  ? '分析中...'
                  : `分析選中的記錄 (${selectedItems.size})`}
              </Button>
            </div>
          </Col>
        </Row>

        {/* 錯誤訊息 */}
        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {/* 分析結果 */}
        {result && (
          <div className="mt-4">
            <h6 className="text-muted mb-3">🎯 分析結果</h6>
            <div className="card">
              <div className="card-body">
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
              </div>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  )
}
