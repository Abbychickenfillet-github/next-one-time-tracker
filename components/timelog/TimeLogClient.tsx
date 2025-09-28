'use client'
import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import VoiceInput from './VoiceInput'

export default function TimeLogClient() {
  // ===== 用戶認證 =====
  const { user: authUser, isAuth } = useAuth()
  const user: any = authUser || null

  // ===== 狀態管理 =====
  const [title, setTitle] = useState('') // 活動名稱 (對應: 活動名稱輸入框)
  const [desc, setDesc] = useState('') // 階段描述 (對應: 記錄活動階段輸入框)
  const [startTime, setStartTime] = useState<Date | null>(null) // 活動開始時間 (對應: 開始按鈕)
  const [endTime, setEndTime] = useState<Date | null>(null) // 活動結束時間 (對應: 結束按鈕)
  const [steps, setSteps] = useState<any[]>([]) // 步驟列表 (對應: 活動記錄列表)
  const [currentTime, setCurrentTime] = useState<Date | null>(null) // 目前時間 (對應: 目前時間顯示)
  const [isClient, setIsClient] = useState(false) // 客戶端渲染標記
  const [, setLastStepTime] = useState<Date | null>(null) // 最後步驟時間
  const stepListRef = useRef<HTMLOListElement | null>(null) // 步驟列表的 DOM 引用

  // ===== 客戶端渲染標記 =====
  useEffect(() => {
    setIsClient(true)
  }, [])

  // ===== 即時時間更新 =====
  // 對應: 目前時間顯示 (每秒更新一次)
  useEffect(() => {
    if (!isClient) return

    // 立即設定初始時間
    setCurrentTime(new Date())

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [isClient])

  // ===== 開始活動 =====
  // 對應: Start 按鈕 (綠色按鈕)
  const handleStart = () => {
    if (!title.trim()) return alert('請先輸入活動名稱')
    if (startTime && !endTime) return alert('活動尚未結束')

    const now = new Date()
    setStartTime(now) // 設定活動開始時間
    setLastStepTime(now) // 設定最後步驟時間
    setEndTime(null) // 清除結束時間

    // 在步驟列表中加入開始記錄
    setSteps((prev) => [
      ...prev,
      {
        type: 'start',
        text: `✅ 開始：${title} | ${now.toLocaleString()}`,
        startTime: now,
        endTime: now,
        ended: true, // 開始步驟預設為已結束
      },
    ])
  }

  // ===== 儲存到資料庫 =====
  // 對應: 儲存活動資訊到資料庫按鈕 (藍色按鈕)
  const handleSaveToDB = async () => {
    if (!title.trim()) return alert('請先輸入活動名稱')
    if (!startTime) return alert('活動尚未開始')
    if (!endTime) return alert('活動尚未結束')

    // 檢查是否已登入
    if (!isAuth) {
      alert('請先登入才能儲存到資料庫')
      return
    }

    try {
      // 儲存主活動到 TimeLog 資料表
      const timeLogRes = await fetch('/api/timelog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          startTime,
          endTime,
          userId: user?.id || null, // 加入用戶 ID
        }),
      })

      if (!timeLogRes.ok) throw new Error('Failed to save TimeLog')
      const timeLogResult = await timeLogRes.json()

      if (timeLogResult.status !== 'success') {
        throw new Error(timeLogResult.message || 'Failed to save TimeLog')
      }

      const newLog = timeLogResult.data
      console.log('✅ TimeLog 創建成功:', newLog)

      // 儲存所有步驟到 Step 資料表
      for (const step of steps) {
        if (step.type === 'step') {
          // 只儲存實際的步驟，不儲存 start/end 記錄
          const stepRes = await fetch('/api/step', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              timeLogId: newLog.id, // 關聯到主活動
              title: step.title || step.text,
              description: step.description || step.text,
              startTime: step.startTime || new Date(),
              endTime: step.endTime,
            }),
          })

          if (!stepRes.ok) throw new Error('Failed to save step')

          const stepResult = await stepRes.json()
          if (stepResult.status !== 'success') {
            throw new Error(stepResult.message || 'Failed to save step')
          }

          console.log('✅ Step 創建成功:', stepResult.data)
        }
      }

      console.log('✅ 成功儲存所有資料')
      alert('已儲存到資料庫')
    } catch (err) {
      console.error('❌ 儲存錯誤:', err)
      alert('儲存失敗，請檢查伺服器')
    }
  }

  // ===== 新增階段步驟 =====
  // 對應: 記錄時間點按鈕 (藍色按鈕)
  const handleAddStep = () => {
    if (!desc.trim()) return alert('請輸入階段描述')
    if (!startTime) return alert('請先開始活動')
    if (endTime) return alert('活動已結束')

    const now = new Date()
    setLastStepTime(now) // 更新最後步驟時間

    // 在步驟列表中加入新的階段記錄
    setSteps((prev) => [
      ...prev,
      {
        type: 'step',
        title: desc,
        description: desc,
        text: `📍 ${desc} | ${now.toLocaleString()}`,
        startTime: now,
        endTime: null,
        ended: false,
      },
    ])

    setDesc('') // 清空描述輸入框
  }

  // ===== 結束子步驟 =====
  // 對應: 步驟列表中的「結束」按鈕 (紅色按鈕)
  const handleEndSubStep = (index: number) => {
    const now = new Date()
    setSteps((prev) =>
      prev.map((step, i) =>
        i === index
          ? {
              ...step,
              ended: true, // 標記為已結束
              endTime: now, // 記錄結束時間
              text: step.text + ` (結束於: ${now.toLocaleTimeString()})`,
              description:
                step.description + ` (結束於: ${now.toLocaleTimeString()})`,
            }
          : step
      )
    )
  }

  // ===== 結束活動 =====
  // 對應: End 按鈕 (紅色按鈕)
  const handleEnd = () => {
    if (!startTime) return alert('請先開始活動')
    if (endTime) return alert('活動已結束')

    const now = new Date()
    setEndTime(now) // 設定活動結束時間

    // 在步驟列表中加入結束記錄
    setSteps((prev) => [
      ...prev,
      {
        type: 'end',
        title: `結束：${title}`,
        description: `活動結束：${title}`,
        text: `🏁 結束：${title} | ${now.toLocaleString()}`,
        startTime: now,
        endTime: now,
        ended: true, // 結束步驟預設為已結束
      },
    ])
  }

  // ===== 鍵盤快捷鍵 =====
  // 對應: 階段描述輸入框 (按 Enter 快速記錄)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddStep() // 按 Enter 等同於點擊「記錄時間點」
    }
  }

  // ===== 語音輸入處理 =====
  // 對應: 語音輸入元件
  const handleVoiceResult = (text: string) => {
    setDesc(text) // 將語音識別結果填入描述輸入框
  }

  return (
    <main className="container mt-4">
      {/* ===== 用戶資訊顯示 ===== */}
      {isAuth ? (
        <div className="alert alert-info mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>👤 當前用戶:</strong> {user?.name || user?.email}
              <br />
              <small className="text-muted">用戶 ID: {user?.user_id}</small>
            </div>
            <div>
              <span className="badge bg-success">已登入</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-warning mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>👤 訪客模式</strong>
              <br />
              <small className="text-muted">
                您可以測試時間記錄功能，但需要登入才能儲存到資料庫
              </small>
            </div>
            <div>
              <span className="badge bg-warning">未登入</span>
              <a href="/user/login" className="btn btn-sm btn-primary ms-2">
                登入
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ===== 語音輸入元件 ===== */}
      <VoiceInput onResult={handleVoiceResult} />

      {/* ===== 主要控制區域 ===== */}
      <div className="mb-4">
        {/* 儲存到資料庫按鈕 */}
        <button
          className={`btn mb-4 ${isAuth ? 'btn-info' : 'btn-outline-secondary'}`}
          onClick={handleSaveToDB}
          disabled={!isAuth}
          title={isAuth ? '儲存活動資訊到資料庫' : '請先登入才能儲存到資料庫'}
          aria-label={
            isAuth ? '儲存活動資訊到資料庫' : '請先登入才能儲存到資料庫'
          }
        >
          {isAuth ? '💾 儲存活動資訊到資料庫' : '🔒 請先登入才能儲存'}
        </button>

        {/* 活動名稱輸入框 */}
        <label
          htmlFor="titleInput"
          className="form-label fw-bold text-dark mb-2 text-center animate__animated animate__fadeInDown animate__delay-1s"
        >
          📝 活動名稱
        </label>
        <input
          type="text"
          id="titleInput"
          className="form-control mb-2 animate__animated animate__fadeInUp animate__delay-2s"
          placeholder="輸入活動大名"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="活動名稱輸入框"
          style={{
            backgroundColor: 'white',
            border: '2px solid #dee2e6',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '16px',
            color: '#212529',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#0d6efd'
            e.target.style.boxShadow = '0 0 0 0.2rem rgba(13, 110, 253, 0.25)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#dee2e6'
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
        {/* 狀態指示器 */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <span className="badge bg-secondary me-2">目前時間</span>
              <span className="fw-bold">
                {isClient && currentTime
                  ? currentTime.toLocaleTimeString()
                  : '載入中...'}
              </span>
            </div>
            <div>
              <span
                className={`badge ${startTime && !endTime ? 'bg-success' : endTime ? 'bg-danger' : 'bg-secondary'}`}
              >
                {startTime && !endTime
                  ? '進行中'
                  : endTime
                    ? '已結束'
                    : '準備中'}
              </span>
            </div>
          </div>

          {/* 活動時間統計 */}
          {startTime && (
            <div className="row text-center">
              <div className="col-4">
                <small className="text-muted">開始時間</small>
                <div className="fw-bold">{startTime.toLocaleTimeString()}</div>
              </div>
              <div className="col-4">
                <small className="text-muted">已進行</small>
                <div className="fw-bold text-primary">
                  {endTime
                    ? `${Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60)} 分鐘`
                    : currentTime
                      ? `${Math.floor((currentTime.getTime() - startTime.getTime()) / 1000 / 60)} 分鐘`
                      : '計算中...'}
                </div>
              </div>
              <div className="col-4">
                <small className="text-muted">結束時間</small>
                <div className="fw-bold">
                  {endTime ? endTime.toLocaleTimeString() : '進行中...'}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="d-flex gap-2">
          {/* 開始 */}
          <button
            className={`btn flex-grow-1 ${startTime && !endTime ? 'btn-outline-success' : 'btn-success'}`}
            onClick={handleStart}
            disabled={!!(startTime && !endTime)}
            aria-label="開始記錄時間"
          >
            {startTime && !endTime ? '⏸️ 進行中' : '▶️ Start'}
          </button>
          <button
            className={`btn flex-grow-1 ${endTime ? 'btn-outline-danger' : 'btn-danger'}`}
            onClick={handleEnd}
            disabled={!startTime || !!endTime}
            aria-label="結束記錄時間"
          >
            {endTime ? '✅ 已結束' : '⏹️ End'}
          </button>
        </div>
      </div>

      {/* 階段記錄區域 */}
      <div className="mb-3">
        <label
          htmlFor="stepDescription"
          className="form-label fw-bold text-dark mb-2"
        >
          📝 記錄活動階段
        </label>
        <div className="d-flex gap-2">
          <input
            type="text"
            id="stepDescription"
            className="form-control"
            placeholder="描述當前階段 (按 Enter 快速記錄時間點)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!startTime || !!endTime}
            aria-label="階段描述輸入框"
            style={{
              backgroundColor: 'white',
              border: '2px solid #dee2e6',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '16px',
              color: '#212529',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              opacity: !startTime || !!endTime ? 0.6 : 1,
            }}
            onFocus={(e) => {
              if (!e.target.disabled) {
                e.target.style.borderColor = '#0d6efd'
                e.target.style.boxShadow =
                  '0 0 0 0.2rem rgba(13, 110, 253, 0.25)'
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#dee2e6'
              e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
            }}
          />
          <button
            id="voiceBtn"
            className="btn btn-outline-info"
            type="button"
            disabled={!startTime || !!endTime}
            title="語音輸入功能"
            aria-label="語音輸入功能"
          >
            🎤 語音
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleAddStep}
            disabled={!startTime || !!endTime || !desc.trim()}
            aria-label="記錄時間點"
          >
            ⏱️ 記錄時間點
          </button>
        </div>
        <small className="text-muted">
          💡 提示：輸入描述後按 Enter 或點擊「記錄時間點」來標記當前進度
        </small>
      </div>

      {/* 步驟列表 */}
      <div className="mb-3">
        <h6 className="text-muted mb-2">📋 活動記錄 ({steps.length} 個步驟)</h6>
        <ol
          className="list-group list-group-numbered"
          ref={stepListRef}
          aria-label="活動記錄列表"
        >
          {steps.map((step, i) => (
            <li
              key={i}
              className={`list-group-item d-flex justify-content-between align-items-center ${
                step.type === 'start'
                  ? 'list-group-item-success'
                  : step.type === 'end'
                    ? 'list-group-item-danger'
                    : 'list-group-item-light'
              }`}
            >
              <div className="flex-grow-1">
                <span className="me-2">
                  {step.type === 'start'
                    ? '🚀'
                    : step.type === 'end'
                      ? '🏁'
                      : '📍'}
                </span>
                {step.text}
              </div>
              {step.type === 'step' && (
                <div className="d-flex align-items-center gap-2">
                  {!step.ended && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleEndSubStep(i)}
                    >
                      ⏹️ 結束
                    </button>
                  )}
                  {step.ended && (
                    <span className="badge bg-success">✅ 已完成</span>
                  )}
                  {/* 調試資訊 - 已移除，避免介面混亂 */}
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </main>
  )
}
