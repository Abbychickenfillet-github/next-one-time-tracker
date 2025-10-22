'use client'
import React, { useState, useEffect } from 'react'
import { Button, Alert, Row, Col, Badge, ListGroup } from 'react-bootstrap'
import { useAuth } from '@/hooks/use-auth'

export default function DashboardLapTimer() {
  const { isAuth } = useAuth()
  // const { user } = useAuth() // 暫時未使用，保留供未來使用

  // 狀態管理
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [laps, setLaps] = useState([])
  const [pausePeriods, setPausePeriods] = useState([])
  const [currentLapStartTime, setCurrentLapStartTime] = useState(null)
  const [currentPauseStart, setCurrentPauseStart] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // 即時時間更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 載入用戶的分圈記錄
  useEffect(() => {
    if (isAuth) {
      loadLapTimerData()
    }
  }, [isAuth])

  // 載入分圈計時器資料
  const loadLapTimerData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/lap-timer', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.status === 'success' && data.data) {
          const lapData = data.data
          setTitle(lapData.title || '')
          setDesc(lapData.desc || '')
          setStartTime(lapData.startTime ? new Date(lapData.startTime) : null)
          setEndTime(lapData.endTime ? new Date(lapData.endTime) : null)
          setLaps(lapData.laps || [])
          setPausePeriods(lapData.pausePeriods || [])
          setIsRunning(lapData.isRunning || false)
          setIsPaused(lapData.isPaused || false)
        }
      }
    } catch (error) {
      console.error('載入分圈計時器資料失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 保存分圈計時器資料到資料庫
  const saveLapTimerData = async (data) => {
    try {
      const response = await fetch('/api/lap-timer', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (result.status !== 'success') {
        throw new Error(result.message || '保存失敗')
      }
    } catch (error) {
      console.error('保存分圈計時器資料失敗:', error)
      setError(error.message)
    }
  }

  // 格式化時間
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // 格式化時間顯示
  const formatTimeDisplay = (date) => {
    if (!date) return '--:--:--'

    // 確保 date 是 Date 對象
    let dateObj = date
    if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date)
    }

    // 檢查是否為有效的 Date 對象
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return '--:--:--'
    }

    return dateObj.toLocaleTimeString('zh-TW', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  // 格式化日期顯示
  const formatDateDisplay = (date) => {
    if (!date) return '--/--/--'

    // 確保 date 是 Date 對象
    let dateObj = date
    if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date)
    }

    // 檢查是否為有效的 Date 對象
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return '--/--/--'
    }

    return dateObj.toLocaleDateString('zh-TW')
  }

  // 計算當前經過時間
  const getCurrentElapsedTime = () => {
    if (!startTime) return 0

    const now = currentTime
    const totalDuration = now.getTime() - startTime.getTime()

    // 計算當前暫停時間
    let currentPauseDuration = 0
    if (isPaused && currentPauseStart) {
      currentPauseDuration = now.getTime() - currentPauseStart.getTime()
    }

    // 計算總暫停時間
    const totalPauseDuration =
      pausePeriods.reduce((sum, period) => sum + period.duration, 0) +
      currentPauseDuration

    return totalDuration - totalPauseDuration
  }

  // 獲取活動狀態
  const getActivityStatus = () => {
    if (!isRunning) return '準備中'
    if (isPaused) return '已暫停'
    return '進行中'
  }

  // 開始活動
  const handleStart = async () => {
    if (!title.trim()) {
      alert('請先輸入活動名稱')
      return
    }
    if (isRunning) {
      alert('活動已在進行中')
      return
    }

    const now = new Date()
    const newData = {
      title,
      desc,
      startTime: now,
      currentLapStartTime: now,
      isRunning: true,
      isPaused: false,
      laps: [],
      pausePeriods: [],
      totalElapsedTime: 0,
      netElapsedTime: 0,
    }

    setStartTime(now)
    setCurrentLapStartTime(now)
    setIsRunning(true)
    setIsPaused(false)
    setCurrentPauseStart(null)
    setPausePeriods([])
    setLaps([])

    await saveLapTimerData(newData)
  }

  // 暫停活動
  const handlePause = async () => {
    if (!isRunning || isPaused) {
      alert('活動未在進行中或已暫停')
      return
    }

    const now = new Date()
    setIsPaused(true)
    setCurrentPauseStart(now)

    await saveLapTimerData({
      title,
      desc,
      startTime,
      endTime,
      laps,
      pausePeriods,
      isRunning: true,
      isPaused: true,
      currentPauseStart: now,
    })
  }

  // 恢復活動
  const handleResume = async () => {
    if (!isRunning || !isPaused) {
      alert('活動未在進行中或未暫停')
      return
    }

    const now = new Date()
    const pauseDuration = now.getTime() - currentPauseStart.getTime()

    // 記錄暫停期間
    const newPausePeriods = [
      ...pausePeriods,
      { start: currentPauseStart, end: now, duration: pauseDuration },
    ]

    setIsPaused(false)
    setCurrentPauseStart(null)
    setPausePeriods(newPausePeriods)

    await saveLapTimerData({
      title,
      desc,
      startTime,
      endTime,
      laps,
      pausePeriods: newPausePeriods,
      isRunning: true,
      isPaused: false,
      currentPauseStart: null,
    })
  }

  // 記錄分圈
  const handleRecordLap = async () => {
    if (!isRunning || isPaused) {
      alert('請先開始活動且不能處於暫停狀態')
      return
    }

    const now = new Date()
    const lapDuration = now.getTime() - currentLapStartTime.getTime()

    const newLap = {
      id: Date.now(),
      lapNumber: laps.length + 1,
      startTime: currentLapStartTime,
      endTime: now,
      duration: lapDuration,
      description: desc || `分圈 ${laps.length + 1}`,
      timestamp: now,
    }

    const newLaps = [...laps, newLap]
    setLaps(newLaps)
    setCurrentLapStartTime(now)
    setDesc('') // 清空描述輸入框

    await saveLapTimerData({
      title,
      desc: '',
      startTime,
      endTime,
      laps: newLaps,
      pausePeriods,
      isRunning: true,
      isPaused,
    })
  }

  // 結束活動
  const handleEnd = async () => {
    if (!isRunning) {
      alert('請先開始活動')
      return
    }

    const now = new Date()

    // 如果正在暫停，先結束暫停
    let finalPausePeriods = pausePeriods
    if (isPaused) {
      const pauseDuration = now.getTime() - currentPauseStart.getTime()
      finalPausePeriods = [
        ...pausePeriods,
        {
          start: currentPauseStart,
          end: now,
          duration: pauseDuration,
        },
      ]
    }

    // 計算總時間
    const totalDuration = now.getTime() - startTime.getTime()
    const totalPauseDuration = finalPausePeriods.reduce(
      (sum, period) => sum + period.duration,
      0
    )
    const netDuration = totalDuration - totalPauseDuration

    setEndTime(now)
    setIsRunning(false)
    setIsPaused(false)

    await saveLapTimerData({
      title,
      desc,
      startTime,
      endTime: now,
      laps,
      pausePeriods: finalPausePeriods,
      isRunning: false,
      isPaused: false,
      totalElapsedTime: totalDuration,
      netElapsedTime: netDuration,
    })
  }

  // 重置活動
  const handleReset = async () => {
    if (confirm('確定要重置所有記錄嗎？此操作無法復原。')) {
      const resetData = {
        title: '',
        desc: '',
        startTime: null,
        endTime: null,
        laps: [],
        pausePeriods: [],
        isRunning: false,
        isPaused: false,
        totalElapsedTime: 0,
        netElapsedTime: 0,
      }

      setTitle('')
      setDesc('')
      setStartTime(null)
      setEndTime(null)
      setCurrentLapStartTime(null)
      setIsRunning(false)
      setIsPaused(false)
      setCurrentPauseStart(null)
      setPausePeriods([])
      setLaps([])

      await saveLapTimerData(resetData)
    }
  }

  if (!isAuth) {
    return (
      <Alert variant="warning">
        <Alert.Heading>需要登入</Alert.Heading>
        <p>請先登入以使用分圈計時器功能。</p>
      </Alert>
    )
  }

  return (
    <Row className="g-0">
      {/* 左側：輸入和控制區域 */}
      <Col lg={6} className="p-4 border-end">
        {/* 目前時間顯示 */}
        <div className="text-center mb-4">
          <div className="display-6 text-primary fw-bold">
            {formatTimeDisplay(currentTime)}
          </div>
          <div className="text-muted">{formatDateDisplay(currentTime)}</div>
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

        {/* 計時器顯示 */}
        {isRunning && (
          <div className="text-center mb-4">
            <div className="display-4 text-success fw-bold mb-2">
              {formatTime(getCurrentElapsedTime())}
            </div>
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <Badge bg="info" className="fs-6">
                總時間: {formatTime(getCurrentElapsedTime())}
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
                disabled={!title.trim() || isLoading}
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
                  disabled={isLoading}
                >
                  ⏸️ 暫停
                </Button>
                <Button
                  variant="info"
                  size="lg"
                  onClick={handleRecordLap}
                  disabled={isLoading}
                >
                  🏁 記錄分圈
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  onClick={handleEnd}
                  disabled={isLoading}
                >
                  ⏹️ 結束
                </Button>
              </>
            )}
            {getActivityStatus() === '已暫停' && (
              <>
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleResume}
                  disabled={isLoading}
                >
                  ▶️ 恢復
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  onClick={handleEnd}
                  disabled={isLoading}
                >
                  ⏹️ 結束
                </Button>
              </>
            )}
            {getActivityStatus() === '已結束' && (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStart}
                  disabled={isLoading}
                >
                  🔄 重新開始
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleReset}
                  disabled={isLoading}
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
            <Alert variant="info">
              <strong>活動狀態:</strong> {getActivityStatus()}
              {startTime && (
                <div className="mt-2">
                  <strong>開始時間:</strong> {formatTimeDisplay(startTime)}
                  {endTime && (
                    <>
                      <br />
                      <strong>結束時間:</strong> {formatTimeDisplay(endTime)}
                    </>
                  )}
                </div>
              )}
            </Alert>
          </div>
        )}

        {/* 錯誤顯示 */}
        {error && (
          <Alert variant="danger" className="mb-4">
            <strong>錯誤:</strong> {error}
            <Button
              variant="outline-danger"
              size="sm"
              className="ms-2"
              onClick={() => setError(null)}
            >
              關閉
            </Button>
          </Alert>
        )}

        {/* 功能說明 */}
        <Alert variant="light" className="mb-4">
          <h6>🎯 Dashboard 分圈計時器</h6>
          <ul className="mb-0 small">
            <li>
              ✅ <strong>跨裝置同步</strong> - 資料存儲在資料庫中
            </li>
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
              ✅ <strong>即時同步</strong> - 所有操作即時保存到資料庫
            </li>
          </ul>
        </Alert>
      </Col>

      {/* 右側：記錄顯示區域 */}
      <Col lg={6} className="p-4">
        <div className="h-100 d-flex flex-column">
          {/* 分圈記錄列表 */}
          {laps.length > 0 && (
            <div className="mb-4">
              <h5 className="mb-3">🏁 分圈記錄</h5>
              <ListGroup style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {laps.map((lap) => (
                  <ListGroup.Item key={lap.id}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>分圈 {lap.lapNumber}:</strong> {lap.description}
                        <div className="text-muted small">
                          開始: {formatTimeDisplay(lap.startTime)} | 結束:{' '}
                          {formatTimeDisplay(lap.endTime)} | 用時:{' '}
                          {formatTime(lap.duration)}
                        </div>
                      </div>
                      <Badge bg="primary" className="fs-6">
                        {formatTime(lap.duration)}
                      </Badge>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}

          {/* 暫停記錄 */}
          {pausePeriods.length > 0 && (
            <div className="mb-4">
              <h5 className="mb-3">⏸️ 暫停記錄</h5>
              <ListGroup style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {pausePeriods.map((pause, index) => (
                  <ListGroup.Item key={index}>
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
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}

          {/* 如果沒有記錄，顯示提示 */}
          {laps.length === 0 && pausePeriods.length === 0 && (
            <div className="text-center text-muted mt-5">
              <div className="display-6 mb-3">📊</div>
              <h5>尚未有記錄</h5>
              <p>開始計時並記錄分圈，記錄將顯示在這裡</p>
              <p className="small text-muted">
                所有資料會自動同步到資料庫，支援跨裝置存取
              </p>
            </div>
          )}
        </div>
      </Col>
    </Row>
  )
}
