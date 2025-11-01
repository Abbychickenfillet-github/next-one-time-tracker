'use client'
import React from 'react'
import { useEffect, useState } from 'react'
import { useTrialTimeLogStore } from '@/stores/useTrialTimeLogStore'
import VoiceInput from '@/components/timelog/VoiceInput'
import { Container, Card, Button, Alert, Row, Col } from 'react-bootstrap'
import Link from 'next/link'

export default function TrialPage() {
  // ===== Zustand 狀態管理 =====
  const {
    // 狀態
    title,
    desc,
    startTime,
    endTime,
    steps,
    currentTime,
    isClient,
    savedActivities,
    // Actions
    setClient,
    updateCurrentTime,
    setTitle,
    setDesc,
    startActivity,
    endActivity,
    addStep,
    endSubStep,
    handleVoiceResult,
    clearStorage,
    getElapsedMinutes,
    getActivityStatus,
    saveCurrentActivity,
    getSavedActivitiesCount,
    deleteSavedActivity,
    loadSavedActivities,
  } = useTrialTimeLogStore()

  const [localStorageCount, setLocalStorageCount] = useState(0)

  // ===== 客戶端渲染標記 =====
  useEffect(() => {
    setClient(true)
    // 載入已儲存的活動
    loadSavedActivities()
  }, [setClient, loadSavedActivities])

  // ===== 即時時間更新 =====
  useEffect(() => {
    if (!isClient) return

    // 立即設定初始時間
    updateCurrentTime()

    const timer = setInterval(() => {
      updateCurrentTime()
    }, 1000)

    return () => clearInterval(timer)
  }, [isClient, updateCurrentTime])

  // ===== 檢查 localStorage 使用量 =====
  // 目前問題是刪除localStorage的trial-activity-${i}之後，會導致序號不連續，需要重新整理序號
  // 作法：在deleteSavedActivity中加入reorganizeStorage()函式，重新整理序號
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkLocalStorageUsage = () => {
        try {
          let count = 0
          // 檢查所有帶序數的活動記錄
          for (let i = 1; i <= 10; i++) {
            const key = `trial-activity-${i}`
            if (localStorage.getItem(key)) {
              count++
            }
          }
          setLocalStorageCount(count)
        } catch (error) {
          console.log('檢查 localStorage 使用量失敗:', error)
        }
      }

      checkLocalStorageUsage()
      // 每5秒檢查一次
      const interval = setInterval(checkLocalStorageUsage, 5000)
      return () => clearInterval(interval)
    }
  }, [savedActivities]) // 當 savedActivities 改變時重新檢查

  // ===== 開始活動 =====
  const handleStart = () => {
    startActivity()
  }

  // ===== 儲存當前活動 =====
  const handleSaveActivity = () => {
    const success = saveCurrentActivity()
    if (success) {
      alert('活動已成功儲存！')
      // 重新載入已儲存的活動並更新計數
      loadSavedActivities()
      setLocalStorageCount(getSavedActivitiesCount())
    }
  }

  // ===== 清除 localStorage =====
  const handleClearStorage = () => {
    if (confirm('確定要清除所有活動記錄嗎？此操作無法復原。')) {
      clearStorage()
      setLocalStorageCount(0)
      alert('已清除所有活動記錄')
    }
  }

  // ===== 新增階段步驟 =====
  const handleAddStep = () => {
    addStep()
  }

  // ===== 結束子步驟 =====
  const handleEndSubStep = (index) => {
    endSubStep(index)
  }

  // ===== 語音輸入處理 =====
  const handleVoiceInput = (result) => {
    handleVoiceResult(result)
  }

  // ===== 格式化時間 =====
  const formatTime = (date) => {
    if (!date) return '--:--:--'
    return date.toLocaleTimeString('zh-TW', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  // ===== 格式化日期 =====
  const formatDate = (date) => {
    if (!date) return '--'
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Trial Banner */}
      <div className="bg-warning text-dark py-3">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <h4 className="mb-1">🎯 免費試用版</h4>
              <p className="mb-0">
                使用 localStorage 儲存，最多 10
                筆記錄。註冊後可享受雲端同步與無限記錄！
              </p>
            </Col>
            <Col md={4} className="text-end">
              <div className="d-flex gap-2 justify-content-end">
                <Button
                  variant="outline-dark"
                  size="sm"
                  as={Link}
                  href="/user/register"
                >
                  立即註冊
                </Button>
                <Button variant="dark" size="sm" as={Link} href="/user/login">
                  登入帳號
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-4">
        {/* localStorage 使用量指示器 */}
        <Alert variant="info" className="mb-1">
          <div className="d-flex justify-content-between align-items-center">
            <span>📊 localStorage 使用量: {localStorageCount}/10 筆記錄</span>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleClearStorage}
            >
              清除記錄
            </Button>
          </div>
        </Alert>

        {/* 主要 TimeLog 介面 */}
        <Card className="shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h4 className="mb-0">⏰ TimeLog 試用版</h4>
          </Card.Header>
          <Card.Body className="p-4">
            {/* 目前時間顯示 */}
            <div className="text-center mb-4">
              <div className="display-6 text-primary fw-bold">
                {formatTime(currentTime)}
              </div>
              <div className="text-muted">{formatDate(currentTime)}</div>
            </div>

            {/* 左右兩欄佈局 */}
            <Row>
              {/* 左半邊：輸入框、按鈕組、活動狀態、升級提示 */}
              <Col sm={12} md={6}>
                {/* 活動資訊輸入 */}
                <Row className="mb-1">
                  <Col sm={12} md={12}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">活動名稱</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="輸入活動名稱..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col sm={12} md={9}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">活動描述</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="輸入活動描述..."
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                      />
                    </div>
                  </Col>
                  {/* 語音輸入 */}
                  <Col sm={12} md={3} className="d-flex align-items-end">
                    <div className="mb-3 w-100 text-center">
                      <VoiceInput onResult={handleVoiceInput} />
                    </div>
                  </Col>
                </Row>
                {/* 控制按鈕 */}
                <div className="text-center mb-4">
                  <div className="btn-group" role="group">
                    {getActivityStatus() === '準備中' && (
                      <Button
                        variant="success"
                        size="lg"
                        onClick={handleStart}
                        disabled={!title.trim()}
                      >
                        🚀 開始記錄
                      </Button>
                    )}
                    {getActivityStatus() === '進行中' && (
                      <>
                        <Button
                          variant="info"
                          size="lg"
                          onClick={handleAddStep}
                        >
                          📝 記錄時間點
                        </Button>
                        <Button
                          variant="warning"
                          size="lg"
                          onClick={endActivity}
                        >
                          ⏹️ 結束活動
                        </Button>
                      </>
                    )}
                    {getActivityStatus() === '已結束' && (
                      <>
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={handleStart}
                        >
                          🔄 重新開始
                        </Button>
                        <Button
                          variant="success"
                          size="lg"
                          onClick={handleSaveActivity}
                          disabled={localStorageCount >= 10}
                        >
                          💾 儲存活動
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {/* 活動狀態顯示 */}
                {startTime && (
                  <div className="text-center mb-4">
                    <div className="alert alert-info">
                      <strong>活動狀態:</strong> {getActivityStatus()}
                      {startTime && (
                        <div className="mt-2">
                          <strong>開始時間:</strong> {formatTime(startTime)}
                          {endTime && (
                            <>
                              <br />
                              <strong>結束時間:</strong> {formatTime(endTime)}
                              <br />
                              <strong>
                                持續時間:
                              </strong> {getElapsedMinutes()} 分鐘
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* 升級提示 */}
                <Alert variant="success" className="mt-4">
                  <h5>🚀 升級到完整版享受更多功能！</h5>
                  <ul className="mb-3">
                    <li>✅ 雲端同步 - 多裝置無縫切換</li>
                    <li>✅ 無限記錄 - 不再受 localStorage 限制</li>
                    <li>✅ AI 分析 - Gemini 2.5 Flash 智能洞察</li>
                    <li>✅ 數據匯出 - 支援多種格式</li>
                  </ul>
                  <div className="d-flex gap-2">
                    <Button variant="success" as={Link} href="/user/register">
                      立即註冊
                    </Button>
                    <Button
                      variant="outline-success"
                      as={Link}
                      href="/subscription"
                    >
                      查看方案
                    </Button>
                  </div>
                </Alert>
              </Col>

              {/* 右半邊：記錄步驟、已儲存活動 */}
              <Col sm={12} md={6}>
                {/* 步驟列表 */}
                {steps.length > 0 && (
                  <div className="mb-4">
                    <h5 className="mb-3">📋 記錄步驟</h5>
                    <div className="list-group">
                      {steps.map((step, index) => (
                        <div key={index} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>步驟 {index + 1}:</strong>{' '}
                              {step.title || step.name}
                              {step.description && (
                                <div className="text-muted small">
                                  {step.description}
                                </div>
                              )}
                            </div>
                            <div className="text-end">
                              <div className="small text-muted">
                                開始: {formatTime(step.startTime)}
                              </div>
                              {step.endTime ? (
                                <div className="small text-muted">
                                  結束: {formatTime(step.endTime)}
                                </div>
                              ) : (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleEndSubStep(index)}
                                >
                                  結束
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 已儲存活動列表 */}
                {savedActivities.length > 0 && (
                  <div className="mb-4">
                    <h5 className="mb-3">📚 已儲存的活動</h5>
                    <div className="list-group">
                      {savedActivities.map((activity, index) => (
                        <div key={activity.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>活動 {index + 1}:</strong>{' '}
                              {activity.title}
                              {activity.desc && (
                                <div className="text-muted small">
                                  描述: {activity.desc}
                                </div>
                              )}
                              <div className="text-muted small">
                                開始: {formatTime(activity.startTime)} | 結束:{' '}
                                {formatTime(activity.endTime)} | 持續:{' '}
                                {Math.floor(activity.duration / 1000 / 60)} 分鐘
                              </div>
                            </div>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                if (confirm('確定要刪除此活動記錄嗎？')) {
                                  deleteSavedActivity(activity.id)
                                  // 重新載入已儲存的活動並更新計數
                                  loadSavedActivities()
                                  setLocalStorageCount(
                                    getSavedActivitiesCount()
                                  )
                                }
                              }}
                            >
                              刪除
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}
