'use client'

import { useState, useEffect } from 'react'
import { Container, Card, Button, ListGroup, Alert } from 'react-bootstrap'

export default function TestStorageLogicPage() {
  const [storageData, setStorageData] = useState({})
  const [logs, setLogs] = useState([])

  // 載入所有 trial-activity-* 的數據
  const loadStorageData = () => {
    const data = {}
    for (let i = 1; i <= 10; i++) {
      const key = `trial-activity-${i}`
      const value = localStorage.getItem(key)
      data[key] = value ? JSON.parse(value) : null
    }
    setStorageData(data)
  }

  // 初始化
  useEffect(() => {
    loadStorageData()
  }, [])

  // 找到第一個空缺和計算總數（模擬實際邏輯）
  // 兩個邏輯分開執行，不互相干擾
  const findGapAndCount = () => {
    const result = {
      steps: {
        findGap: [], // 邏輯1：找第一個空缺的步驟
        countTotal: [], // 邏輯2：計算總數的步驟
      },
      nextIndex: null,
      actualCount: 0,
      gaps: [],
      existing: [],
    }

    // 邏輯 1：找第一個空缺（找到就停止，提高效率）
    result.steps.findGap.push({
      phase: '🔍 邏輯 1：尋找第一個空缺',
      description:
        '從序號 1 開始檢查，找到第一個空缺就停止（break），不需要檢查後面的',
    })

    let nextIndex = null
    for (let i = 1; i <= 10; i++) {
      const key = `trial-activity-${i}`
      const exists = localStorage.getItem(key) !== null

      if (!exists) {
        nextIndex = i // 找到第一個空缺
        result.gaps.push(i)
        result.steps.findGap.push({
          index: i,
          status: '❌ 空缺',
          action: `✅ 找到第一個空缺！nextIndex = ${i}，跳出迴圈`,
          highlight: true,
        })
        break // 找到就停止，不需要繼續檢查
      } else {
        result.existing.push(i)
        result.steps.findGap.push({
          index: i,
          status: '✅ 存在',
          action: '繼續檢查下一個...',
        })
      }
    }

    if (nextIndex === null) {
      result.steps.findGap.push({
        phase: '結論',
        action: '沒有找到空缺（所有序號 1-10 都有數據）',
      })
    }

    result.nextIndex = nextIndex

    // 邏輯 2：計算實際存在的總數（需要遍歷所有，不能提前停止）
    result.steps.countTotal.push({
      phase: '📊 邏輯 2：計算實際存在的總數',
      description:
        '遍歷所有序號 1-10，每找到一個存在的就 actualCount++，需要檢查所有序號',
    })

    let actualCount = 0
    for (let i = 1; i <= 10; i++) {
      const key = `trial-activity-${i}`
      const exists = localStorage.getItem(key) !== null

      if (exists) {
        actualCount++ // 每找到一個存在的就 +1
        result.steps.countTotal.push({
          index: i,
          status: '✅ 存在',
          action: `actualCount++ → ${actualCount}`,
        })
      } else {
        result.gaps.push(i)
        result.steps.countTotal.push({
          index: i,
          status: '❌ 空缺',
          action: '跳過（不計入 actualCount）',
        })
      }
    }

    result.actualCount = actualCount

    // 如果沒有空缺（全部都有），使用下一個序號
    if (result.nextIndex === null) {
      result.nextIndex = result.actualCount + 1
      result.steps.countTotal.push({
        phase: '結論',
        action: `沒有空缺，下一個序號 = actualCount + 1 = ${result.actualCount} + 1 = ${result.nextIndex}`,
      })
    }

    return result
  }

  // 添加測試數據
  const addTestData = (index) => {
    const testData = {
      id: Date.now(),
      title: `測試活動 ${index}`,
      desc: `這是第 ${index} 個測試活動`,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(`trial-activity-${index}`, JSON.stringify(testData))
    loadStorageData()

    const analysis = findGapAndCount()
    setLogs((prev) => [
      ...prev,
      {
        type: 'add',
        message: `✅ 已添加 trial-activity-${index}`,
        analysis,
        timestamp: new Date().toLocaleTimeString(),
      },
    ])
  }

  // 刪除測試數據
  const removeTestData = (index) => {
    localStorage.removeItem(`trial-activity-${index}`)
    loadStorageData()

    const analysis = findGapAndCount()
    setLogs((prev) => [
      ...prev,
      {
        type: 'remove',
        message: `🗑️ 已刪除 trial-activity-${index}`,
        analysis,
        timestamp: new Date().toLocaleTimeString(),
      },
    ])
  }

  // 清除所有
  const clearAll = () => {
    for (let i = 1; i <= 10; i++) {
      localStorage.removeItem(`trial-activity-${i}`)
    }
    loadStorageData()
    setLogs([])

    const analysis = findGapAndCount()
    setLogs((prev) => [
      ...prev,
      {
        type: 'clear',
        message: '🧹 已清除所有數據',
        analysis,
        timestamp: new Date().toLocaleTimeString(),
      },
    ])
  }

  // 模擬儲存邏輯
  const simulateSave = () => {
    const analysis = findGapAndCount()
    const nextIndex = analysis.nextIndex

    if (nextIndex > 10) {
      alert('已達到10筆記錄限制！')
      return
    }

    addTestData(nextIndex)

    setLogs((prev) => [
      ...prev,
      {
        type: 'simulate',
        message: `💾 模擬儲存：使用序號 ${nextIndex}`,
        analysis,
        timestamp: new Date().toLocaleTimeString(),
      },
    ])
  }

  const currentAnalysis = findGapAndCount()

  return (
    <Container className="py-4">
      <h1 className="mb-4">🧪 測試 Storage 序號邏輯</h1>

      <Card className="mb-4">
        <Card.Header>
          <h5>📊 當前狀態分析</h5>
        </Card.Header>
        <Card.Body>
          <div className="row mb-3">
            <div className="col-md-4">
              <Alert variant="info">
                <strong>實際存在數量 (actualCount):</strong>{' '}
                {currentAnalysis.actualCount}
              </Alert>
            </div>
            <div className="col-md-4">
              <Alert variant="success">
                <strong>下一個序號 (nextIndex):</strong>{' '}
                {currentAnalysis.nextIndex}
              </Alert>
            </div>
            <div className="col-md-4">
              <Alert variant="warning">
                <strong>空缺序號 (gaps):</strong>{' '}
                {currentAnalysis.gaps.length > 0
                  ? currentAnalysis.gaps.join(', ')
                  : '無'}
              </Alert>
            </div>
          </div>

          <div className="mb-3">
            <h6>存在的序號：</h6>
            <div className="d-flex gap-2 flex-wrap">
              {currentAnalysis.existing.length > 0 ? (
                currentAnalysis.existing.map((i) => (
                  <span key={i} className="badge bg-success fs-6">
                    {i}
                  </span>
                ))
              ) : (
                <span className="text-muted">無</span>
              )}
            </div>
          </div>

          <div className="mb-3">
            <h6>空缺的序號：</h6>
            <div className="d-flex gap-2 flex-wrap">
              {currentAnalysis.gaps.length > 0 ? (
                currentAnalysis.gaps.map((i) => (
                  <span key={i} className="badge bg-danger fs-6">
                    {i}
                  </span>
                ))
              ) : (
                <span className="text-muted">無</span>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h5>🔍 逐步分析過程</h5>
        </Card.Header>
        <Card.Body>
          {/* 階段一：找第一個空缺 */}
          <div className="mb-4">
            <h6 className="text-primary">階段一：尋找第一個空缺</h6>
            <ListGroup>
              {currentAnalysis.steps.findGap.map((step, idx) => {
                if (step.phase) {
                  return (
                    <ListGroup.Item key={idx} className="fw-bold bg-light">
                      {step.phase}
                      {step.description && (
                        <div className="small text-muted fw-normal mt-1">
                          {step.description}
                        </div>
                      )}
                    </ListGroup.Item>
                  )
                }
                return (
                  <ListGroup.Item
                    key={idx}
                    className={step.highlight ? 'bg-warning bg-opacity-25' : ''}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>序號 {step.index}:</strong> {step.status}
                      </div>
                      <div className="text-muted">{step.action}</div>
                    </div>
                  </ListGroup.Item>
                )
              })}
            </ListGroup>
          </div>

          {/* 階段二：計算總數 */}
          <div>
            <h6 className="text-success">階段二：計算實際存在的總數</h6>
            <ListGroup>
              {currentAnalysis.steps.countTotal.map((step, idx) => {
                if (step.phase) {
                  return (
                    <ListGroup.Item key={idx} className="fw-bold bg-light">
                      {step.phase}
                      {step.description && (
                        <div className="small text-muted fw-normal mt-1">
                          {step.description}
                        </div>
                      )}
                    </ListGroup.Item>
                  )
                }
                return (
                  <ListGroup.Item key={idx}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>序號 {step.index}:</strong> {step.status}
                      </div>
                      <div className="text-muted">{step.action}</div>
                    </div>
                  </ListGroup.Item>
                )
              })}
            </ListGroup>
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h5>🎮 操作區</h5>
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <h6>快速操作：</h6>
            <div className="d-flex gap-2 mb-2 flex-wrap">
              <Button variant="primary" onClick={simulateSave}>
                💾 模擬儲存（自動使用正確序號）
              </Button>
              <Button variant="danger" onClick={clearAll}>
                🧹 清除所有
              </Button>
            </div>
          </div>

          <div className="mb-3">
            <h6>手動添加/刪除（測試不連續情況）：</h6>
            <div className="d-flex gap-2 mb-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
                const exists = storageData[`trial-activity-${i}`] !== null
                return (
                  <Button
                    key={i}
                    variant={exists ? 'danger' : 'success'}
                    size="sm"
                    onClick={() =>
                      exists ? removeTestData(i) : addTestData(i)
                    }
                  >
                    {exists ? `🗑️ ${i}` : `➕ ${i}`}
                  </Button>
                )
              })}
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h5>📋 當前 Storage 內容</h5>
        </Card.Header>
        <Card.Body>
          <div className="row">
            {Object.entries(storageData).map(([key, value]) => (
              <div key={key} className="col-md-6 mb-2">
                <div
                  className={`p-2 border rounded ${
                    value ? 'bg-light' : 'bg-secondary bg-opacity-10'
                  }`}
                >
                  <strong>{key}:</strong>{' '}
                  {value ? (
                    <span className="text-success">
                      ✅ {value.title || '有數據'}
                    </span>
                  ) : (
                    <span className="text-muted">❌ 空缺</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {logs.length > 0 && (
        <Card>
          <Card.Header>
            <h5>📝 操作記錄</h5>
          </Card.Header>
          <Card.Body>
            <div
              style={{ maxHeight: '400px', overflowY: 'auto' }}
              className="border rounded p-3"
            >
              {logs
                .slice()
                .reverse()
                .map((log, idx) => (
                  <div key={idx} className="mb-3 border-bottom pb-2">
                    <div className="d-flex justify-content-between mb-2">
                      <strong>{log.message}</strong>
                      <span className="text-muted small">{log.timestamp}</span>
                    </div>
                    <div className="small">
                      <div>
                        結果：nextIndex = {log.analysis.nextIndex}, actualCount
                        = {log.analysis.actualCount}
                      </div>
                      {log.analysis.gaps.length > 0 && (
                        <div>空缺：{log.analysis.gaps.join(', ')}</div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  )
}
