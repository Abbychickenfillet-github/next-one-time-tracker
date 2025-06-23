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
  const stepListRef = useRef<HTMLOListElement | null>(null)

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
        await fetch('/api/step', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timeLogId: newLog.id,
            description: step.text,
            timestamp: new Date(),
            type: step.type
          }),
        })
      }

      if (!res.ok) throw new Error('Failed to save')
      const data = await res.json()
      console.log('✅ 成功儲存:', data)
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
        <button className="btn btn-info" onClick={handleSaveToDB}>
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
        <div className="d-flex gap-2">
          <button className="btn btn-success flex-grow-1" onClick={handleStart}>
            Start
          </button>
          <button className="btn btn-warning flex-grow-1" disabled>
            Laps
          </button>
          <button className="btn btn-danger flex-grow-1" onClick={handleEnd}>
            End
          </button>
        </div>
      </div>

      <div className="input-group mb-3">
        <input
          type="text"
          id="stepDescription"
          className="form-control"
          placeholder="輸入階段性描述"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={() => alert('語音功能尚未整合')}
        >
          語音輸入
        </button>
        <button
          className="btn btn-primary"
          type="button"
          onClick={handleAddStep}
        >
          紀錄時間點
        </button>
      </div>

      <ol className="list-group list-group-numbered" ref={stepListRef}>
        {steps.map((step, i) => (
          <li
            key={i}
            className={`list-group-item ${step.type === 'start' ? 'list-group-item-success' : step.type === 'end' ? 'list-group-item-danger' : ''}`}
          >
            {step.text}
            {step.type === 'step' && !step.ended && (
              <button
                className="btn btn-sm btn-outline-danger float-end"
                onClick={() => handleEndSubStep(i)}
              >
                結束
              </button>
            )}
          </li>
        ))}
      </ol>
    </main>
  )
}
