'use client'
import { useEffect, useState, useRef, useCallback } from 'react'

export default function VoiceInput(
  // eslint-disable-next-line
  { onResult, onVoiceToggle }: { 
    onResult: (text: string) => void
    onVoiceToggle?: (toggleFn: () => void) => void
  }
  //這裡的冒號 : 是 TypeScript 型別註解 (Type Annotation) 的語法。
  // onResult 是一個函數，接受字串參數並回傳 void (沒有回傳值)
  // 這個函數用來通知父組件語音識別的結果
  // onVoiceToggle 是一個可選函數，用來接收語音切換函數
  // onResult: (text: string) => void
  // onVoiceToggle?: (toggleFn: () => void) => void
) {
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState('')
  const recognizerRef = useRef<any>(null)

  useEffect(() => {
    // 檢查電腦裝置是否支援語音識別
    const Recognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!Recognition) {
      setError('您的瀏覽器不支援語音識別功能')
      return
    }

    // 檢查是否為 HTTPS 或 localhost
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      setError('語音識別需要 HTTPS 連線')
      return
    }

    setIsSupported(true)
    const recognizer = new Recognition()

    // 將 recognizer 實例存儲到 ref 中，方便除錯
    recognizerRef.current = recognizer

    // 設定語音識別參數
    recognizer.lang = 'zh-TW'
    recognizer.continuous = false
    recognizer.interimResults = false
    recognizer.maxAlternatives = 1

    // 成功識別
    recognizer.onresult = (event: any) => {
      setIsListening(false)
      const text = event.results?.[0]?.[0]?.transcript
      if (text) {
        onResult(text)
        setError('')
      }
    }

    // 開始聆聽
    recognizer.onstart = () => {
      setIsListening(true)
      setError('')
    }

    // 結束聆聽
    recognizer.onend = () => {
      setIsListening(false)
    }

    // 錯誤處理
    recognizer.onerror = (event: any) => {
      setIsListening(false)
      console.error('語音識別錯誤:', event.error)

      switch (event.error) {
        case 'not-allowed':
          setError('請允許麥克風權限以使用語音輸入')
          break
        case 'no-speech':
          setError('沒有偵測到語音，請再試一次')
          break
        case 'network':
          setError('網路連線問題，請檢查網路後重試')
          break
        case 'aborted':
          setError('語音輸入被中斷')
          break
        default:
          setError('語音輸入發生錯誤，5秒後請再試一次')
      }
    }

    // 清理函數
    return () => {
      recognizerRef.current = null
    }
  }, [onResult])

  // 處理語音切換
  const handleVoiceToggle = useCallback(async () => {
    try {
      if (isListening) {
        recognizerRef.current?.stop()
      } else {
        recognizerRef.current?.start()
      }
    } catch (err) {
      console.error('啟動語音識別失敗:', err)
      setError('無法啟動語音識別，請檢查麥克風權限')
    }
  }, [isListening])

  // 將語音切換函數傳遞給父組件
  useEffect(() => {
    if (onVoiceToggle) {
      onVoiceToggle(handleVoiceToggle)
    }
  }, [onVoiceToggle, handleVoiceToggle])

  // 顯示錯誤訊息
  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError('')
      }, 5000) // 5秒後自動清除錯誤訊息
      return () => clearTimeout(timeout)
    }
  }, [error])

  return (
    <>
      {error && (
        <div
          className="alert alert-warning alert-dismissible fade show position-fixed"
          style={{
            top: '20px',
            right: '20px',
            zIndex: 9999,
            maxWidth: '300px',
          }}
        >
          <small>{error}</small>
          <button
            type="button"
            className="btn-close"
            onClick={() => setError('')}
          ></button>
        </div>
      )}
    </>
  )
}