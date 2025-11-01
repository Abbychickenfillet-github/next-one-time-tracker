// /components/timelog/VoiceInput.tsx

import React, { useState, useEffect } from 'react'
import useSpeechRecognition from '@/hooks/use-speech-recognition'
import { Button } from 'react-bootstrap'

export default function VoiceInput({
  onResult,
  targetInputRef, // 接收目標輸入框的 ref（可選）
  inputType, // 標記是 title 還是 desc，用於決定按鈕文字
  title,
}: {
  // eslint-disable-next-line no-unused-vars
  onResult: (text: string, inputType?: 'title' | 'desc') => void //告訴父組件跑的函式不需要回傳任何東西
  targetInputRef?: React.RefObject<HTMLInputElement | null> | null
  inputType?: 'title' | 'desc'
  title?: string
}) {
  // 檢測是否為移動設備（屏幕寬度 < 768px）
  const [isMobile, setIsMobile] = useState(false)

  // Hooks 必須在條件判斷之前調用
  const { isListening, error, startRecognition } = useSpeechRecognition()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // 初始檢查
    if (typeof window !== 'undefined') {
      checkMobile()

      // 監聽窗口大小變化
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // 如果是移動設備，不渲染組件（避免語音識別彈出提示）
  if (isMobile) {
    return null
  }

  // 根據 inputType 決定按鈕文字，如果明確傳入了 title 則優先使用
  const buttonTitle =
    title ||
    (inputType === 'title'
      ? '🎤 活動名稱'
      : inputType === 'desc'
        ? '🎤 活動描述'
        : '🎤 語音輸入')

  const handleStart = () => {
    // 確保目標輸入框聚焦
    if (targetInputRef?.current) {
      targetInputRef.current.focus()
    }

    // 啟動識別，並傳入處理結果的回調函數
    startRecognition((text: string) => {
      console.log(
        '[VoiceInput] recognized text:',
        text,
        'inputType:',
        inputType
      )
      onResult(text, inputType) //API中得到值會往上傳給父組件，並傳遞 inputType
      // 在回調中，將游標移到文字最後
      setTimeout(() => {
        if (targetInputRef?.current) {
          const len = text.length
          targetInputRef.current.setSelectionRange(len, len)
        }
      }, 0)
    })
  }

  return (
    <>
      <Button
        variant={isListening ? 'danger' : 'outline-info'}
        onClick={handleStart}
        disabled={isListening}
        aria-label={buttonTitle}
        title={buttonTitle}
      >
        {isListening ? '🔴 聆聽中...' : buttonTitle}
      </Button>
      {error && (
        <small className="text-danger d-block mt-1">錯誤: {error}</small>
      )}
    </>
  )
}
