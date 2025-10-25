'use client'
import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useTimeLogStore } from '@/stores/useTimeLogStore'
import VoiceInput from './VoiceInput'
import { Tooltip, OverlayTrigger, Col } from 'react-bootstrap'
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
    reset,
    getElapsedMinutes,
    getActivityStatus,
  } = useTimeLogStore()

  const stepListRef = useRef<HTMLOListElement | null>(null) // 步驟列表的 DOM 引用

  /*
    ===== TypeScript 型別註解說明 =====
    HTMLOListElement 是 HTML 有序列表元素 (Ordered List Element) 的型別
    - HTMLOListElement 繼承自 HTMLElement，不是 HTMLCollection 的子類
    - HTMLCollection 是元素集合的介面，不是元素本身的型別
    - HTMLOListElement 專門用於 <ol> 標籤，提供有序列表特有的屬性和方法
    - 使用 useRef 可以獲取 DOM 元素的引用，用於滾動、聚焦等操作
  */
  // ===== 客戶端渲染標記 =====
  useEffect(() => {
    setClient(true)
  }, [setClient])

  // 針對帳號切換/未登入狀態，保險清空 timelog 狀態，避免跨帳資料殘留
  const prevUserIdRef = useRef<number | null>(null)
  useEffect(() => {
    const currentUserId = user?.user_id ?? null
    const prevUserId = prevUserIdRef.current

    // 情境一：未登入（或剛登出後進入頁面）
    if (!isAuth) {
      try {
        clearStorage()
        reset?.()
      } catch {
        // ignore
      }
    }

    // 情境二：帳號變更（從 A 切到 B）
    if (
      prevUserId !== null &&
      currentUserId !== null &&
      prevUserId !== currentUserId
    ) {
      try {
        clearStorage()
        reset?.()
      } catch {
        // ignore
      }
    }

    prevUserIdRef.current = currentUserId
  }, [isAuth, user?.user_id, clearStorage, reset])

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

  // 語音切換函數
  const [voiceToggleFn, setVoiceToggleFn] = useState<(() => void) | null>(null)

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div
        className="card-header border-bottom"
        style={{
          background:
            'var(--primary-bg, linear-gradient(135deg, #0dcaf0, #0aa2c0))',
          color: 'var(--text-primary, #ffffff)',
          borderBottom: '1px solid var(--accent-color, #0dcaf0)',
        }}
      >
        {/*
          ===== 響應式布局說明 =====
          問題：原本使用 flexbox 在手機版會導致輸入框被壓縮
          解決：改用 Bootstrap 響應式網格系統

          布局結構：
          - 手機版 (xs): 標題佔滿整行，輸入框佔滿整行
          - 平板版 (sm): 標題佔 4 欄，輸入框佔 8 欄
          - 桌面版 (md+): 標題佔 3 欄，標籤佔 2 欄，輸入框佔 6 欄，狀態佔 1 欄
        */}
        <div className="row align-items-center">
          {/* 標題區域 */}
          <Col xs={12} sm={4} md={3}>
            <h5 className="mb-0 mb-2 mb-md-0">⏱️ 時間記錄工具</h5>
          </Col>

          {/* 標籤區域 - 只在桌面版顯示 */}
          <Col md={2} className="d-none d-md-block">
            <label
              htmlFor="titleInput"
              className="form-label mb-0 fw-bold"
              style={{ color: 'var(--text-primary, #ffffff)' }}
            >
              📝 輸入活動名稱
            </label>
          </Col>

          {/* 輸入框區域 */}
          <Col xs={12} sm={8} md={6}>
            <input
              type="text"
              id="titleInput"
              className="form-control"
              placeholder="輸入活動名稱"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="活動名稱輸入框"
            />
          </Col>

          {/* 狀態區域 - 只在桌面版顯示 */}
          <Col md={1} className="d-none d-md-block">
            <span
              className="text-end d-block"
              style={{
                color: 'var(--text-secondary, rgba(255, 255, 255, 0.8))',
                fontSize: '0.9rem',
              }}
            >
              卡片數量: 1/4
            </span>
          </Col>
        </div>
      </div>
      <div className="card-body">
        {/*
          ===== 語音輸入元件說明 =====
          onResult 是自定義的屬性，不是內建的

          語法說明：
          - VoiceInput 是我們自定義的 React 組件
          - onResult 是我們定義的 props 屬性，型別為 (text: string) => void
          - handleVoiceResult 是父組件傳入的函數
          - 當語音識別完成時，子組件會調用 onResult(text) 通知父組件

          數據流向：
          子組件 (VoiceInput) → 語音識別結果 → 父組件 (TimeLogClient) → 更新狀態
        */}
        <VoiceInput
          onResult={handleVoiceResult}
          onVoiceToggle={setVoiceToggleFn}
        />
        {/* ===== 主要控制區域 ===== */}
        <div className="mb-4">
          {/* 四個按鈕並排 */}
          <div className="row mb-4">
            {/* 開始按鈕 */}
            <div className="col-6 col-md-3 mb-2">
              <button
                className={`btn w-100 ${
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
                    : '▶️ 開始'}
              </button>
            </div>
            {/* 儲存按鈕 */}
            <div className="col-6 col-md-3 mb-2">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip
                    id="save-tooltip"
                    style={{
                      backgroundColor: 'var(--tooltip-bg, #2d3748)',
                      color: 'var(--tooltip-text, #ffffff)',
                      border: '1px solid var(--tooltip-border, #4a5568)',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      padding: '0.75rem 1rem',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      maxWidth: '300px',
                      textAlign: 'justify',
                      lineHeight: '1.4',
                    }}
                  >
                    {isAuth
                      ? steps.some(
                          (step: any) => !step.ended && step.type === 'step'
                        )
                        ? '⚠️ 提醒：檢測到未完成的步驟！建議先點擊各步驟的「結束」按鈕記錄您預期的結束時間，再儲存到資料庫，這樣可以更準確地記錄您的實際工作時間'
                        : '儲存活動資訊到資料庫'
                      : '請先登入才能儲存到資料庫'}
                  </Tooltip>
                }
              >
                <button
                  className={`btn w-100 ${isAuth ? 'btn-info' : 'btn-outline-secondary'}`}
                  onClick={handleSaveToDB}
                  disabled={!isAuth}
                  aria-label={
                    isAuth ? '儲存活動資訊到資料庫' : '請先登入才能儲存到資料庫'
                  }
                  style={{
                    background: isAuth
                      ? 'var(--button-bg2, linear-gradient(45deg, #28a745, #20c997))'
                      : undefined,
                    color: isAuth ? 'var(--button-text, #ffffff)' : undefined,
                    border: isAuth ? 'none' : undefined,
                    borderRadius: isAuth ? '8px' : undefined,
                    transition: isAuth ? 'all 0.3s ease' : undefined,
                    boxShadow: isAuth
                      ? 'var(--button-shadow2, 0 2px 8px rgba(40, 167, 69, 0.3))'
                      : undefined,
                  }}
                  onMouseEnter={(e) => {
                    if (isAuth) {
                      const target = e.target as HTMLButtonElement
                      target.style.background =
                        'var(--button-hover2, linear-gradient(45deg, #20c997, #17a2b8))'
                      target.style.transform = 'translateY(-1px)'
                      target.style.boxShadow =
                        'var(--button-shadow2, 0 4px 12px rgba(40, 167, 69, 0.4))'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isAuth) {
                      const target = e.target as HTMLButtonElement
                      target.style.background =
                        'var(--button-bg2, linear-gradient(45deg, #28a745, #20c997))'
                      target.style.transform = 'translateY(0)'
                      target.style.boxShadow =
                        'var(--button-shadow2, 0 2px 8px rgba(40, 167, 69, 0.3))'
                    }
                  }}
                >
                  {isAuth ? '💾 儲存本次活動到資料庫' : '🔒 請登入'}
                </button>
              </OverlayTrigger>
            </div>

            {/* 清除按鈕 */}
            <div className="col-6 col-md-3 mb-2">
              <button
                className="btn w-100"
                onClick={handleClearStorage}
                title="清除所有活動記錄"
                aria-label="清除所有活動記錄"
                style={{
                  background:
                    'var(--button-bg, linear-gradient(45deg, #ffc107, #ff8f00))',
                  color: 'var(--button-text, #000000)',
                  border: 'none',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow:
                    'var(--button-shadow, 0 2px 8px rgba(255, 193, 7, 0.3))',
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLButtonElement
                  target.style.background =
                    'var(--button-hover, linear-gradient(45deg, #ff8f00, #ff6f00))'
                  target.style.transform = 'translateY(-1px)'
                  target.style.boxShadow =
                    'var(--button-shadow, 0 4px 12px rgba(255, 193, 7, 0.4))'
                }}
              >
                🗑️ 清除本頁活動記錄
              </button>
            </div>

            {/* 結束按鈕 */}
            <div className="col-6 col-md-3 mb-2">
              <button
                className={`btn w-100 ${
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
                    : '⏹️ 結束'}
              </button>
            </div>
          </div>

          {/* 狀態指示器 */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <span className="badge bg-secondary me-2">目前時間</span>
                <span className="fw-bold">
                  {isClient
                    ? currentTime
                      ? currentTime.toLocaleTimeString()
                      : '載入中...'
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
          </div>
        </div>

        {/*
          ===== 階段記錄區域響應式布局 =====
          問題：手機版輸入框和按鈕會被壓縮
          解決：使用 Bootstrap 響應式網格，在不同螢幕尺寸下調整布局

          布局結構：
          - 手機版 (xs): 標籤和輸入框各佔一行，按鈕佔一行
          - 平板版 (sm): 標籤佔 3 欄，輸入框佔 6 欄，按鈕佔 3 欄
          - 桌面版 (md+): 標籤佔 2 欄，輸入框佔 6 欄，按鈕佔 4 欄
        */}
        <div className="row align-items-center mb-3">
          {/* 標籤區域 */}
          <Col xs={12} sm={3} md={2} className="mb-2 mb-sm-0">
            <label
              htmlFor="stepDescription"
              className="form-label fw-bold text-dark mb-0"
            >
              📝 記錄活動階段
            </label>
          </Col>

          {/* 輸入框區域 */}
          <Col xs={12} sm={6} md={6} className="mb-2 mb-sm-0">
            <input
              type="text"
              id="stepDescription"
              className="form-control"
              placeholder="描述當前階段 (按 Enter 快速記錄時間點)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!startTime || getActivityStatus() === '已結束'}
              aria-label="階段描述輸入框"
              style={{
                opacity:
                  !startTime || getActivityStatus() === '已結束' ? 0.6 : 1,
              }}
            />
          </Col>

          {/* 按鈕區域 */}
          <Col xs={12} sm={3} md={4}>
            <div className="d-flex gap-2 justify-content-start justify-content-sm-end">
              <button
                className="btn btn-outline-info"
                type="button"
                disabled={!startTime || getActivityStatus() === '已結束'}
                title="語音輸入功能"
                aria-label="語音輸入功能"
                style={{
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content',
                }}
                onClick={() => {
                  // 調用語音切換函數
                  if (voiceToggleFn) {
                    voiceToggleFn()
                  }
                }}
              >
                🎤 語音
              </button>
              <button
                className="btn"
                type="button"
                onClick={handleAddStep}
                disabled={
                  !startTime || getActivityStatus() === '已結束' || !desc.trim()
                }
                aria-label="記錄時間點"
                style={{
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content',
                  background:
                    'var(--button-bg, linear-gradient(45deg, #0dcaf0, #0aa2c0))',
                  color: 'var(--button-text, #ffffff)',
                  border: 'none',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow:
                    'var(--button-shadow, 0 2px 8px rgba(13, 202, 240, 0.3))',
                }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLButtonElement
                  if (!target.disabled) {
                    target.style.background =
                      'var(--button-hover, linear-gradient(45deg, #0aa2c0, #087990))'
                    target.style.transform = 'translateY(-1px)'
                    target.style.boxShadow =
                      'var(--button-shadow, 0 4px 12px rgba(13, 202, 240, 0.4))'
                  }
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLButtonElement
                  target.style.background =
                    'var(--button-bg, linear-gradient(45deg, #0dcaf0, #0aa2c0))'
                  target.style.transform = 'translateY(0)'
                  target.style.boxShadow =
                    'var(--button-shadow, 0 2px 8px rgba(13, 202, 240, 0.3))'
                }}
              >
                ⏱️ 記錄時間點
              </button>
            </div>
          </Col>
        </div>
        <small className="text-muted">
          💡 提示：輸入描述後按 Enter 或點擊「記錄時間點」來標記當前進度
        </small>

        {/* 步驟列表 */}
        <div className="mb-3">
          <h6 className="text-muted mb-2">
            📋 活動記錄 ({steps.length} 個步驟)
          </h6>
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
                      // {/*
                      //   步驟「結束」按鈕的 OverlayTrigger：
                      //   只有當步驟未完成時才顯示此 tooltip
                      //   提醒用戶先手動結束步驟以記錄更準確的時間
                      // */}
                      <OverlayTrigger
                        placement="top" // tooltip 顯示在按鈕上方
                        overlay={
                          <Tooltip
                            id={`step-tooltip-${i}`} // 使用步驟索引作為唯一 ID
                            style={{
                              // 與儲存按鈕相同的樣式，保持一致性
                              backgroundColor: 'var(--tooltip-bg, #2d3748)',
                              color: 'var(--tooltip-text, #ffffff)',
                              border:
                                '1px solid var(--tooltip-border, #4a5568)',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              padding: '0.75rem 1rem',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                              maxWidth: '280px', // 稍微窄一點，因為文字較短
                              textAlign: 'justify',
                              lineHeight: '1.4',
                            }}
                          >
                            {/*
                              固定的 tooltip 內容：
                              提醒用戶先手動結束步驟，再儲存到資料庫
                              這樣可以記錄更準確的實際工作時間
                            */}
                            💡
                            建議：先點擊「結束」記錄您預期的結束時間，再儲存到資料庫，這樣可以更準確地記錄您的實際工作時間
                          </Tooltip>
                        }
                      >
                        {/*
                          觸發元素：「結束」按鈕
                          當用戶滑鼠懸停時，會顯示上方的建議 tooltip
                        */}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleEndSubStep(i)}
                        >
                          ⏹️ 結束
                        </button>
                      </OverlayTrigger>
                    )}
                    {step.ended && (
                      <span className="badge bg-success">✅ 已完成</span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>
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
  )
}
