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
    clearStorage,
    getElapsedMinutes,
    getActivityStatus,
    saveCurrentActivity,
    deleteSavedActivity,
    loadSavedActivities,
  } = useTrialTimeLogStore()

  // 由於 savedActivities 已經是 Zustand 的狀態，我們可以使用它來計算數量
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

  // ===== 檢查 localStorage 使用量 (當 savedActivities 改變時執行) =====
  // 依賴 savedActivities 變化來自動更新計數
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const count = savedActivities.length // 直接使用 Zustand 狀態的長度
      setLocalStorageCount(count)
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
      // TODO: 替換為自訂彈出視窗
      console.log('活動已成功儲存！')
    }
  }

  // ===== 清除 localStorage =====
  const handleClearStorage = async () => {
    const { default: Swal } = await import('sweetalert2')
    const result = await Swal.fire({
      title: '確認清除',
      text: '確定要清除所有活動記錄嗎？此操作無法復原。',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '清除',
      cancelButtonText: '取消',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
    })

    if (result.isConfirmed) {
      clearStorage()
      Swal.fire({
        title: '已清除',
        text: '所有活動記錄已清除',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
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
  const handleVoiceInput = (result, inputType) => {
    if (inputType === 'title') {
      setTitle(result)
    } else {
      // 預設或 inputType === 'desc' 時，設置到活動描述
      setDesc(result)
    }
  }

  // ===== 格式化時間 =====
  const formatTime = (date) => {
    if (!date) return '--:----'
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
      <Container className="py-4">
        {/* 主要 TimeLog 介面 */}
        <Card className="shadow-sm">
          <Card.Header
            className="text-white"
            style={{
              background:
                'var(--button-bg, linear-gradient(45deg, #0dcaf0, #0aa2c0))',
            }}
          >
            <h4 className="mb-0">⏰ TimeLog 試用版</h4>
            <div className="d-flex justify-content-between align-items-center">
              <span className="small">
                📊 localStorage 使用量: {localStorageCount}/10 筆記錄
              </span>
              {/* localStorage 使用量指示器 */}
              <Button
                className="btn-sm text-white"
                variant="outline-white"
                size="sm"
                onClick={handleClearStorage}
              >
                清除記錄
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-4">
            {/* 導入響應式 Row & Col */}
            <Row>
              {/* ===== 左側欄：即時活動控制與步驟 (md=7, 佔用較多空間) ===== */}
              <Col md={7} className="border-end pe-md-4 mb-4 mb-md-0">
                {/* 1. 目前時間顯示 */}
                <div className="text-center mb-4">
                  <div className="display-6 text-primary fw-bold">
                    {formatTime(currentTime)}
                  </div>
                  <div className="text-muted">{formatDate(currentTime)}</div>
                </div>

                {/* 2. 活動資訊輸入 */}
                <Row className="mb-1">
                  <Col>
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
                  <Col md={3}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold invisible">
                        活動名稱語音輸入
                      </label>
                      <div className="text-center w-100 d-flex justify-content-center">
                        <VoiceInput
                          onResult={handleVoiceInput}
                          inputType="title"
                        />
                      </div>
                    </div>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col md={9}>
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
                  {/* 3. 語音輸入 */}
                  <Col md={3}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold invisible">
                        活動描述語音輸入
                      </label>
                      <div className="text-center w-100 d-flex justify-content-center">
                        <VoiceInput
                          onResult={handleVoiceInput}
                          inputType="desc"
                        />
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* 4. 控制按鈕 */}
                <div className="text-center mb-4">
                  <div className="btn-group" role="group">
                    {getActivityStatus() === '準備中' && (
                      <Button
                        variant="success"
                        size="lg"
                        onClick={handleStart}
                        disabled={!isClient || !title.trim()}
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
                          disabled={isClient && localStorageCount >= 10}
                        >
                          💾 儲存活動
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* 5. 活動狀態顯示 */}
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

                {/* 6. 步驟列表 */}
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
              </Col>

              {/* ===== 右側欄：活動歷史與升級提示 (md=5, 較窄空間) ===== */}
              <Col md={5} className="ps-md-4">
                {/* 7. 已儲存活動列表 */}
                {savedActivities.length > 0 && (
                  <div className="mb-4">
                    <h5 className="mb-3">📚 已儲存的活動 (歷史)</h5>
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
                              onClick={async () => {
                                const { default: Swal } = await import(
                                  'sweetalert2'
                                )
                                const result = await Swal.fire({
                                  title: '確認刪除',
                                  text: '確定要刪除此活動記錄嗎？',
                                  icon: 'warning',
                                  showCancelButton: true,
                                  confirmButtonText: '刪除',
                                  cancelButtonText: '取消',
                                  confirmButtonColor: '#dc3545',
                                  cancelButtonColor: '#6c757d',
                                })

                                if (result.isConfirmed) {
                                  deleteSavedActivity(activity.id)
                                  Swal.fire({
                                    title: '已刪除',
                                    text: '活動記錄已刪除',
                                    icon: 'success',
                                    timer: 2000,
                                    showConfirmButton: false,
                                  })
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

                {/* 8. 升級提示 (保持在右側欄底部，優先於歷史紀錄) */}
                <Alert variant="success" className="mt-4 mt-md-0">
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
            </Row>
            {/* 結束 Row */}
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}
