import { useState, useEffect, useRef } from 'react'

const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState(null)
  const recognizerRef = useRef(null)
  const currentCallbackRef = useRef(null)
  // 用useState來接

  useEffect(() => {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) {
      setError('Speech recognition not supported')
      return
    }
    // 用途：先檢查瀏覽器是否支援語音識別(Chrome一定可以)
    // 實例化：
    const recognizer = new Recognition()
    recognizer.lang = 'zh-TW'
    recognizer.continuous = false
    recognizer.interimResults = false
    recognizer.maxAlternatives = 1
    console.log('[Speech] recognizer:', recognizer)

    recognizer.onstart = () => {
      console.log('[Speech] start')
      setIsListening(true)
    }
    recognizer.onsoundstart = () =>
      console.log('[Speech] soundstart (detect audio)')
    recognizer.onspeechstart = () =>
      console.log('[Speech] speechstart (detect voice)')
    recognizer.onspeechend = () => console.log('[Speech] speechend')
    recognizer.onsoundend = () => console.log('[Speech] soundend')
    recognizer.onaudioend = () => console.log('[Speech] audioend')
    recognizer.onend = () => {
      console.log('[Speech] end')
      setIsListening(false)
    }
    recognizer.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript
      if (transcript && currentCallbackRef.current) {
        currentCallbackRef.current(transcript)
      }
      currentCallbackRef.current = null
    }
    recognizer.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setError(`語音錯誤: ${event.error}`)
        console.error('[Speech] error:', event)
      }
      currentCallbackRef.current = null // 發生錯誤，重置回調
    }

    recognizerRef.current = recognizer

    // 清理函數：在元件卸載時停止識別
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stop()
      }
    }
  }, []) // 確保只執行一次以創建單例

  // 啟動語音識別的函數
  // 接受一個回調函數，用於處理該次識別的結果
  const startRecognition = (callback) => {
    if (!recognizerRef.current) {
      alert('語音功能尚未初始化或不支援')
      return
    }
    if (isListening) {
      recognizerRef.current.stop() // 如果正在聽，先停止
    }

    // 存儲當次回調
    currentCallbackRef.current = callback

    // 啟動識別
    try {
      recognizerRef.current.start()
      setError(null) // 清除錯誤狀態
    } catch (e) {
      // 處理重複啟動的錯誤 (可能發生在快速點擊時)
      console.warn('Recognition start error:', e.message)
    }
  }

  return { isListening, error, startRecognition }
}

export default useSpeechRecognition
