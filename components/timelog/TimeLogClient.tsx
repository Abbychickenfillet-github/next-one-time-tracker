'use client'
import React from 'react'
import { useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useTimeLogStore } from '@/stores/useTimeLogStore'
import VoiceInput from './VoiceInput'

export default function TimeLogClient() {
  // ===== 用戶認證 =====
  const { user: authUser, isAuth } = useAuth()
  const user: any = authUser || null

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
    saveToDB,
    clearStorage,
    getElapsedMinutes,
    getActivityStatus,
  } = useTimeLogStore()

  const stepListRef = useRef<HTMLOListElement | null>(null) // 步驟列表的 DOM 引用

  // ===== 客戶端渲染標記 =====
  useEffect(() => {
    setClient(true)
  }, [setClient])

  // ===== 即時時間更新 =====
  // 對應: 目前時間顯示 (每秒更新一次)
  useEffect(() => {
    if (!isClient) return

    // 立即設定初始時間
    updateCurrentTime()

    const timer = setInterval(() => {
      updateCurrentTime()
    }, 1000)

    return () => clearInterval(timer)
  }, [isClient, updateCurrentTime])

  // ===== 開始活動 =====
  // 對應: Start 按鈕 (綠色按鈕)
  const handleStart = () => {
    startActivity()
  }

  // ===== 儲存到資料庫 =====
  // 對應: 儲存活動資訊到資料庫按鈕 (藍色按鈕)
  const handleSaveToDB = async () => {
    await saveToDB(user, isAuth)
  }

  // ===== 清除 localStorage =====
  // 對應: 清除活動記錄按鈕
  const handleClearStorage = () => {
    if (confirm('確定要清除所有活動記錄嗎？此操作無法復原。')) {
      clearStorage()
      alert('已清除所有活動記錄')
    }
  }

  // ===== 新增階段步驟 =====
  // 對應: 記錄時間點按鈕 (藍色按鈕)
  const handleAddStep = () => {
    addStep()
  }

  // ===== 結束子步驟 =====
  // 對應: 步驟列表中的「結束」按鈕 (紅色按鈕)
  const handleEndSubStep = (index: number) => {
    endSubStep(index)
  }

  // ===== 結束活動 =====
  // 對應: End 按鈕 (紅色按鈕)
  const handleEnd = () => {
    endActivity()
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
  const handleVoiceResultWrapper = (text: string) => {
    handleVoiceResult(text) // 將語音識別結果填入描述輸入框
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
                您可以測試時間記錄功能，但需要登入才能儲存到資料庫。否則只能在本地端儲存。可以按清除活動紀錄刪除訪客模式當前紀錄。
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
      <VoiceInput onResult={handleVoiceResultWrapper} />

      {/* ===== 主要控制區域 ===== */}
      <div className="mb-4">
        {/* 儲存和清除按鈕 */}
        <div className="row mb-4">
          <div className="col-12 col-md-6">
            <button
              className={`btn w-100 ${isAuth ? 'btn-info' : 'btn-outline-secondary'}`}
              onClick={handleSaveToDB}
              disabled={!isAuth}
              title={
                isAuth ? '儲存活動資訊到資料庫' : '請先登入才能儲存到資料庫'
              }
              aria-label={
                isAuth ? '儲存活動資訊到資料庫' : '請先登入才能儲存到資料庫'
              }
            >
              {isAuth ? '💾 儲存活動資訊到資料庫' : '🔒 請先登入才能儲存'}
            </button>
          </div>
          <div className="col-12 col-md-6 mt-2 mt-md-0">
            <button
              className="btn btn-outline-warning w-100"
              onClick={handleClearStorage}
              title="清除所有活動記錄"
              aria-label="清除所有活動記錄"
            >
              🗑️ 清除本頁活動記錄
            </button>
          </div>
        </div>

        {/* 活動名稱輸入框和開始/結束按鈕在同一行 */}
        <div className="row d-md-flex align-items-center">
          {/* 活動名稱標題 */}
          <div className="col-12 col-md-3 mb-3 mb-md-0">
            <label
              htmlFor="titleInput"
              className="animate__animated animate__fadeInDown animate__delay-1s text-center d-block"
              style={{
                fontWeight: 'bold',
                margin: '0 auto',
                fontSize: '25px',
                background:
                  'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3, #54a0ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
              }}
            >
              📝 活動名稱
            </label>
          </div>

          {/* 活動名稱輸入框 */}
          <div className="col-12 col-md-4 mb-3 mb-md-0">
            <input
              type="text"
              id="titleInput"
              className="form-control animate__animated animate__fadeInUp animate__delay-2s"
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
                e.target.style.boxShadow =
                  '0 0 0 0.2rem rgba(13, 110, 253, 0.25)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#dee2e6'
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
          </div>

          {/* 開始/結束按鈕 */}
          <div className="col-12 col-md-5">
            <div className="d-flex gap-2">
              {/* 開始 */}
              <button
                className={`btn flex-grow-1 ${
                  !isClient
                    ? 'btn-outline-success'
                    : getActivityStatus() === '進行中'
                      ? 'btn-outline-success'
                      : 'btn-success'
                }`}
                onClick={handleStart}
                disabled={!isClient ? false : getActivityStatus() === '進行中'}
                aria-label="開始記錄時間"
              >
                {!isClient
                  ? '載入中...'
                  : getActivityStatus() === '進行中'
                    ? '⏸️ 進行中'
                    : '▶️ Start'}
              </button>
              <button
                className={`btn flex-grow-1 ${
                  !isClient
                    ? 'btn-outline-danger'
                    : getActivityStatus() === '已結束'
                      ? 'btn-outline-danger'
                      : 'btn-danger'
                }`}
                onClick={handleEnd}
                disabled={
                  !startTime ||
                  (!isClient ? false : getActivityStatus() === '已結束')
                }
                aria-label="結束記錄時間"
              >
                {!isClient
                  ? '載入中...'
                  : getActivityStatus() === '已結束'
                    ? '已結束'
                    : '⏹️ End'}
              </button>
            </div>
          </div>
        </div>

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
                className={`badge ${
                  !isClient
                    ? 'bg-secondary'
                    : getActivityStatus() === '進行中'
                      ? 'bg-success'
                      : getActivityStatus() === '已結束'
                        ? 'bg-danger'
                        : 'bg-secondary'
                }`}
              >
                {!isClient ? '載入中...' : getActivityStatus()}
              </span>
            </div>
          </div>

          {/* 活動時間統計 */}
          {startTime && (
            <div className="row text-center">
              <div className="col-4">
                <small className="text-muted">開始時間</small>
                <div className="fw-bold">
                  {startTime instanceof Date
                    ? startTime.toLocaleTimeString()
                    : '未開始'}
                </div>
              </div>
              <div className="col-4">
                <small className="text-muted">已進行</small>
                <div className="fw-bold text-primary">
                  {getElapsedMinutes()} 分鐘
                </div>
              </div>
              <div className="col-4">
                <small className="text-muted">結束時間</small>
                <div className="fw-bold">
                  {endTime instanceof Date
                    ? endTime.toLocaleTimeString()
                    : '進行中...'}
                </div>
              </div>
            </div>
          )}
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
        <div className="d-flex gap-2 flex-wrap">
          <input
            type="text"
            id="stepDescription"
            className="form-control flex-grow-1"
            placeholder="描述當前階段 (按 Enter 快速記錄時間點)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!startTime || getActivityStatus() === '已結束'}
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
              opacity: !startTime || getActivityStatus() === '已結束' ? 0.6 : 1,
              minWidth: '200px',
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
            disabled={!startTime || getActivityStatus() === '已結束'}
            title="語音輸入功能"
            aria-label="語音輸入功能"
            style={{
              whiteSpace: 'nowrap',
              minWidth: 'fit-content',
            }}
          >
            🎤 語音
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleAddStep}
            disabled={
              !startTime || getActivityStatus() === '已結束' || !desc.trim()
            }
            aria-label="記錄時間點"
            style={{
              whiteSpace: 'nowrap',
              minWidth: 'fit-content',
            }}
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
          {steps.map((step: any, i: number) => (
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
