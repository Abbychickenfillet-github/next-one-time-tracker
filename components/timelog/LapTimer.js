'use client'
import React from 'react'
import { useEffect, useState } from 'react'
import { useLapTimerStore } from '@/stores/useLapTimerStore'
import VoiceInput from '@/components/timelog/VoiceInput'
import {
  Container,
  Card,
  Button,
  Alert,
  Row,
  Col,
  Badge,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap'

export default function LapTimer() {
  // ===== Zustand 狀態管理 =====
  const {
    // 狀態
    title,
    desc,
    startTime,
    endTime,
    currentTime,
    isClient,
    laps,
    isRunning,
    pausePeriods,
    totalElapsedTime,
    netElapsedTime,
    // Actions
    setClient,
    updateCurrentTime,
    setTitle,
    setDesc,
    startActivity,
    pauseActivity,
    resumeActivity,
    recordLap,
    endActivity,
    resetActivity,
    clearStorage,
    getCurrentElapsedTime,
    getActivityStatus,
    formatTime,
  } = useLapTimerStore()

  const [displayTime, setDisplayTime] = useState('00:00')

  // ===== 客戶端渲染標記 =====
  useEffect(() => {
    setClient(true)
  }, [setClient])

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

  // ===== 顯示時間更新 =====
  useEffect(() => {
    if (isRunning) {
      const elapsedTime = getCurrentElapsedTime()
      setDisplayTime(formatTime(elapsedTime))
    }
  }, [currentTime, isRunning, getCurrentElapsedTime, formatTime])

  // ===== 格式化時間顯示 =====
  const formatTimeDisplay = (date) => {
    if (!date) return '--:--:--'
    return date.toLocaleString('zh-TW', {
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const formatDateDisplay = (date) => {
    if (!date) return '--'
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  // ===== 事件處理函數 =====
  const handleStart = () => {
    startActivity()
  }

  const handlePause = () => {
    pauseActivity()
  }

  const handleResume = () => {
    resumeActivity()
  }

  const handleRecordLap = () => {
    recordLap()
  }

  const handleEnd = () => {
    endActivity()
  }

  const handleReset = async () => {
    const { default: Swal } = await import('sweetalert2')
    const result = await Swal.fire({
      title: '確認重置',
      text: '確定要重置所有記錄嗎？此操作無法復原。',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '重置',
      cancelButtonText: '取消',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
    })

    if (result.isConfirmed) {
      resetActivity()
      setDisplayTime('00:00')
      Swal.fire({
        title: '已重置',
        text: '所有記錄已重置',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
    }
  }

  const handleClearStorage = async () => {
    const { default: Swal } = await import('sweetalert2')
    const result = await Swal.fire({
      title: '確認清除',
      text: '確定要清除所有記錄嗎？此操作無法復原。',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '清除',
      cancelButtonText: '取消',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
    })

    if (result.isConfirmed) {
      clearStorage()
      setDisplayTime('00:00')
      Swal.fire({
        title: '已清除',
        text: '所有記錄已清除',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
    }
  }

  const handleVoiceInput = (result) => {
    setDesc(result)
  }

  return (
    <div className="min-vh-100 bg-light">
      <Container fluid className="py-4">
        {/* 主要 LapTimer 介面 */}
        <Card className="shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h4 className="mb-0">🏃‍♂️ LapTimer - 分圈計時器</h4>
          </Card.Header>
          <Card.Body className="p-0">
            <Row className="g-0">
              {/* 左側：輸入和控制區域 */}
              <Col lg={6} className="p-4 border-end">
                {/* 目前時間顯示 */}
                <div className="text-center mb-4">
                  <div className="display-6 text-primary fw-bold">
                    {formatTimeDisplay(currentTime)}
                  </div>
                  <div className="text-muted">
                    {formatDateDisplay(currentTime)}
                  </div>
                </div>

                {/* 活動資訊輸入 */}
                <div className="mb-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">活動名稱</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="輸入活動名稱..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isRunning}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">分圈描述</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="輸入分圈描述..."
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                    />
                  </div>
                </div>

                {/* 語音輸入 */}
                <div className="mb-4">
                  <VoiceInput onResult={handleVoiceInput} />
                </div>

                {/* 計時器顯示 */}
                {isRunning && (
                  <div className="text-center mb-4">
                    <div className="display-4 text-success fw-bold mb-2">
                      {displayTime}
                    </div>
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                      <Badge bg="info" className="fs-6">
                        總時間: {formatTime(totalElapsedTime)}
                      </Badge>
                      <Badge bg="success" className="fs-6">
                        淨時間: {formatTime(netElapsedTime)}
                      </Badge>
                      {pausePeriods.length > 0 && (
                        <Badge bg="warning" className="fs-6">
                          暫停次數: {pausePeriods.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

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
                        🚀 開始計時
                      </Button>
                    )}
                    {getActivityStatus() === '進行中' && (
                      <>
                        <Button
                          variant="warning"
                          size="lg"
                          onClick={handlePause}
                        >
                          ⏸️ 暫停
                        </Button>
                        <Button
                          variant="info"
                          size="lg"
                          onClick={handleRecordLap}
                        >
                          🏁 記錄分圈
                        </Button>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip
                              id="lap-end-tooltip-running"
                              style={{
                                backgroundColor: 'var(--tooltip-bg, #2d3748)',
                                color: 'var(--tooltip-text, #ffffff)',
                                border:
                                  '1px solid var(--tooltip-border, #4a5568)',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                padding: '0.75rem 1rem',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                maxWidth: '280px',
                                textAlign: 'center',
                                lineHeight: '1.4',
                              }}
                            >
                              一旦結束當即儲存至資料庫
                            </Tooltip>
                          }
                        >
                          <Button
                            variant="danger"
                            size="lg"
                            onClick={handleEnd}
                          >
                            ⏹️ 結束
                          </Button>
                        </OverlayTrigger>
                      </>
                    )}
                    {getActivityStatus() === '已暫停' && (
                      <>
                        <Button
                          variant="success"
                          size="lg"
                          onClick={handleResume}
                        >
                          ▶️ 恢復
                        </Button>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip
                              id="lap-end-tooltip-paused"
                              style={{
                                backgroundColor: 'var(--tooltip-bg, #2d3748)',
                                color: 'var(--tooltip-text, #ffffff)',
                                border:
                                  '1px solid var(--tooltip-border, #4a5568)',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                padding: '0.75rem 1rem',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                maxWidth: '280px',
                                textAlign: 'center',
                                lineHeight: '1.4',
                              }}
                            >
                              一旦結束當即儲存至資料庫
                            </Tooltip>
                          }
                        >
                          <Button
                            variant="danger"
                            size="lg"
                            onClick={handleEnd}
                          >
                            ⏹️ 結束
                          </Button>
                        </OverlayTrigger>
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
                          variant="secondary"
                          size="lg"
                          onClick={handleReset}
                        >
                          🔄 重置
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* 活動狀態顯示 */}
                {startTime && (
                  <div className="mb-4">
                    <div className="alert alert-info">
                      <strong>活動狀態:</strong> {getActivityStatus()}
                      {startTime && (
                        <div className="mt-2">
                          <strong>開始時間:</strong>{' '}
                          {formatTimeDisplay(startTime)}
                          {endTime && (
                            <>
                              <br />
                              <strong>結束時間:</strong>{' '}
                              {formatTimeDisplay(endTime)}
                              <br />
                              <strong>總時間:</strong>{' '}
                              {formatTime(totalElapsedTime)}
                              <br />
                              <strong>淨時間:</strong>{' '}
                              {formatTime(netElapsedTime)}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 功能說明 */}
                <Alert variant="light" className="mb-4">
                  <h6>🎯 LapTimer 功能說明</h6>
                  <ul className="mb-0 small">
                    <li>
                      ✅ <strong>分圈計時</strong> - 記錄每個分圈的時間
                    </li>
                    <li>
                      ✅ <strong>暫停功能</strong> - 暫停時間不會計入淨時間
                    </li>
                    <li>
                      ✅ <strong>淨時間計算</strong> - 自動排除暫停時間
                    </li>
                    <li>
                      ✅ <strong>時間戳記錄</strong> - 每個分圈都有精確的時間戳
                    </li>
                    <li>
                      ✅ <strong>語音輸入</strong> - 支援語音描述分圈
                    </li>
                  </ul>
                </Alert>

                {/* 清除按鈕 */}
                <div className="text-center">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleClearStorage}
                  >
                    清除所有記錄
                  </Button>
                </div>
              </Col>

              {/* 右側：記錄顯示區域 */}
              <Col lg={6} className="p-4">
                <div className="h-100 d-flex flex-column">
                  {/* 分圈記錄列表 */}
                  {laps.length > 0 && (
                    <div className="mb-4">
                      <h5 className="mb-3">🏁 分圈記錄</h5>
                      <div
                        className="list-group"
                        style={{ maxHeight: '300px', overflowY: 'auto' }}
                      >
                        {laps.map((lap) => (
                          <div key={lap.id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>分圈 {lap.lapNumber}:</strong>{' '}
                                {lap.description}
                                <div className="text-muted small">
                                  開始: {formatTimeDisplay(lap.startTime)} |
                                  結束: {formatTimeDisplay(lap.endTime)} | 用時:{' '}
                                  {formatTime(lap.duration)}
                                </div>
                              </div>
                              <Badge bg="primary" className="fs-6">
                                {formatTime(lap.duration)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 暫停記錄 */}
                  {pausePeriods.length > 0 && (
                    <div className="mb-4">
                      <h5 className="mb-3">⏸️ 暫停記錄</h5>
                      <div
                        className="list-group"
                        style={{ maxHeight: '200px', overflowY: 'auto' }}
                      >
                        {pausePeriods.map((pause, index) => (
                          <div key={index} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <strong>暫停 {index + 1}:</strong>
                                <div className="text-muted small">
                                  開始: {formatTimeDisplay(pause.start)} | 結束:{' '}
                                  {formatTimeDisplay(pause.end)} | 暫停時間:{' '}
                                  {formatTime(pause.duration)}
                                </div>
                              </div>
                              <Badge bg="warning" className="fs-6">
                                {formatTime(pause.duration)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 如果沒有記錄，顯示提示 */}
                  {laps.length === 0 && pausePeriods.length === 0 && (
                    <div className="text-center text-muted mt-5">
                      <div className="display-6 mb-3">📊</div>
                      <h5>尚未有記錄</h5>
                      <p>開始計時並記錄分圈，記錄將顯示在這裡</p>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </div>
  )
}
