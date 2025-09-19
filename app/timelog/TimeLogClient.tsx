'use client'
import React from 'react'

import { useState, useEffect, useRef } from 'react'

export default function TimeLogClient() {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [lastStepTime, setLastStepTime] = useState<Date | null>(null)
  const [steps, setSteps] = useState<any[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const stepListRef = useRef<HTMLOListElement | null>(null)

  // 即時時間更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleStart = () => {
    if (!title.trim()) return alert('請先輸入活動名稱')
    if (startTime && !endTime) return alert('活動尚未結束')

    const now = new Date()
    setStartTime(now)
    setLastStepTime(now)
    setEndTime(null)

    setSteps((prev) => [
      ...prev,
      {
        type: 'start',
        text: `✅ 開始：${title} | ${now.toLocaleString()}`,
      },
    ])
  }
  const handleSaveToDB = async () => {
    if (!title.trim()) return alert('請先輸入活動名稱')
    if (!startTime) return alert('活動尚未開始')
    if (!endTime) return alert('活動尚未結束')

    try {
      // 儲存主活動（TimeLog）
      const timeLogRes = await fetch('/api/timelog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          startTime,
          endTime,
          steps
        }),
      })

      if (!timeLogRes.ok) throw new Error('Failed to save TimeLog')
      const newLog = await timeLogRes.json()
      
      // 再一一儲存每個 Step
      for (const step of steps) {
        const stepRes = await fetch('/api/step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timeLogId: newLog.id,
            description: step.text,
            timestamp: new Date(),
            type: step.type
          }),
        })
        
        if (!stepRes.ok) throw new Error('Failed to save step')
      }

      console.log('✅ 成功儲存所有資料')
      alert('已儲存到資料庫')
    } catch (err) {
      console.error('❌ 儲存錯誤:', err)
      alert('儲存失敗，請檢查伺服器')
    }
  }


  const handleAddStep = () => {
    if (!desc.trim()) return alert('請輸入階段描述')
    if (!startTime) return alert('請先按開始')

    const now = new Date()
    const diffFromStart = formatDiff(now.getTime() - startTime.getTime())
    const diffFromLastTime = lastStepTime
      ? formatDiff(now.getTime() - lastStepTime.getTime())
      : '0:00'

    const stepText = `${desc}｜${now.toLocaleString()}｜(+${diffFromStart})｜Δ${diffFromLastTime}`

    setSteps((prev) => [
      ...prev,
      {
        type: 'step',
        text: stepText,
        ended: false,
      },
    ])

    setLastStepTime(now)
    setDesc('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddStep()
  }

  const handleEndSubStep = (index: number) => {
    const now = new Date().toLocaleString()
    setSteps((prev) =>
      prev.map((s, i) =>
        i === index
          ? { ...s, text: `${s.text} 🛑 結束時間：${now}`, ended: true }
          : s
      )
    )
  }
  // 每個子項目結束
  
  const handleEnd = () => {
    if (!startTime) return alert('請先按下開始')
    if (endTime) return alert('活動已經結束')

    const now = new Date()
    setEndTime(now)

    setSteps((prev) => [
      ...prev,
      {
        type: 'end',
        text: `🛑 結束：${title} | ${now.toLocaleString()}`,
      },
    ])
  }
  // 全部結束

  function formatDiff(ms: number) {
    const totalSec = Math.floor(ms / 1000)
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <main className="container py-5 bg-light">
      <div className="mb-4">
        <button className="btn btn-info mb-4" onClick={handleSaveToDB}>
          儲存活動資訊到資料庫
        </button>

        <label htmlFor="titleInput" className="form-label">
          活動名稱
        </label>
        <input
          type="text"
          id="titleInput"
          className="form-control mb-2"
          placeholder="輸入活動大名"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {/* 狀態指示器 */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <span className="badge bg-secondary me-2">目前時間</span>
              <span className="fw-bold">{currentTime.toLocaleTimeString()}</span>
            </div>
            <div>
              <span className={`badge ${startTime && !endTime ? 'bg-success' : endTime ? 'bg-danger' : 'bg-secondary'}`}>
                {startTime && !endTime ? '進行中' : endTime ? '已結束' : '準備中'}
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
                    : `${Math.floor((currentTime.getTime() - startTime.getTime()) / 1000 / 60)} 分鐘`
                  }
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
          >
            {startTime && !endTime ? '⏸️ 進行中' : '▶️ Start'}
          </button>
          <button 
            className="btn btn-warning flex-grow-1" 
            disabled={!startTime || !!endTime}
            onClick={handleAddStep}
          >
            ⏱️ Laps
          </button>
          <button 
            className={`btn flex-grow-1 ${endTime ? 'btn-outline-danger' : 'btn-danger'}`} 
            onClick={handleEnd}
            disabled={!startTime || !!endTime}
          >
            {endTime ? '✅ 已結束' : '⏹️ End'}
          </button>
        </div>
      </div>

      <div className="mb-3">
        <div className="d-flex gap-2">
          <input
            type="text"
            id="stepDescription"
            className="form-control"
            placeholder="輸入階段性描述 (按 Enter 快速記錄)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!startTime || !!endTime}
          />
          <button
            className="btn btn-outline-info"
            type="button"
            onClick={() => alert('語音功能尚未整合')}
            disabled={!startTime || !!endTime}
            title="語音輸入功能"
          >
            🎤 語音
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleAddStep}
            disabled={!startTime || !!endTime || !desc.trim()}
          >
            📝 記錄
          </button>
        </div>
      </div>

      {/* 步驟列表 */}
      <div className="mb-3">
        <h6 className="text-muted mb-2">
          📋 活動記錄 ({steps.length} 個步驟)
        </h6>
        <ol className="list-group list-group-numbered" ref={stepListRef}>
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
                  {step.type === 'start' ? '🚀' : step.type === 'end' ? '🏁' : '📍'}
                </span>
                {step.text}
              </div>
              {step.type === 'step' && !step.ended && (
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleEndSubStep(i)}
                >
                  ⏹️ 結束
                </button>
              )}
            </li>
          ))}
        </ol>
      </div>
    </main>
  )
}
