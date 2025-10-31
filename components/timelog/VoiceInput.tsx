// /components/timelog/VoiceInput.tsx

import React from 'react'
import useSpeechRecognition from '@/hooks/use-speech-recognition'
import { Button } from 'react-bootstrap'

export default function VoiceInput({
  onResult,
  targetInputRef, // 接收目標輸入框的 ref（可選）
  // eslint-disable-next-line no-unused-vars
  inputType, // 標記是 title 還是 desc (預留給未來使用)
  title = '🎤 語音輸入',
}: {
  // eslint-disable-next-line no-unused-vars
  onResult: (text: string) => void //告訴父組件跑的函式不需要回傳任何東西
  targetInputRef?: React.RefObject<HTMLInputElement | null> | null
  inputType?: 'title' | 'desc'
  title?: string
}) {
  const { isListening, error, startRecognition } = useSpeechRecognition()

  const handleStart = () => {
    // 確保目標輸入框聚焦
    if (targetInputRef?.current) {
      targetInputRef.current.focus()
    }

    // 啟動識別，並傳入處理結果的回調函數
    startRecognition((text: string) => {
      console.log('[VoiceInput] recognized text:', text)
      onResult(text) //API中得到值會往上傳給父組件
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
        aria-label={title}
        title={title}
      >
        {isListening ? '🔴 聆聽中...' : title}
      </Button>
      {error && (
        <small className="text-danger d-block mt-1">錯誤: {error}</small>
      )}
    </>
  )
}
